import logging

from fastapi import HTTPException

from app.core.config import settings
from app.core.storage import delete_object, get_object_metadata

logger = logging.getLogger(__name__)

ALLOWED_UPLOAD_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/heic": ".heic",
    "image/heif": ".heic",
}

ALLOWED_IMAGE_EXTENSIONS = {"jpg", "jpeg", "png", "webp", "gif", "heic"}


def ensure_owned_upload_key(object_key: str, user_id: str) -> None:
    expected_prefix = f"uploads/{user_id}/"
    if object_key and not object_key.startswith(expected_prefix):
        raise HTTPException(status_code=403, detail="본인이 업로드한 이미지만 사용할 수 있습니다.")


def ensure_image_object_key(object_key: str, user_id: str) -> str:
    ensure_owned_upload_key(object_key, user_id)
    filename = object_key.rsplit("/", 1)[-1] or object_key
    ext = filename.rsplit(".", 1)[-1].lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(status_code=400, detail="이미지 파일만 보정할 수 있습니다.")
    return filename


def _cleanup_invalid_upload(object_key: str) -> None:
    if not object_key:
        return

    try:
        delete_object(object_key)
    except Exception:
        logger.warning("Failed to delete invalid upload %s", object_key, exc_info=True)


def validate_uploaded_object(object_key: str, *, cleanup_invalid: bool = False) -> None:
    try:
        metadata = get_object_metadata(object_key)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="업로드한 이미지를 찾지 못했습니다.") from exc

    content_length = metadata.get("content_length")
    if isinstance(content_length, int) and content_length > settings.max_upload_file_size_bytes:
        if cleanup_invalid:
            _cleanup_invalid_upload(object_key)
        raise HTTPException(
            status_code=400,
            detail=f"업로드 가능한 최대 파일 크기는 {settings.max_upload_file_size_bytes // (1024 * 1024)}MB입니다.",
        )

    content_type = str(metadata.get("content_type") or "").lower()
    if content_type and content_type not in ALLOWED_UPLOAD_TYPES:
        if cleanup_invalid:
            _cleanup_invalid_upload(object_key)
        raise HTTPException(status_code=400, detail="지원하지 않는 이미지 형식입니다.")
