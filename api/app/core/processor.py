"""Synchronous image processing logic (Celery 없이 FastAPI에서 직접 실행)."""
import logging
import mimetypes
import os
import re
import uuid as _uuid

import boto3
import httpx
from botocore.config import Config

logger = logging.getLogger(__name__)


def _guess_image_content_type(object_key: str, fallback: str = "image/jpeg") -> str:
    guessed, _ = mimetypes.guess_type(object_key)
    if guessed and guessed.startswith("image/"):
        return guessed
    return fallback


def _groq_api_key() -> str:
    return os.getenv("GROQ_API_KEY", "").strip()


def _ideogram_base_url() -> str:
    return (os.getenv("IDEOGRAM_BASE_URL", "https://api.ideogram.ai") or "https://api.ideogram.ai").rstrip("/")


def _ideogram_timeout_seconds() -> float:
    raw = (os.getenv("IDEOGRAM_TIMEOUT_MS", "120000") or "120000").strip()
    try:
        timeout_ms = int(raw)
    except ValueError:
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


def translate_to_english(prompt: str) -> str:
    """한국어 포함 프롬프트를 영어로 번역. 영어면 그대로 반환."""
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


def _with_generation_guards(prompt: str) -> str:
    normalized = " ".join(prompt.split())
    if not normalized:
        return normalized

    extra_clauses: list[str] = []
    lower = normalized.lower()

    if not any(
        token in lower
        for token in (
            "full body",
            "full-body",
            "wide shot",
            "medium-wide",
            "all visible",
            "both visible",
            "fully visible in frame",
            "two subjects",
        )
    ):
        extra_clauses.append("medium-wide composition with all main subjects fully visible in frame")

    if any(token in lower for token in ("outer space", "space", "universe", "galaxy", "cosmos")) and not any(
        token in lower for token in ("spacesuit", "astronaut", "magical", "fantasy", "angel", "wings")
    ):
        extra_clauses.append("realistic outer-space details with the human subject wearing a sleek astronaut suit")

    if not extra_clauses:
        return normalized

    return f"{normalized}. {'; '.join(extra_clauses)}."


def rewrite_for_image_generation(prompt: str) -> str:
    """사용자 프롬프트를 이미지 생성에 더 적합한 영문 프롬프트로 보정."""
    raw_prompt = (prompt or "").strip()
    if not raw_prompt:
        return raw_prompt

    rewritten = _call_groq_text(
        system_prompt=(
            "You rewrite user prompts into faithful English prompts for an image generation model. "
            "Preserve every concrete subject, count, action, relationship, attribute, and setting. "
            "Never drop or replace a primary subject. "
            "If there are multiple main subjects, make it explicit that all of them are clearly visible in frame. "
            "Prefer a medium-wide or wide composition when multiple subjects are involved to avoid close-up crops. "
            "If a realistic outer-space setting is implied and no fantasy style is specified, include an appropriate spacesuit or astronaut gear for the human subject. "
            "Keep the prompt concise but specific. Output only one English prompt."
        ),
        user_prompt=raw_prompt,
        temperature=0.15,
        max_tokens=360,
    )

    if rewritten:
        logger.info("Rewritten generation prompt: %r → %r", raw_prompt, rewritten)
        return _with_generation_guards(rewritten)

    translated = translate_to_english(raw_prompt)
    guarded = _with_generation_guards(translated)
    logger.info("Fallback generation prompt: %r → %r", raw_prompt, guarded)
    return guarded


def _upload_bytes_to_s3(object_key: str, data: bytes, content_type: str) -> None:
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


