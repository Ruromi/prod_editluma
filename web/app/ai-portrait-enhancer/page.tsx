import type { Metadata } from "next";
import KeywordLandingPage from "@/components/seo/KeywordLandingPage";
import { createSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata({
  title: "AI Portrait Enhancer",
  path: "/ai-portrait-enhancer",
  description:
    "Retouch skin, improve portrait clarity, and clean up selfie details with EditLuma's AI portrait enhancer.",
  keywords: ["AI portrait enhancer", "AI selfie retouch", "portrait retouch AI"],
});

export default function AiPortraitEnhancerPage() {
  return (
    <KeywordLandingPage
      eyebrow="AI Portrait Enhancer"
      title="Refine portraits and selfies with natural AI retouching"
      description="EditLuma helps you retouch portraits, clean up skin texture, improve lighting balance, and keep the final image natural enough for profile, creator, and marketing use."
      primaryKeyword="AI portrait enhancer"
      secondaryKeyword="AI selfie retouch"
      benefits={[
        "Retouch portrait details while keeping the image natural.",
        "Use one workflow for portrait cleanup, enhancement, and final delivery.",
        "Pair portrait retouching with generation for new creative variations.",
      ]}
      useCases={[
        "Profile and team photos for websites and social accounts",
        "Creator portraits and polished selfie edits",
        "Quick portrait cleanup before ads, resumes, or portfolios",
      ]}
    />
  );
}
