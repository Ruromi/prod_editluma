import type { Metadata } from "next";
import KeywordLandingPage from "@/components/seo/KeywordLandingPage";
import { aiImageGeneratorLanding } from "@/lib/keyword-landings";
import { createSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata({
  title: aiImageGeneratorLanding.metadata.title,
  path: aiImageGeneratorLanding.page.path,
  description: aiImageGeneratorLanding.metadata.description,
  keywords: aiImageGeneratorLanding.metadata.keywords,
});

export default function AiImageGeneratorPage() {
  return <KeywordLandingPage {...aiImageGeneratorLanding.page} />;
}
