"""Tests for _with_enhancement_guards and rewrite_for_image_enhancement — no external API calls required."""
import sys
import os
from unittest.mock import patch

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.core.processor import _with_enhancement_guards, _ENHANCEMENT_PRESERVATION, rewrite_for_image_enhancement


# ---------------------------------------------------------------------------
# Core contract: canonical clause always appears at the end exactly once
# ---------------------------------------------------------------------------

def test_canonical_clause_always_appended():
    """Guard must always end with the canonical preservation clause."""
    prompts = [
        "Warm golden hour lighting, rich amber tones",
        "Cinematic tone, deep shadows, cool blue highlights",
        "Luxury editorial feel, rich blacks, warm highlights",
        "Slight contrast boost and sharper detail",
        "Warmer tones, softer shadows, slight glow on skin",
    ]
    for prompt in prompts:
        result = _with_enhancement_guards(prompt)
        assert result.lower().endswith(_ENHANCEMENT_PRESERVATION.lower() + "."), (
            f"Canonical clause not at end:\n{result}"
        )


def test_canonical_clause_content():
    """Canonical clause must cover identity, expression, pose, framing, hairstyle, clothing, background."""
    result = _with_enhancement_guards("Slight contrast boost and sharper detail")
    lower = result.lower()
    for keyword in ("identity", "expression", "pose", "framing", "hairstyle", "clothing", "background"):
        assert keyword in lower, f"Missing '{keyword}' in guard output:\n{result}"


def test_no_addition_when_already_at_end():
    """If the text already ends with the exact canonical clause, guard adds only the period."""
    prompt = (
        "Apply a cinematic color grade with deep shadows, "
        "preserving identity, expression, pose, framing, hairstyle, clothing, and background, "
        "natural skin texture and realistic finish"
    )
    result = _with_enhancement_guards(prompt)
    assert result == prompt + "."


def test_canonical_clause_not_doubled():
    """Calling the guard twice must not duplicate the preservation clause."""
    prompt = "Warm tones, gentle fill light"
    result_once = _with_enhancement_guards(prompt)
    result_twice = _with_enhancement_guards(result_once.rstrip("."))
    assert result_once == result_twice, (
        f"Guard is not idempotent:\nFirst:  {result_once}\nSecond: {result_twice}"
    )


# ---------------------------------------------------------------------------
# Prompts that already contain partial preservation language
# (LLM misbehavior edge case) — canonical clause must still end the output
# ---------------------------------------------------------------------------

def test_canonical_appended_even_when_preserving_in_middle():
    """Guard appends canonical even if 'preserving' already appears mid-sentence."""
    prompt = (
        "Enhance with a cinematic tone while preserving the subject's "
        "original expression and appearance"
    )
    result = _with_enhancement_guards(prompt)
    assert result.lower().endswith(_ENHANCEMENT_PRESERVATION.lower() + "."), (
        f"Canonical clause not at end:\n{result}"
    )


def test_canonical_appended_when_identity_in_middle():
    """Guard appends canonical even if 'identity' already appears mid-sentence."""
    prompt = "Luxury tone with richer shadows, maintain subject identity throughout"
    result = _with_enhancement_guards(prompt)
    assert result.lower().endswith(_ENHANCEMENT_PRESERVATION.lower() + "."), (
        f"Canonical clause not at end:\n{result}"
    )


# ---------------------------------------------------------------------------
# Output format
# ---------------------------------------------------------------------------

def test_output_ends_with_period():
    for prompt in [
        "Warm tones",
        "Cinematic lighting, preserving appearance",
        "Dramatic shadows, natural skin texture and realistic finish",
        "Preserving identity, expression, pose, framing, hairstyle, clothing, and background, natural skin texture and realistic finish",
    ]:
        result = _with_enhancement_guards(prompt)
        assert result.endswith("."), f"Output does not end with period:\n{result}"


def test_empty_prompt_returns_empty():
    assert _with_enhancement_guards("") == ""
    assert _with_enhancement_guards("   ") == ""


# ---------------------------------------------------------------------------
# rewrite_for_image_enhancement — mocked Groq to test without API key
# ---------------------------------------------------------------------------

def test_rewrite_fallback_applies_guards():
    """When Groq is unavailable, the raw prompt still gets preservation guards."""
    with patch("app.core.processor._call_groq_text", return_value=None):
        result = rewrite_for_image_enhancement("warm")
    assert result.lower().endswith(_ENHANCEMENT_PRESERVATION.lower() + ".")


