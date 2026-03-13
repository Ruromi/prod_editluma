import asyncio
import logging
import uuid
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.auth import AuthenticatedUser, get_current_user
from app.core.credits import charge_and_create_job
from app.core.config import settings
from app.core.processor import process_job_sync
from app.core.storage import generate_presigned_download_url, get_object_metadata

router = APIRouter(prefix="/api/ai", tags=["ai"])
logger = logging.getLogger(__name__)

_IMAGE_EXTENSIONS = {"jpg", "jpeg", "png", "webp", "gif", "heic"}
_ALLOWED_UPLOAD_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"}
_AI_PROCESSING_ERROR = "AI 작업을 처리하지 못했습니다. 잠시 후 다시 시도해주세요."


class EnhanceRequest(BaseModel):
    object_key: str
    prompt: Optional[str] = None


class GenerateRequest(BaseModel):
    prompt: str
    width: Optional[int] = 1024
    height: Optional[int] = 1024


class AiJobResponse(BaseModel):
    id: str
    filename: str
    object_key: str
    type: Literal["image"]
    mode: Literal["enhance", "generate"]
    prompt: Optional[str] = None
    original_prompt: Optional[str] = None
    enhanced_prompt: Optional[str] = None
    status: str
    created_at: str
    output_key: Optional[str] = None
    output_url: Optional[str] = None
    remaining_credits: Optional[int] = None
    credit_cost: Optional[int] = None


def _ensure_image_object_key(object_key: str, user_id: str) -> str:
    expected_prefix = f"uploads/{user_id}/"
    if not object_key.startswith(expected_prefix):
        raise HTTPException(status_code=403, detail="본인이 업로드한 이미지만 사용할 수 있습니다.")

    filename = object_key.rsplit("/", 1)[-1] or object_key
    ext = filename.rsplit(".", 1)[-1].lower()
    if ext not in _IMAGE_EXTENSIONS:
        raise HTTPException(status_code=400, detail="이미지 파일만 보정할 수 있습니다.")
    return filename


def _validate_uploaded_object(object_key: str) -> None:
    try:
        metadata = get_object_metadata(object_key)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="업로드한 이미지를 찾지 못했습니다.") from exc

    content_length = metadata.get("content_length")
    if isinstance(content_length, int) and content_length > settings.max_upload_file_size_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"업로드 가능한 최대 파일 크기는 {settings.max_upload_file_size_bytes // (1024 * 1024)}MB입니다.",
        )

    content_type = str(metadata.get("content_type") or "").lower()
    if content_type and content_type not in _ALLOWED_UPLOAD_TYPES:
        raise HTTPException(status_code=400, detail="지원하지 않는 이미지 형식입니다.")


def _build_response(payload: dict, update: dict) -> AiJobResponse:
    merged = {**payload, **update}
    output_url = None
    if merged.get("output_key"):
        try:
            output_url = generate_presigned_download_url(merged["output_key"])
        except Exception:
            pass
    return AiJobResponse(**{**merged, "output_url": output_url})


@router.post("/enhance", response_model=AiJobResponse, status_code=201)
async def enhance_image(
    body: EnhanceRequest,
    user: AuthenticatedUser = Depends(get_current_user),
):
    filename = _ensure_image_object_key(body.object_key, user.id)
    _validate_uploaded_object(body.object_key)
    try:
        payload = await charge_and_create_job(
            user=user,
            filename=filename,
            object_key=body.object_key,
            mode="enhance",
            prompt=body.prompt,
        )
        update = await asyncio.to_thread(process_job_sync, payload["id"])
        return _build_response(payload, update)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Enhance job failed for user %s", user.id)
        raise HTTPException(status_code=503, detail=_AI_PROCESSING_ERROR) from exc


@router.post("/generate", response_model=AiJobResponse, status_code=201)
async def generate_image(
    body: GenerateRequest,
    user: AuthenticatedUser = Depends(get_current_user),
):
    try:
        payload = await charge_and_create_job(
            user=user,
            filename=f"generated_{uuid.uuid4().hex[:8]}.png",
            object_key="",
            mode="generate",
            prompt=body.prompt,
        )
        update = await asyncio.to_thread(process_job_sync, payload["id"])
        return _build_response(payload, update)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Generate job failed for user %s", user.id)
        raise HTTPException(status_code=503, detail=_AI_PROCESSING_ERROR) from exc
