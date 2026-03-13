"""
Server-side Supabase client.
Uses service_role key — never expose to the client.
"""
import logging
from functools import lru_cache
from typing import Any

import httpx
from supabase import Client, create_client

from app.core.config import settings

logger = logging.getLogger(__name__)

# Cached after first probe — None means "not yet resolved"
_resolved_schema: str | None = None


@lru_cache(maxsize=1)
def get_supabase() -> Client:
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


def db_schema() -> str:
    """Returns the active Postgres schema.

    On first call the configured schema is probed with a lightweight query.
    If PostgREST returns PGRST106 (schema not exposed) the function
    transparently falls back to 'public' and caches that decision.
    """
    global _resolved_schema
    if _resolved_schema is not None:
        return _resolved_schema

    configured = settings.supabase_schema
    if configured == "public":
        _resolved_schema = "public"
        return _resolved_schema

    # Probe: a zero-row SELECT to check whether the schema is accessible.
    try:
        get_supabase().schema(configured).table("jobs").select("id").limit(0).execute()
        _resolved_schema = configured
        logger.info("Using Supabase schema: '%s'", configured)
    except Exception as exc:
        code = getattr(exc, "code", "") or ""
        msg = str(exc)
        if "PGRST106" in code or "PGRST106" in msg:
            logger.warning(
                "Schema '%s' is not exposed in PostgREST (PGRST106); "
                "falling back to 'public'.",
                configured,
            )
            _resolved_schema = "public"
        else:
            # Unknown error during probe — keep configured and let actual
            # operations surface the real error with proper context.
            logger.debug("Schema probe failed with non-PGRST106 error: %s", exc)
            _resolved_schema = configured

    return _resolved_schema


class RpcError(Exception):
    def __init__(self, status_code: int, payload: Any):
        self.status_code = status_code
        self.payload = payload
        super().__init__(str(payload))


async def call_rpc(function_name: str, params: dict[str, Any], schema: str | None = None) -> Any:
    active_schema = schema or db_schema()
    url = f"{settings.supabase_url}/rest/v1/rpc/{function_name}"
    headers = {
        "apikey": settings.supabase_service_role_key,
        "Authorization": f"Bearer {settings.supabase_service_role_key}",
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Accept-Profile": active_schema,
        "Content-Profile": active_schema,
    }

    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.post(url, headers=headers, json=params)

    if response.is_success:
        if not response.content:
            return None
        return response.json()

    try:
        payload: Any = response.json()
    except ValueError:
        payload = response.text

    raise RpcError(response.status_code, payload)
