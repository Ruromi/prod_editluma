"""
Generate feature example images via Ideogram API.
Saves to public/landing/
"""
import json
import os
import subprocess
import sys
import time
from urllib.request import Request, urlopen

API_KEY = os.environ.get("IDEOGRAM_API_KEY", "")
BASE_URL = "https://api.ideogram.ai"
RENDERING_SPEED = os.environ.get("IDEOGRAM_MODEL", "3.0-default").strip().lower()
FORCE_REGENERATE = os.environ.get("FORCE_REGENERATE_FEATURES", "0") == "1"
FILTERS = {
    item.strip()
    for item in os.environ.get("FEATURE_IMAGE_FILTERS", "").split(",")
    if item.strip()
}
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public")

PROMPTS = [
    {
        "relative_path": "landing/hero-profile-before-after.png",
        "prompt": (
            "Split-screen before-and-after comparison for a professional profile photo upgrade. "
            "Same male founder in the same framing and pose. "
            "Left side: casual upload with weaker light, softer facial detail, flatter contrast, and a less polished public-facing feel. "
            "Right side: cleaner LinkedIn-ready headshot with balanced light, natural skin texture, sharper facial detail, refined contrast, and credible business profile quality. "
            "Premium editorial headshot photography, neutral indoor background, photorealistic, no text, no watermark."
        ),
    },
    {
        "relative_path": "landing/feature-enhance-portrait.png",
        "prompt": (
            "Split-screen before-and-after comparison of creator portrait cleanup. "
            "Same East Asian female creator in the same pose and framing. "
            "Left side: slightly dull profile headshot with flatter light, weaker contrast, and tired skin finish. "
            "Right side: polished but realistic portrait with balanced light, natural skin texture, refined contrast, and clean profile-photo quality. "
            "Premium editorial headshot photography, soft indoor window light, minimal neutral background, no text, no watermark."
        ),
    },
    {
        "relative_path": "landing/features/selfie-retouch.png",
        "prompt": (
            "Casual smartphone selfie before-and-after comparison. "
            "Same young woman in soft indoor light, same angle and framing. "
            "Left side: minor blemishes, uneven tone, light under-eye shadow, slightly messy selfie feel. "
            "Right side: natural retouch with even tone, realistic pores, cleaner skin, same believable identity. "
            "Bright clean background, authentic beauty photography, no text, no watermark."
        ),
    },
    {
        "relative_path": "landing/features/upscale-4k.png",
        "prompt": (
            "Before-and-after profile image rescue from low resolution. "
            "Same person shown on the left as a tiny pixelated crop with compression artifacts and soft edges. "
            "Right side shows the restored high-quality profile portrait with clear facial detail, clean hair edges, and sharp contrast. "
            "Minimal professional presentation, neutral studio backdrop, photorealistic, no text, no watermark."
        ),
    },
    {
        "relative_path": "landing/features/easy-upload.png",
        "prompt": (
            "Split-scene portrait workflow image. "
            "A creator at a clean desk quickly uploading one portrait from a phone to a laptop, with a large photo preview visible on screen. "
            "The focus is on one-photo upload and fast review readiness, not on dense interface chrome. "
            "Bright natural studio lighting, minimal modern workspace, polished product-photography feel, no readable text, no watermark."
        ),
    },
    {
        "relative_path": "landing/features/fast-process.png",
        "prompt": (
            "Editorial contact sheet on a clean light table showing four portrait printouts of the same creator. "
            "One portrait is clearly selected with a thin blue frame, one is lightly crossed out, one is tilted aside, and one is neutral. "
            "This should communicate a quick keep-or-retry decision loop instantly, with absolutely no interface, no buttons, no words, no letters, and no numbers. "
            "Bright minimal studio setup, premium photography, no watermark."
        ),
    },
    {
        "relative_path": "landing/features/style-transfer.png",
        "prompt": (
            "One approved creator portrait expanded into four campaign-ready visual treatments. "
            "Same subject across all four tiles, consistent pose and framing. "
            "Variations include clean editorial, bold color pop, monochrome poster, and soft fashion glow. "
            "Looks like a creative board for launch assets, premium photography and art direction, no text, no watermark."
        ),
    },
]

COMPOSITES = [
    {
        "relative_path": "landing/ai-landing_2.png",
        "source_path": "landing/features/style-transfer.png",
    },
]


def should_process(relative_path: str) -> bool:
    if not FILTERS:
        return True
    return relative_path in FILTERS or os.path.basename(relative_path) in FILTERS