def test_rewrite_groq_response_gets_guards():
    """A Groq-rewritten prompt always has preservation guards appended."""
    groq_response = "Shift to a warmer color temperature with soft golden fill light and gentle flattering shadows"
    with patch("app.core.processor._call_groq_text", return_value=groq_response):
        result = rewrite_for_image_enhancement("warm")
    assert result.lower().endswith(_ENHANCEMENT_PRESERVATION.lower() + ".")
    assert groq_response.lower() in result.lower()


def test_rewrite_system_prompt_contains_keyword_expansions():
    """System prompt must include precise visual expansion guidance for common style keywords."""
    captured: dict = {}

    def capture(**kwargs):
        captured.update(kwargs)
        return "Adjusted with cinematic color grading and dramatic lighting"

    with patch("app.core.processor._call_groq_text", side_effect=capture):
        rewrite_for_image_enhancement("cinematic")

    system_prompt = captured.get("system_prompt", "")
    for keyword in ("cinematic", "luxury", "warm", "studio", "linkedin", "premium", "editorial", "refined", "upscale", "polished", "high-end"):
        assert keyword in system_prompt.lower(), f"Missing keyword '{keyword}' in system prompt"


def test_rewrite_system_prompt_premium_retouch_visual_language():
    """System prompt must describe premium retouch in retouching terms, not cinematic/filter terms."""
    captured: dict = {}

    def capture(**kwargs):
        captured.update(kwargs)
        return "Balanced contrast with lifted midtones and crisp sharpness"

    with patch("app.core.processor._call_groq_text", side_effect=capture):
        rewrite_for_image_enhancement("high-end correction")

    system_prompt = captured.get("system_prompt", "")
    lower = system_prompt.lower()
    for phrase in ("balanced contrast", "lifted midtones", "crisp", "skin detail", "color grading"):
        assert phrase in lower, f"Missing premium-retouch visual term '{phrase}' in system prompt"
    # Must not conflate premium retouch with cinematic
    premium_section_start = lower.find("premium")
    cinematic_section_start = lower.find("cinematic")
    assert premium_section_start != -1, "premium keyword missing from system prompt"
    assert cinematic_section_start != -1, "cinematic keyword missing from system prompt"
    # They should be in separate instructions (luxury cluster appears after cinematic)
    assert premium_section_start > cinematic_section_start, (
        "premium-retouch cluster should appear after cinematic in the system prompt"
    )


def test_rewrite_system_prompt_premium_anti_patterns():
    """System prompt must explicitly forbid plastic skin, airbrushed finish, over-processing, and identity drift."""
    captured: dict = {}

    def capture(**kwargs):
        captured.update(kwargs)
        return "Elegant soft directional light with balanced contrast and crisp detail"

    with patch("app.core.processor._call_groq_text", side_effect=capture):
        rewrite_for_image_enhancement("luxury")

    system_prompt = captured.get("system_prompt", "")
    lower = system_prompt.lower()
    for phrase in ("plastic skin", "airbrushed", "over-processing", "identity drift"):
        assert phrase in lower, f"Missing anti-pattern guard '{phrase}' in system prompt"


def test_rewrite_system_prompt_premium_retouch_guidance():
    """System prompt must describe premium retouch with elegant light, luminosity, and pore-texture language."""
    captured: dict = {}

    def capture(**kwargs):
        captured.update(kwargs)
        return "Elegant light, balanced contrast, refined skin detail"

    with patch("app.core.processor._call_groq_text", side_effect=capture):
        rewrite_for_image_enhancement("polished editorial")

    system_prompt = captured.get("system_prompt", "")
    lower = system_prompt.lower()
    for phrase in ("elegant", "luminosity", "pore texture"):
        assert phrase in lower, f"Missing premium-retouch guidance term '{phrase}' in system prompt"


def test_rewrite_empty_input_uses_default_and_gets_guards():
    """Empty input uses the default cleanup prompt and still gets guards."""
    with patch("app.core.processor._call_groq_text", return_value=None):
        result = rewrite_for_image_enhancement("")
    assert result.lower().endswith(_ENHANCEMENT_PRESERVATION.lower() + ".")
    assert len(result) > len(_ENHANCEMENT_PRESERVATION) + 2  # default prompt is present
