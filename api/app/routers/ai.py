import uuid
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.auth import AuthenticatedUser, get_current_user
from app.core.credits import charge_and_create_job
from worker.tasks.process import process_job

router = APIRouter(prefix="/api/ai", tags=["ai"])

_IMAGE_EXTENSIONS = {"jpg", "jpeg", "png", "webp", "gif", "heic"}


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


_AI_START_ERROR = "AI 작업을 시작하지 못했습니다. 잠시 후 다시 시도해주세요."


def _ensure_image_object_key(object_key: str) -> str:
    filename = object_key.rsplit("/", 1)[-1] or object_key
    ext = filename.rsplit(".", 1)[-1].lower()
    if ext not in _IMAGE_EXTENSIONS:
        raise HTTPException(status_code=400, detail="이미지 파일만 보정할 수 있습니다.")
    return filename


@router.post("/enhance", response_model=AiJobResponse, status_code=201)
async def enhance_image(
    body: EnhanceRequest,
    user: AuthenticatedUser = Depends(get_current_user),
):
    filename = _ensure_image_object_key(body.object_key)
    try:
        payload = await charge_and_create_job(
            user=user,
            filename=filename,
            object_key=body.object_key,
            mode="enhance",
            prompt=body.prompt,
        )
        process_job.delay(payload["id"])
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=503, detail=_AI_START_ERROR) from exc
    return AiJobResponse(**payload)


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
        process_job.delay(payload["id"])
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=503, detail=_AI_START_ERROR) from exc
    return AiJobResponse(**payload)
