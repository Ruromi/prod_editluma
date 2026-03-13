from fastapi import APIRouter
import redis as redis_lib

from app.core.config import settings

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check():
    """Liveness probe."""
    checks: dict[str, str] = {"api": "ok"}

    # Redis ping
    try:
        r = redis_lib.from_url(settings.redis_url, socket_connect_timeout=1)
        r.ping()
        checks["redis"] = "ok"
    except Exception as e:
        checks["redis"] = f"error: {e}"

    # Supabase reachability (lightweight — just check config is set)
    if settings.supabase_url and settings.supabase_service_role_key:
        checks["supabase"] = "configured"
    else:
        checks["supabase"] = "not configured"

    overall = "ok" if all(v in ("ok", "configured") for v in checks.values()) else "degraded"
    return {"status": overall, "checks": checks}
