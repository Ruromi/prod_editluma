import type { Metadata } from "next";
import { cookies } from "next/headers";
import LandingPageContent from "@/components/landing/LandingPageContent";
import { createSeoMetadata } from "@/lib/seo";
import { LANDING_LANGUAGE_COOKIE, normalizeLandingLanguage } from "@/lib/landing-language";
import { createServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = createSeoMetadata({
  title: "AI Portrait Enhancer for Creators",
  path: "/",
  description:
    "Clean up creator portraits, retouch selfies, and test publish-ready profile photos with EditLuma's credit-based AI workflow.",
  keywords: [
    "AI portrait enhancer",
    "creator profile photo enhancer",
    "AI selfie retouch",
    "portrait cleanup AI",
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
