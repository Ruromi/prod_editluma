import type { Metadata } from "next";
import KeywordLandingPage from "@/components/seo/KeywordLandingPage";
import { aiPortraitEnhancerLanding } from "@/lib/keyword-landings";
import { createSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata({
  title: aiPortraitEnhancerLanding.metadata.title,
  path: aiPortraitEnhancerLanding.page.path,
  description: aiPortraitEnhancerLanding.metadata.description,
  keywords: aiPortraitEnhancerLanding.metadata.keywords,
});

export default function AiPortraitEnhancerPage() {
  return <KeywordLandingPage {...aiPortraitEnhancerLanding.page} />;
}
