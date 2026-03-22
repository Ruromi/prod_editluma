"""
Core processing task.
Image generation and enhancement worker.
"""
import logging
import os
import re

from celery import Task

from worker.celery_app import celery_app

logger = logging.getLogger(__name__)


def _groq_api_key() -> str:
    return os.getenv("GROQ_API_KEY", "").strip()


def _ideogram_base_url() -> str:
    return (os.getenv("IDEOGRAM_BASE_URL", "https://api.ideogram.ai") or "https://api.ideogram.ai").rstrip("/")


def _ideogram_timeout_seconds() -> float:
    raw = (os.getenv("IDEOGRAM_TIMEOUT_MS", "120000") or "120000").strip()
    try:
        timeout_ms = int(raw)
    except ValueError:
        logger.warning("Invalid IDEOGRAM_TIMEOUT_MS=%r — falling back to 120000ms", raw)
        timeout_ms = 120000
    return max(timeout_ms / 1000, 1)


def _contains_korean(text: str) -> bool:
    return bool(re.search(r"[\uac00-\ud7a3]", text))


def _call_groq_text(*, system_prompt: str, user_prompt: str, temperature: float = 0.2, max_tokens: int = 300) -> str | None:
    api_key = _groq_api_key()
    if not api_key:
        return None

    from groq import Groq

    client = Groq(api_key=api_key)
    resp = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=temperature,
        max_tokens=max_tokens,
    )
    content = resp.choices[0].message.content or ""
    text = content.strip()
    return " ".join(text.split()) if text else None


def _translate_to_english(prompt: str) -> str:
    """한국어가 포함된 프롬프트를 영어로 번역. 영어면 그대로 반환."""
    if not _contains_korean(prompt):
        return prompt

    translated = _call_groq_text(
        system_prompt=(
            "You translate image-generation prompts into English. "
            "Preserve every subject, action, attribute, relationship, and scene detail exactly. "
            "Do not add commentary. Output only the translated prompt."
        ),
        user_prompt=prompt,
        temperature=0.1,
        max_tokens=300,
    )
    if not translated:
        logger.warning("GROQ_API_KEY not set — using original prompt")
        return prompt
    logger.info("Translated prompt: %r → %r", prompt, translated)
    return translated


def _with_enhancement_guards(prompt: str) -> str:
    normalized = " ".join(prompt.split())
    if not normalized:
        return normalized

    lower = normalized.lower()
    extra_clauses: list[str] = []

    if not any(
        token in lower
        for token in (
            "same person",
            "same subject",
            "preserve facial identity",
            "keep facial identity",
            "original identity",
        )
    ):
        extra_clauses.append("same person, preserve facial identity")

    if not any(
        token in lower
        for token in (
            "same expression",
            "same pose",
            "same framing",
            "same background",
            "same hairstyle",
            "same clothing",
        )
    ):
        extra_clauses.append(
            "keep the same expression, pose, framing, hairstyle, clothing, and background unless a change is explicitly requested"
        )

    if not any(
        token in lower
        for token in (
            "natural skin texture",
            "realistic detail",
            "subtle retouch",
            "realistic finish",
        )
    ):
        extra_clauses.append("natural skin texture, realistic detail, subtle retouch, realistic finish")

    if not extra_clauses:
        return normalized

    return f"{normalized}. {'; '.join(extra_clauses)}."


def _rewrite_for_image_enhancement(prompt: str) -> str:
    raw_prompt = (prompt or "").strip()
    if not raw_prompt:
        raw_prompt = "subtle portrait cleanup, balanced light, natural skin detail, realistic finish"

    rewritten = _call_groq_text(
        system_prompt=(
            "You rewrite user requests into faithful English prompts for an image enhancement model. "
            "The source image already contains the person and scene. "
            "Preserve the same person, facial identity, expression, pose, camera angle, framing, hairstyle, clothing, and background unless the user explicitly asks to change one of them. "
            "Interpret vague requests as subtle retouching only. "
            "Focus on exposure, contrast, color balance, skin tone, detail recovery, and realistic portrait polish. "
            "Do not invent new scenes, props, outfits, accessories, makeup, or cinematic effects. "
            "Keep the prompt concise but specific. Output only one English prompt."
        ),
        user_prompt=raw_prompt,
        temperature=0.15,
        max_tokens=260,
    )

    if rewritten:
        logger.info("Rewritten enhancement prompt: %r → %r", raw_prompt, rewritten)
        return _with_enhancement_guards(rewritten)

    translated = _translate_to_english(raw_prompt)
    guarded = _with_enhancement_guards(translated)
    logger.info("Fallback enhancement prompt: %r → %r", raw_prompt, guarded)
    return guarded


def _get_supabase():
    """Lazy import to avoid circular deps and load .env first."""
    from supabase import create_client

    url = os.getenv("SUPABASE_URL", "")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    schema = os.getenv("SUPABASE_SCHEMA", "public")
    client = create_client(url, key)
    return client, schema


