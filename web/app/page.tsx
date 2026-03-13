import type { Metadata } from "next";
import { cookies } from "next/headers";
import LandingPageContent from "@/components/landing/LandingPageContent";
import { createSeoMetadata } from "@/lib/seo";
import { LANDING_LANGUAGE_COOKIE, normalizeLandingLanguage } from "@/lib/landing-language";
import { createServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = createSeoMetadata({
  title: "AI Image Generator and Photo Enhancer",
  path: "/",
  description:
    "Create AI images, enhance portraits, retouch selfies, and upscale photos with EditLuma's fast credit-based workflow.",
  keywords: [
    "AI image generation SaaS",
    "AI photo enhancer online",
    "portrait retouch AI",
    "photo upscaler AI",
  ],
});

export default async function Home() {
  const supabase = await createServerClient();
  const cookieStore = await cookies();
  const initialLanguage = normalizeLandingLanguage(
    cookieStore.get(LANDING_LANGUAGE_COOKIE)?.value
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <LandingPageContent
      isAuthenticated={Boolean(user)}
      initialLanguage={initialLanguage}
    />
  );
}