def run_generate(job: dict) -> tuple[str, str]:
    """텍스트 프롬프트 → Ideogram 생성 → S3 업로드. (output_key, enhanced_prompt) 반환."""
    prompt = rewrite_for_image_generation((job.get("prompt") or "").strip())
    if not prompt:
        raise ValueError("생성 프롬프트가 없습니다.")

    api_key = os.getenv("IDEOGRAM_API_KEY", "")
    if not api_key:
        raise RuntimeError("IDEOGRAM_API_KEY가 설정되지 않았습니다.")

    model = os.getenv("IDEOGRAM_MODEL", "V_2")
    logger.info("Calling Ideogram for job %s prompt=%r model=%s", job["id"], prompt, model)

    with httpx.Client(timeout=_ideogram_timeout_seconds()) as client:
        resp = client.post(
            f"{_ideogram_base_url()}/generate",
            headers={"Api-Key": api_key, "Content-Type": "application/json"},
            json={
                "image_request": {
                    "prompt": prompt,
                    "model": model,
                    "aspect_ratio": "ASPECT_1_1",
                    "magic_prompt_option": "OFF",
                    "style_type": "AUTO",
                }
            },
        )
        try:
            resp.raise_for_status()
        except httpx.HTTPStatusError as exc:
            raise RuntimeError(f"Ideogram API 오류 ({exc.response.status_code}): {exc.response.text[:300]}") from exc

        data = resp.json()
        items = data.get("data") or []
        if not items:
            raise RuntimeError("Ideogram API가 이미지를 반환하지 않았습니다.")

        item = items[0]
        image_url: str = item["url"]
        enhanced_prompt = prompt

        img_resp = client.get(image_url)
        img_resp.raise_for_status()
        image_bytes = img_resp.content

    output_key = f"outputs/generated/{_uuid.uuid4()}.png"
    _upload_bytes_to_s3(output_key, image_bytes, "image/png")
    logger.info("Uploaded generated image to %s for job %s", output_key, job["id"])
    return output_key, enhanced_prompt


def run_enhance(job: dict) -> tuple[str, str]:
    """원본 이미지 → Ideogram V3 remix → S3 업로드. (output_key, translated_prompt) 반환."""
    api_key = os.getenv("IDEOGRAM_API_KEY", "")
    if not api_key:
        raise RuntimeError("IDEOGRAM_API_KEY가 설정되지 않았습니다.")

    raw_prompt = (job.get("prompt") or "high quality, detailed, professional").strip()
    prompt = translate_to_english(raw_prompt)

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
    if not isinstance(content_type, str) or not content_type.startswith("image/"):
        content_type = _guess_image_content_type(job["object_key"])

    logger.info("Calling Ideogram V3 remix for job %s prompt=%r", job["id"], prompt)

    with httpx.Client(timeout=_ideogram_timeout_seconds()) as client:
        resp = client.post(
            f"{_ideogram_base_url()}/v1/ideogram-v3/remix",
            headers={"Api-Key": api_key},
            data={
                "prompt": prompt,
                "image_weight": "35",
                "rendering_speed": "DEFAULT",
                "magic_prompt": "ON",
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
            raise RuntimeError(f"Ideogram V3 remix 오류 ({exc.response.status_code}): {exc.response.text[:300]}") from exc

        data = resp.json()
        items = data.get("data") or []
        if not items:
            raise RuntimeError("Ideogram V3 remix API가 이미지를 반환하지 않았습니다.")

        img_resp = client.get(items[0]["url"])
        img_resp.raise_for_status()
        result_bytes = img_resp.content

    output_key = f"outputs/enhanced/{_uuid.uuid4()}.png"
    _upload_bytes_to_s3(output_key, result_bytes, "image/png")
    logger.info("Uploaded enhanced image to %s for job %s", output_key, job["id"])
    return output_key, prompt


def process_job_sync(job_id: str) -> dict:
    """잡을 동기적으로 처리하고 업데이트된 필드를 반환."""
    from supabase import create_client

    url = os.getenv("SUPABASE_URL", "")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    schema = os.getenv("SUPABASE_SCHEMA", "public")
    supabase = create_client(url, key)

    supabase.schema(schema).table("jobs").update({"status": "processing", "error": None}).eq("id", job_id).execute()

    result = supabase.schema(schema).table("jobs").select("*").eq("id", job_id).single().execute()
    job = result.data
    if not job:
        raise RuntimeError(f"Job {job_id} not found")

    try:
        mode = job.get("mode")
        if mode == "generate":
            output_key, enhanced_prompt = run_generate(job)
        else:
            output_key, enhanced_prompt = run_enhance(job)

        update_data = {
            "status": "done",
            "output_key": output_key,
            "original_prompt": job.get("prompt"),
            "enhanced_prompt": enhanced_prompt,
        }
        supabase.schema(schema).table("jobs").update(update_data).eq("id", job_id).execute()
        logger.info("Job %s completed", job_id)
        return update_data

    except Exception as exc:
        logger.exception("Job %s failed: %s", job_id, exc)
        supabase.schema(schema).table("jobs").update({"status": "failed", "error": str(exc)}).eq("id", job_id).execute()
        raise