@celery_app.task(
    bind=True,
    name="worker.tasks.process.process_job",
    max_retries=3,
    default_retry_delay=10,
)
def process_job(self: Task, job_id: str) -> dict:
    """
    Entry point for image processing jobs.
    Reads job metadata from Supabase, dispatches to the correct pipeline,
    and updates status on completion/failure.
    """
    logger.info("Starting job %s", job_id)
    supabase, schema = _get_supabase()

    try:
        # Mark as processing
        supabase.schema(schema).table("jobs").update({"status": "processing", "error": None}).eq(
            "id", job_id
        ).execute()

        # Fetch job details
        result = (
            supabase.schema(schema)
            .table("jobs")
            .select("*")
            .eq("id", job_id)
            .single()
            .execute()
        )
        job = result.data
        if not job:
            raise ValueError(f"Job {job_id} not found in DB")

        mode = job.get("mode")

        # --- Pipeline dispatch ---
        if mode == "generate":
            output_key, enhanced_prompt = _generate_image(job)
            update_data = {
                "status": "done",
                "output_key": output_key,
                "original_prompt": job.get("prompt"),
                "enhanced_prompt": enhanced_prompt,
            }
        elif mode in (None, "enhance") and job.get("type", "image") == "image":
            output_key, enhanced_prompt = _enhance_image(job)
            update_data = {
                "status": "done",
                "output_key": output_key,
                "original_prompt": job.get("prompt"),
                "enhanced_prompt": enhanced_prompt,
            }
        else:
            raise ValueError(f"Unsupported job type: {job.get('type')}")

        # Mark done
        supabase.schema(schema).table("jobs").update(update_data).eq(
            "id", job_id
        ).execute()

        logger.info("Job %s completed", job_id)
        return {"job_id": job_id, "status": "done", "output_key": output_key}

    except Exception as exc:
        logger.exception("Job %s failed: %s", job_id, exc)
        max_retries = self.max_retries or 0
        if self.request.retries >= max_retries:
            supabase.schema(schema).table("jobs").update(
                {"status": "failed", "error": str(exc)}
            ).eq("id", job_id).execute()
            raise

        supabase.schema(schema).table("jobs").update(
            {"status": "pending", "error": str(exc)}
        ).eq("id", job_id).execute()
        raise self.retry(exc=exc)


# ---------------------------------------------------------------------------
# Image pipelines
# ---------------------------------------------------------------------------

def _enhance_image(job: dict) -> tuple[str, str]:
    """Image enhance via Ideogram V3 remix with character reference for face preservation.

    The original photo is sent as both the remix base image AND as a
    character_reference_image so that Ideogram preserves the person's facial
    identity while following conservative cleanup instructions.

    Returns:
        (output_key, model_prompt)
    """
    import uuid as _uuid
    import os
    import httpx
    import boto3
    from botocore.config import Config

    api_key = os.getenv("IDEOGRAM_API_KEY", "")
    if not api_key:
        raise RuntimeError("IDEOGRAM_API_KEY가 설정되지 않았습니다.")

    raw_prompt = (job.get("prompt") or "").strip()
    prompt = _rewrite_for_image_enhancement(raw_prompt)

    # 1. S3에서 원본 이미지 다운로드
    bucket = os.getenv("STORAGE_BUCKET", "editluma-uploads")
    endpoint = os.getenv("STORAGE_ENDPOINT_URL") or None
    region = os.getenv("STORAGE_REGION", "ap-northeast-2")
    access_key = os.getenv("STORAGE_ACCESS_KEY", "")
    secret_key = os.getenv("STORAGE_SECRET_KEY", "")

    kwargs: dict = dict(
        region_name=region,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        config=Config(signature_version="s3v4"),
    )
    if endpoint:
        kwargs["endpoint_url"] = endpoint

    s3 = boto3.client("s3", **kwargs)
    obj = s3.get_object(Bucket=bucket, Key=job["object_key"])
    image_bytes = obj["Body"].read()
    content_type = obj.get("ContentType", "image/jpeg")

    logger.info("Calling Ideogram V3 remix (character ref) for job %s prompt=%r", job["id"], prompt)

    # 2. Ideogram V3 remix API 호출
    #    - image: remix 베이스 (원본 사진)
    #    - character_reference_images: 얼굴/신원 고정용 (같은 사진)
    #    - image_weight: 원본 사진 구도/인상을 더 강하게 유지
    with httpx.Client(timeout=_ideogram_timeout_seconds()) as client:
        resp = client.post(
            f"{_ideogram_base_url()}/v1/ideogram-v3/remix",
            headers={"Api-Key": api_key},
            data={
                "prompt": prompt,
                "image_weight": "70",
                "rendering_speed": "DEFAULT",
                "magic_prompt": "OFF",
                "aspect_ratio": "1x1",
                "num_images": "1",
            },
            files=[
                ("image", ("source.jpg", image_bytes, content_type)),
                ("character_reference_images", ("face_ref.jpg", image_bytes, content_type)),
            ],
        )
        try:
            resp.raise_for_status()
        except httpx.HTTPStatusError as exc:
            body = exc.response.text[:300]
            raise RuntimeError(f"Ideogram V3 remix 오류 ({exc.response.status_code}): {body}") from exc

        data = resp.json()
        items = data.get("data") or []
        if not items:
            raise RuntimeError("Ideogram V3 remix API가 이미지를 반환하지 않았습니다.")

        image_url: str = items[0]["url"]

        img_resp = client.get(image_url)
        img_resp.raise_for_status()
        result_bytes = img_resp.content

    # 3. 결과 S3 업로드
    output_key = f"outputs/enhanced/{_uuid.uuid4()}.png"
    _upload_bytes_to_s3(output_key, result_bytes, "image/png")
    logger.info("Uploaded enhanced image to %s for job %s", output_key, job["id"])
    return output_key, prompt


