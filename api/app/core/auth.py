import logging
from typing import Optional

import httpx
from fastapi import Header, HTTPException
from pydantic import BaseModel

from app.core.config import settings
from app.core.supabase import db_schema, get_supabase

logger = logging.getLogger(__name__)


class AuthenticatedUser(BaseModel):
    id: str
    email: Optional[str] = None


def _is_deleted_account_profile(user_id: str) -> bool:
    try:
      result = (
          get_supabase()
          .schema(db_schema())
          .table("profiles")
          .select("account_status, deleted_at")
          .eq("user_id", user_id)
          .limit(1)
          .execute()
      )
    except Exception as exc:
        code = getattr(exc, "code", "") or ""
        message = str(exc)
        if "PGRST205" in code or "profiles" in message or "account_status" in message or "deleted_at" in message:
            return False
        logger.warning("Failed to verify profile status for user %s: %s", user_id, exc)
        return False

    rows = result.data or []
    if not rows:
        return False

    profile = rows[0] or {}
    return profile.get("account_status") == "deleted" or bool(profile.get("deleted_at"))


async def get_current_user(authorization: str | None = Header(default=None)) -> AuthenticatedUser:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="로그인이 필요합니다.")

    token = authorization.removeprefix("Bearer ").strip()
    if not token:
        raise HTTPException(status_code=401, detail="로그인이 필요합니다.")

    headers = {
        "apikey": settings.supabase_service_role_key,
        "Authorization": f"Bearer {token}",
    }

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(f"{settings.supabase_url}/auth/v1/user", headers=headers)
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=503, detail="인증 서버에 연결할 수 없습니다.") from exc

    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="세션이 만료되었습니다. 다시 로그인하세요.")

    payload = response.json()
    user_id = payload.get("id")
    if not user_id:
        raise HTTPException(status_code=401, detail="유효하지 않은 사용자입니다.")

    app_metadata = payload.get("app_metadata") or {}
    user_metadata = payload.get("user_metadata") or {}
    if (
        app_metadata.get("account_status") == "deleted"
        or user_metadata.get("account_status") == "deleted"
        or app_metadata.get("deleted_at")
        or user_metadata.get("deleted_at")
        or _is_deleted_account_profile(user_id)
    ):
        raise HTTPException(status_code=403, detail="탈퇴 처리된 계정입니다.")

    return AuthenticatedUser(id=user_id, email=payload.get("email"))
