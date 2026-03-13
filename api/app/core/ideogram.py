"""
Ideogram API adapter.
Calls Ideogram 3.0 generate, downloads the result image, and returns raw bytes.

Docs:
- https://developer.ideogram.ai/api-reference/api-reference/generate-v3
- https://developer.ideogram.ai/ideogram-api/api-overview
"""
import httpx

from app.core.config import settings


def _base_url() -> str:
    return (settings.ideogram_base_url or "https://api.ideogram.ai").rstrip("/")


def _timeout_seconds() -> float:
    return max(settings.ideogram_timeout_ms / 1000, 1)


def normalize_rendering_speed(value: str | None) -> str:
    normalized = (value or "").strip().lower().replace("_", "-").replace(" ", "-")
    if not normalized:
        return "DEFAULT"

    if normalized in {
        "flash",
        "3-flash",
        "3.0-flash",
        "v3-flash",
        "v-3-flash",
    }:
        return "FLASH"

    if normalized in {
        "turbo",
        "3-turbo",
        "3.0-turbo",
        "v3-turbo",
        "v-3-turbo",
        "v1-turbo",
        "v-1-turbo",
        "v2-turbo",
        "v-2-turbo",
        "v2a-turbo",
        "v-2a-turbo",
    }:
        return "TURBO"

    if normalized in {
        "quality",
        "3-quality",
        "3.0-quality",
        "v3-quality",
        "v-3-quality",
    }:
        return "QUALITY"

    return "DEFAULT"


def _aspect_ratio(width: int, height: int) -> str:
    """Map pixel dimensions to the nearest Ideogram 3.0 aspect ratio token."""
    ratio = width / max(height, 1)
    if ratio >= 1.7:
        return "16x9"
    if ratio >= 1.3:
        return "4x3"
    if ratio <= 0.6:
        return "9x16"
    if ratio <= 0.8:
        return "3x4"
    return "1x1"


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
    rendering_speed = normalize_rendering_speed(settings.ideogram_model)

    with httpx.Client(timeout=_timeout_seconds()) as client:
        resp = client.post(
            f"{_base_url()}/v1/ideogram-v3/generate",
            headers={"Api-Key": settings.ideogram_api_key},
            json={
                "prompt": prompt,
                "aspect_ratio": aspect,
                "rendering_speed": rendering_speed,
                "magic_prompt": "OFF",
                "style_type": "AUTO",
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
