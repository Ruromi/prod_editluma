import type { Metadata } from "next";
import KeywordLandingPage from "@/components/seo/KeywordLandingPage";
import { createSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata({
  title: "AI Image Generator",
  path: "/ai-image-generator",
  description:
    "Generate stylized visuals, concept art, and prompt-based images with EditLuma's fast AI image generator.",
  keywords: ["AI image generator", "prompt to image", "generate AI art online"],
});

export default function AiImageGeneratorPage() {
  return (
    <KeywordLandingPage
      eyebrow="AI Image Generator"
      title="Generate prompt-based visuals with EditLuma"
      description="Use EditLuma to turn short prompts into polished AI images for concept art, social posts, creative experiments, and rapid ideation."
      primaryKeyword="AI image generator"
      secondaryKeyword="prompt to image"
      benefits={[
        "Generate visuals from a single prompt without complex design software.",
        "Use a credit-based workflow that is easy to understand for teams and individuals.",
        "Move from generation to enhancement inside the same product flow.",
      ]}
      useCases={[
        "Concept art drafts for campaigns or creative direction",
        "Marketing visuals for landing pages and social content",
        "Rapid image ideation before final production work",
      ]}
    />
  );
}
