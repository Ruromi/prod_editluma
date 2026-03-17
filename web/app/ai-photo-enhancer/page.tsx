import type { Metadata } from "next";
import KeywordLandingPage from "@/components/seo/KeywordLandingPage";
import { aiPhotoEnhancerLanding } from "@/lib/keyword-landings";
import { createSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata({
  title: aiPhotoEnhancerLanding.metadata.title,
  path: aiPhotoEnhancerLanding.page.path,
  description: aiPhotoEnhancerLanding.metadata.description,
  keywords: aiPhotoEnhancerLanding.metadata.keywords,
});

export default function AiPhotoEnhancerPage() {
  return <KeywordLandingPage {...aiPhotoEnhancerLanding.page} />;
}
