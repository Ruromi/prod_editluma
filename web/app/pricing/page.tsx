import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import BillingPageClient from "@/components/BillingPageClient";
import { LANDING_LANGUAGE_COOKIE, normalizeLandingLanguage } from "@/lib/landing-language";
import { createSeoMetadata } from "@/lib/seo";
import { createServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = createSeoMetadata({
  title: "Pricing",
  path: "/pricing",
  description:
    "Review EditLuma credit packages for AI image generation, enhancement, retouching, and upscaling workflows.",
  keywords: ["AI SaaS pricing", "credit packages", "image generation pricing"],
});

function PricingFallback() {
  return (
    <div className="mx-auto max-w-5xl rounded-[36px] border border-gray-200 bg-white/95 p-6 shadow-2xl shadow-black/15 sm:p-8">
      <div className="h-24 rounded-3xl border border-gray-200 bg-gray-100 animate-pulse" />
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-[22rem] rounded-3xl border border-gray-200 bg-gray-100 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

export default async function PricingPage() {
  const supabase = await createServerClient();
  const cookieStore = await cookies();
  const initialLanguage = normalizeLandingLanguage(
    cookieStore.get(LANDING_LANGUAGE_COOKIE)?.value
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const closeHref = user ? "/mypage" : "/";

  return (
    <div className="min-h-screen bg-black/55 px-4 py-6 backdrop-blur-sm sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex justify-end">
          <Link
            href={closeHref}
            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
          >
            {initialLanguage === "ko" ? "닫기" : "Close"}
          </Link>
        </div>

        <div className="rounded-[36px] border border-gray-200 bg-white/95 shadow-2xl shadow-black/15">
          <Suspense fallback={<PricingFallback />}>
            <BillingPageClient view="pricing" initialLanguage={initialLanguage} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
