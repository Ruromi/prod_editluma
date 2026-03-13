import mimetypes
import re
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.auth import AuthenticatedUser, get_current_user
from app.core.config import settings
from app.core.storage import generate_presigned_upload_url

router = APIRouter(prefix="/api/upload", tags=["upload"])

ALLOWED_UPLOAD_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/heic": ".heic",
    "image/heif": ".heic",
}


def _sanitize_filename(filename: str, content_type: str) -> str:
    base_name = filename.replace("\\", "/").rsplit("/", 1)[-1].strip()
    parsed = Path(base_name)
    stem = re.sub(r"[^A-Za-z0-9._-]+", "_", parsed.stem, flags=re.ASCII).strip("._-")
    suffix = ALLOWED_UPLOAD_TYPES.get(content_type, "")

    if not suffix:
        guessed_ext = mimetypes.guess_extension(content_type or "", strict=False) or ""
        suffix = guessed_ext.lower()

    if suffix and not suffix.startswith("."):
        suffix = f".{suffix}"

    safe_stem = stem or "upload"
    return f"{safe_stem}{suffix}"


class PresignRequest(BaseModel):
    filename: str
    content_type: str
    file_size: int


class PresignResponse(BaseModel):
    upload_url: str
    object_key: str


@router.post("/presign", response_model=PresignResponse)
async def presign_upload(
    body: PresignRequest,
    user: AuthenticatedUser = Depends(get_current_user),
):
    if body.content_type not in ALLOWED_UPLOAD_TYPES:
        raise HTTPException(status_code=400, detail="이미지 파일만 업로드할 수 있습니다.")

    if body.file_size <= 0:
        raise HTTPException(status_code=400, detail="업로드할 파일 크기가 올바르지 않습니다.")

    if body.file_size > settings.max_upload_file_size_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"업로드 가능한 최대 파일 크기는 {settings.max_upload_file_size_bytes // (1024 * 1024)}MB입니다.",
        )

    safe_name = _sanitize_filename(body.filename, body.content_type)
    object_key = f"uploads/{user.id}/{uuid.uuid4()}/{safe_name}"
    upload_url = generate_presigned_upload_url(object_key, body.content_type)
    return PresignResponse(upload_url=upload_url, object_key=object_key)
