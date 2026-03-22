"""Tests for _with_enhancement_guards — no external API calls required."""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.core.processor import _with_enhancement_guards, _ENHANCEMENT_PRESERVATION


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
