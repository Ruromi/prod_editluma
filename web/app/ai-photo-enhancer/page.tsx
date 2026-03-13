import type { Metadata } from "next";
import KeywordLandingPage from "@/components/seo/KeywordLandingPage";
import { createSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata({
  title: "AI Photo Enhancer",
  path: "/ai-photo-enhancer",
  description:
    "Enhance blurry or low-quality photos with AI-powered retouching, clarity improvements, and upscale workflows in EditLuma.",
  keywords: ["AI photo enhancer", "photo quality enhancer", "AI image upscaler"],
});

export default function AiPhotoEnhancerPage() {
  return (
    <KeywordLandingPage
      eyebrow="AI Photo Enhancer"
      title="Enhance photos with fast AI retouching and cleanup"
      description="Improve photo clarity, fix weak lighting, clean up rough textures, and restore stronger visual quality with EditLuma's AI photo enhancer."
      primaryKeyword="AI photo enhancer"
      secondaryKeyword="AI image upscaler"
      benefits={[
        "Improve photo clarity and overall quality in a few clicks.",
        "Retouch portraits and selfies without overprocessing the final image.",
        "Use the same workflow for enhancement, generation, and credit tracking.",
      ]}
      useCases={[
        "Cleaning up portrait photos for profiles and creator pages",
        "Enhancing uploaded shots before marketing or ecommerce use",
        "Restoring weak or low-resolution images into sharper deliverables",
      ]}
    />
  );
}
