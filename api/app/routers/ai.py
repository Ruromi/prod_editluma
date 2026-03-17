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
from app.core.storage import generate_presigned_download_url
from app.core.uploads import ensure_image_object_key, validate_uploaded_object

router = APIRouter(prefix="/api/ai", tags=["ai"])
logger = logging.getLogger(__name__)

_AI_PROCESSING_ERROR = "AI 작업을 처리하지 못했습니다. 잠시 후 다시 시도해주세요."


def _normalize_prompt(prompt: str | None) -> str | None:
    if prompt is None:
        return None

    normalized = prompt.strip()
    if not normalized:
        return None

    if len(normalized) > settings.max_prompt_length_chars:
        raise HTTPException(
            status_code=400,
            detail=f"프롬프트는 최대 {settings.max_prompt_length_chars}자까지 입력할 수 있습니다.",
        )

    return normalized


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
    filename = ensure_image_object_key(body.object_key, user.id)
    validate_uploaded_object(body.object_key, cleanup_invalid=True)
    prompt = _normalize_prompt(body.prompt)
    try:
        payload = await charge_and_create_job(
            user=user,
            filename=filename,
            object_key=body.object_key,
            mode="enhance",
            prompt=prompt,
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
    prompt = _normalize_prompt(body.prompt)
    if not prompt:
        raise HTTPException(status_code=400, detail="프롬프트를 입력해주세요.")

    try:
        payload = await charge_and_create_job(
            user=user,
            filename=f"generated_{uuid.uuid4().hex[:8]}.png",
            object_key="",
            mode="generate",
            prompt=prompt,
        )
        update = await asyncio.to_thread(process_job_sync, payload["id"])
        return _build_response(payload, update)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Generate job failed for user %s", user.id)
        raise HTTPException(status_code=503, detail=_AI_PROCESSING_ERROR) from exc