def build_secondary_visual_variations(composite_info: dict) -> None:
    relative_path = composite_info["relative_path"]
    out_path = os.path.join(OUTPUT_DIR, relative_path)

    if os.path.exists(out_path) and not FORCE_REGENERATE:
        print(f"  [skip] {relative_path} already exists")
        return

    source_path = os.path.join(OUTPUT_DIR, composite_info["source_path"])
    if not os.path.exists(source_path):
        raise FileNotFoundError(
            f"Composite source missing for {relative_path}: {composite_info['source_path']}"
        )

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    print(f"  [compose] {relative_path} ...")

    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i",
            source_path,
            "-f",
            "lavfi",
            "-i",
            "color=c=0xf5f1ea:s=1152x864",
            "-f",
            "lavfi",
            "-i",
            "color=c=0x4d4a45:s=132x132",
            "-f",
            "lavfi",
            "-i",
            "color=c=0xe2cfc4:s=132x132",
            "-f",
            "lavfi",
            "-i",
            "color=c=0xb7c4cb:s=132x132",
            "-filter_complex",
            "[0:v]crop=576:576:576:288,scale=620:760:force_original_aspect_ratio=increase,crop=620:760[hero];"
            "[0:v]crop=288:288:288:0,scale=432:240:force_original_aspect_ratio=increase,crop=432:240[top];"
            "[0:v]crop=288:288:0:0,scale=432:280:force_original_aspect_ratio=increase,crop=432:280[mid];"
            "[1:v][hero]overlay=40:52[tmp1];"
            "[tmp1][top]overlay=680:52[tmp2];"
            "[tmp2][mid]overlay=680:324[tmp3];"
            "[tmp3][2:v]overlay=680:652[tmp4];"
            "[tmp4][3:v]overlay=830:652[tmp5];"
            "[tmp5][4:v]overlay=980:652",
            "-frames:v",
            "1",
            "-update",
            "1",
            out_path,
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    print(f"  [done] {relative_path}")


def generate_one(prompt_info: dict) -> None:
    relative_path = prompt_info["relative_path"]
    out_path = os.path.join(OUTPUT_DIR, relative_path)

    if os.path.exists(out_path) and not FORCE_REGENERATE:
        print(f"  [skip] {relative_path} already exists")
        return

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    print(f"  [gen]  {relative_path} ...")
    normalized_speed = {
        "flash": "FLASH",
        "3.0-flash": "FLASH",
        "turbo": "TURBO",
        "3.0-turbo": "TURBO",
        "quality": "QUALITY",
        "3.0-quality": "QUALITY",
    }.get(RENDERING_SPEED, "DEFAULT")

    request = Request(
        f"{BASE_URL}/v1/ideogram-v3/generate",
        data=json.dumps(
            {
                "prompt": prompt_info["prompt"],
                "aspect_ratio": "4x3",
                "rendering_speed": normalized_speed,
                "magic_prompt": "OFF",
                "style_type": "AUTO",
            }
        ).encode("utf-8"),
        headers={
            "Api-Key": API_KEY,
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        method="POST",
    )

    with urlopen(request, timeout=120) as resp:
        data = json.loads(resp.read().decode("utf-8"))

    items = data.get("data") or []
    if not items:
        print(f"  [err]  No image returned for {relative_path}")
        return

    img_url = items[0]["url"]
    img_request = Request(
        img_url,
        headers={"User-Agent": "Mozilla/5.0"},
        method="GET",
    )
    with urlopen(img_request, timeout=120) as img_resp:
        image_bytes = img_resp.read()

    with open(out_path, "wb") as f:
        f.write(image_bytes)
    print(f"  [done] {relative_path} ({len(image_bytes) // 1024}KB)")


def main():
    prompts = [prompt for prompt in PROMPTS if should_process(prompt["relative_path"])]
    composites = [
        composite for composite in COMPOSITES if should_process(composite["relative_path"])
    ]

    if FILTERS and not prompts and not composites:
        print("ERROR: FEATURE_IMAGE_FILTERS did not match any prompt targets")
        sys.exit(1)

    if prompts and not API_KEY:
        print("ERROR: IDEOGRAM_API_KEY not set")
        sys.exit(1)

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"Output dir: {OUTPUT_DIR}\n")

    for i, p in enumerate(prompts):
        print(f"[{i+1}/{len(prompts)}] {p['relative_path']}")
        try:
            generate_one(p)
        except Exception as e:
            print(f"  [err]  {e}")
        # small delay between requests
        if i < len(prompts) - 1:
            time.sleep(2)

    if prompts and composites:
        print("")

    for i, composite in enumerate(composites):
        print(f"[{i+1}/{len(composites)}] {composite['relative_path']}")
        try:
            build_secondary_visual_variations(composite)
        except Exception as e:
            print(f"  [err]  {e}")

    print("\nDone!")


if __name__ == "__main__":
    main()
