from typing import Optional

import httpx
from fastapi import Header, HTTPException
from pydantic import BaseModel

from app.core.config import settings


class AuthenticatedUser(BaseModel):
    id: str
    email: Optional[str] = None


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

    return AuthenticatedUser(id=user_id, email=payload.get("email"))
