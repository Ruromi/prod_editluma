"""
Generate feature example images via Ideogram API.
Saves to public/landing/features/
"""
import httpx
import os
import sys
import time

API_KEY = os.environ.get("IDEOGRAM_API_KEY", "")
BASE_URL = "https://api.ideogram.ai"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "landing", "features")

PROMPTS = [
    {
        "filename": "selfie-retouch.png",
        "prompt": (
            "Split-screen before and after comparison of AI skin retouching on a young woman's selfie portrait. "
            "Left side: natural skin with minor blemishes and uneven tone. "
            "Right side: same face with smooth, natural-looking skin, even tone, refined pores. "
            "Soft studio lighting, clean minimal background, professional beauty photography style. "
            "Dark moody theme, subtle dividing line in the center."
        ),
    },
    {
        "filename": "upscale-4k.png",
        "prompt": (
            "Split-screen before and after of AI image upscaling. "
            "Left side: a blurry, pixelated low-resolution portrait photo with visible compression artifacts. "
            "Right side: the same portrait in crystal-clear 4K quality with sharp details and vibrant colors. "
            "Dark background, tech aesthetic, clean minimal presentation. "
            "Professional photography, moody cinematic lighting."
        ),
    },
    {
        "filename": "korean-prompt.png",
        "prompt": (
            "A stylish flat illustration of a chat bubble containing Korean text being transformed into a beautiful AI-generated image. "
            "The chat bubble is on the left, and a stunning portrait photograph emerges from it on the right. "
            "Dark indigo and purple gradient background, glowing neon accents, modern tech UI aesthetic. "
            "Clean, minimal, professional digital art style."
        ),
    },
    {
        "filename": "style-transfer.png",
        "prompt": (
            "A portrait photograph being transformed into multiple artistic styles: watercolor painting, anime illustration, oil painting, and pop art. "
            "Four quadrants showing the same face in different art styles. "
            "Dark background, vibrant colors for each style, clean grid layout. "
            "Professional digital art, modern aesthetic."
        ),
    },
    {
        "filename": "easy-upload.png",
        "prompt": (
            "A clean, minimal UI mockup of a drag-and-drop file upload zone on a dark interface. "
            "A hand cursor dragging a portrait photo into a glowing upload area with a dashed border. "
            "Dark gray and indigo color scheme, subtle glow effect around the drop zone. "
            "Modern web application design, flat illustration style, professional UI/UX."
        ),
    },
    {
        "filename": "fast-process.png",
        "prompt": (
            "A futuristic AI processing visualization showing a portrait photo being enhanced in real-time. "
            "Glowing progress bar at 80%, streaming light particles flowing around the image. "
            "Speed lines and motion blur suggesting fast processing. "
            "Dark background with indigo and cyan accent colors, tech aesthetic, clean modern design."
        ),
    },
]


def generate_one(prompt_info: dict) -> None:
    filename = prompt_info["filename"]
    out_path = os.path.join(OUTPUT_DIR, filename)

    if os.path.exists(out_path):
        print(f"  [skip] {filename} already exists")
        return

    print(f"  [gen]  {filename} ...")
    payload = {
        "image_request": {
            "prompt": prompt_info["prompt"],
            "model": "V_2",
            "aspect_ratio": "ASPECT_1_1",
        }
    }

    with httpx.Client(timeout=120) as client:
        resp = client.post(
            f"{BASE_URL}/generate",
            headers={"Api-Key": API_KEY, "Content-Type": "application/json"},
            json=payload,
        )
        resp.raise_for_status()
        data = resp.json()
        items = data.get("data") or []
        if not items:
            print(f"  [err]  No image returned for {filename}")
            return

        img_url = items[0]["url"]
        img_resp = client.get(img_url)
        img_resp.raise_for_status()

        with open(out_path, "wb") as f:
            f.write(img_resp.content)

    print(f"  [done] {filename} ({len(img_resp.content) // 1024}KB)")


def main():
    if not API_KEY:
        print("ERROR: IDEOGRAM_API_KEY not set")
        sys.exit(1)

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"Output dir: {OUTPUT_DIR}\n")

    for i, p in enumerate(PROMPTS):
        print(f"[{i+1}/{len(PROMPTS)}] {p['filename']}")
        try:
            generate_one(p)
        except Exception as e:
            print(f"  [err]  {e}")
        # small delay between requests
        if i < len(PROMPTS) - 1:
            time.sleep(2)

    print("\nDone!")


if __name__ == "__main__":
    main()
