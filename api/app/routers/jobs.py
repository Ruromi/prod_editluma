from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.auth import AuthenticatedUser, get_current_user
from app.core.credits import charge_and_create_job
from app.core.storage import generate_presigned_download_url
from app.core.supabase import db_schema, get_supabase
from worker.tasks.process import process_job

router = APIRouter(prefix="/api/jobs", tags=["jobs"])

JobStatus = Literal["pending", "processing", "done", "failed"]
_IMAGE_EXTENSIONS = {"jpg", "jpeg", "png", "webp", "gif", "heic"}
_DB_ERROR_MSG = "데이터베이스 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
_JOB_START_ERROR = "AI 작업을 시작하지 못했습니다. 잠시 후 다시 시도해주세요."


class CreateJobRequest(BaseModel):
    object_key: str
    filename: str
    prompt: Optional[str] = None


class JobResponse(BaseModel):
    id: str
    filename: str
    object_key: str
    type: Literal["image"]
    mode: Optional[str] = None
    prompt: Optional[str] = None
    original_prompt: Optional[str] = None
    enhanced_prompt: Optional[str] = None
    status: JobStatus
    created_at: str
    output_key: Optional[str] = None
    output_url: Optional[str] = None
    remaining_credits: Optional[int] = None
    credit_cost: Optional[int] = None


def _make_response(row: dict) -> JobResponse:
    output_url: Optional[str] = None
    if row.get("output_key"):
        try:
            output_url = generate_presigned_download_url(row["output_key"])
        except Exception:
            pass
    return JobResponse(**{**row, "output_url": output_url})


def _ensure_image_filename(filename: str) -> None:
    ext = filename.rsplit(".", 1)[-1].lower()
    if ext not in _IMAGE_EXTENSIONS:
        raise HTTPException(status_code=400, detail="이미지 파일만 처리할 수 있습니다.")


@router.post("", response_model=JobResponse, status_code=201, deprecated=True)
async def create_job(
    body: CreateJobRequest,
    user: AuthenticatedUser = Depends(get_current_user),
):
    _ensure_image_filename(body.filename)
    try:
        payload = await charge_and_create_job(
            user=user,
            filename=body.filename,
            object_key=body.object_key,
            mode="enhance",
            prompt=body.prompt,
        )
        process_job.delay(payload["id"])
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=503, detail=_JOB_START_ERROR) from exc
    return JobResponse(**payload)


@router.get("", response_model=list[JobResponse])
async def list_jobs(user: AuthenticatedUser = Depends(get_current_user)):
    supabase = get_supabase()
    try:
        result = (
            supabase.schema(db_schema())
            .table("jobs")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", desc=True)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(status_code=503, detail=_DB_ERROR_MSG) from exc

    return [_make_response(r) for r in (result.data or [])]


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(job_id: str, user: AuthenticatedUser = Depends(get_current_user)):
    supabase = get_supabase()
    try:
        result = (
            supabase.schema(db_schema())
            .table("jobs")
            .select("*")
            .eq("id", job_id)
            .eq("user_id", user.id)
            .single()
            .execute()
        )
    except Exception as exc:
        raise HTTPException(status_code=503, detail=_DB_ERROR_MSG) from exc

    if not result.data:
        raise HTTPException(status_code=404, detail="작업을 찾을 수 없습니다.")
    return _make_response(result.data)
