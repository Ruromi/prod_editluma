import type { Metadata } from "next";
import { cookies } from "next/headers";
import LandingPageContent from "@/components/landing/LandingPageContent";
import { createSeoMetadata } from "@/lib/seo";
import { LANDING_LANGUAGE_COOKIE, normalizeLandingLanguage } from "@/lib/landing-language";
import { createServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = createSeoMetadata({
  title: "AI Profile Photo Generator | LinkedIn Headshot AI",
  path: "/",
  description:
    "Turn your casual photo into a LinkedIn-ready, business-grade profile image with EditLuma's AI profile photo workflow.",
  keywords: [
    "AI profile photo",
    "LinkedIn photo AI",
    "professional headshot AI",
    "profile photo enhancer AI",
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
