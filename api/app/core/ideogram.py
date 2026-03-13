"""
Ideogram API adapter.
Calls POST /generate, downloads the result image, and returns raw bytes.

Docs: https://developer.ideogram.ai/api-reference/api-reference/generate
"""
import httpx

from app.core.config import settings


def _base_url() -> str:
    return (settings.ideogram_base_url or "https://api.ideogram.ai").rstrip("/")


def _timeout_seconds() -> float:
    return max(settings.ideogram_timeout_ms / 1000, 1)


def _aspect_ratio(width: int, height: int) -> str:
    """Map pixel dimensions to the nearest Ideogram aspect ratio token."""
    ratio = width / max(height, 1)
    if ratio >= 1.7:
        return "ASPECT_16_9"
    if ratio >= 1.3:
        return "ASPECT_4_3"
    if ratio <= 0.6:
        return "ASPECT_9_16"
    if ratio <= 0.8:
        return "ASPECT_3_4"
    return "ASPECT_1_1"


def generate_image_bytes(prompt: str, width: int = 1024, height: int = 1024) -> bytes:
    """
    Generate an image via Ideogram and return the raw PNG bytes.

    Raises:
        RuntimeError: when API key is missing or Ideogram returns an error.
        httpx.HTTPStatusError: on unexpected HTTP failures.
    """
    if not settings.ideogram_api_key:
        raise RuntimeError("IDEOGRAM_API_KEY가 설정되지 않았습니다.")

    aspect = _aspect_ratio(width, height)
    payload = {
        "image_request": {
            "prompt": prompt,
            "model": settings.ideogram_model,
            "aspect_ratio": aspect,
        }
    }

    with httpx.Client(timeout=_timeout_seconds()) as client:
        # 1. Generate
        resp = client.post(
            f"{_base_url()}/generate",
            headers={
                "Api-Key": settings.ideogram_api_key,
                "Content-Type": "application/json",
            },
            json=payload,
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

        image_url: str = items[0]["url"]

        # 2. Download image bytes from CDN
        img_resp = client.get(image_url)
        try:
            img_resp.raise_for_status()
        except httpx.HTTPStatusError as exc:
            raise RuntimeError(
                f"생성된 이미지를 다운로드할 수 없습니다 ({exc.response.status_code})"
            ) from exc

        return img_resp.content