def _enhance_prompt_locally(prompt: str) -> str:
    """Deterministic local prompt enhancement when the API doesn't provide one."""
    qualifiers = ["high quality", "detailed", "sharp", "professional", "4k", "8k"]
    p = prompt.strip()
    if not any(q in p.lower() for q in qualifiers):
        p = f"{p}, high quality, detailed, professional"
    return p


def _generate_image(job: dict) -> tuple[str, str]:
    """Generate pipeline: text prompt → Ideogram API → S3 upload.

    Returns:
        (output_key, enhanced_prompt)
    """
    import uuid as _uuid
    import os
    import httpx
    import boto3
    from botocore.config import Config

    prompt = _translate_to_english((job.get("prompt") or "").strip())
    if not prompt:
        raise ValueError("생성 프롬프트가 없습니다.")

    api_key = os.getenv("IDEOGRAM_API_KEY", "")
    if not api_key:
        logger.error("IDEOGRAM_API_KEY not found — set it in api/.env or .env.shared (parent of repo)")
        raise RuntimeError("IDEOGRAM_API_KEY가 설정되지 않았습니다.")

    model = os.getenv("IDEOGRAM_MODEL", "V_2")

    logger.info("Calling Ideogram for job %s prompt=%r model=%s", job["id"], prompt, model)

    with httpx.Client(timeout=_ideogram_timeout_seconds()) as client:
        # 1. Request generation
        resp = client.post(
            f"{_ideogram_base_url()}/generate",
            headers={"Api-Key": api_key, "Content-Type": "application/json"},
            json={
                "image_request": {
                    "prompt": prompt,
                    "model": model,
                    "aspect_ratio": "ASPECT_1_1",
                }
            },
        )
        try:
            resp.raise_for_status()
        except httpx.HTTPStatusError as exc:
            body = exc.response.text[:300]
            raise RuntimeError(
                f"Ideogram API 오류 ({exc.response.status_code}): {body}"
            ) from exc

        data = resp.json()
        items = data.get("data") or []
        if not items:
            raise RuntimeError("Ideogram API가 이미지를 반환하지 않았습니다.")

        item = items[0]
        image_url: str = item["url"]
        # Ideogram may return a rewritten/enhanced prompt in the response
        ideogram_prompt = (item.get("prompt") or "").strip()
        enhanced_prompt = ideogram_prompt if ideogram_prompt else _enhance_prompt_locally(prompt)
        logger.info("Ideogram returned URL for job %s", job["id"])

        # 2. Download image bytes
        img_resp = client.get(image_url)
        try:
            img_resp.raise_for_status()
        except httpx.HTTPStatusError as exc:
            raise RuntimeError(
                f"생성 이미지 다운로드 실패 ({exc.response.status_code})"
            ) from exc
        image_bytes = img_resp.content

    # 3. Upload to S3
    output_key = f"outputs/generated/{_uuid.uuid4()}.png"
    _upload_bytes_to_s3(output_key, image_bytes, "image/png")
    logger.info("Uploaded generated image to %s for job %s", output_key, job["id"])
    return output_key, enhanced_prompt


def _upload_bytes_to_s3(object_key: str, data: bytes, content_type: str) -> None:
    """Upload raw bytes to the configured S3-compatible bucket."""
    import os
    import boto3
    from botocore.config import Config

    bucket = os.getenv("STORAGE_BUCKET", "editluma-uploads")
    endpoint = os.getenv("STORAGE_ENDPOINT_URL") or None
    region = os.getenv("STORAGE_REGION", "ap-northeast-2")
    access_key = os.getenv("STORAGE_ACCESS_KEY", "")
    secret_key = os.getenv("STORAGE_SECRET_KEY", "")

    kwargs: dict = dict(
        region_name=region,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        config=Config(signature_version="s3v4"),
    )
    if endpoint:
        kwargs["endpoint_url"] = endpoint

    s3 = boto3.client("s3", **kwargs)
    s3.put_object(Bucket=bucket, Key=object_key, Body=data, ContentType=content_type)
