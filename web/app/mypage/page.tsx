import type { Metadata } from "next";
import { Suspense } from "react";
import { cookies } from "next/headers";
import BillingPageClient from "@/components/BillingPageClient";
import { LANDING_LANGUAGE_COOKIE, normalizeLandingLanguage } from "@/lib/landing-language";
import { createSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata({
  title: "My Page",
  path: "/mypage",
  noIndex: true,
});

function MyPageFallback() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="space-y-6">
        <div className="h-40 rounded-3xl border border-gray-800 bg-gray-900/60 animate-pulse" />
        <div className="h-60 rounded-3xl border border-gray-800 bg-gray-900/60 animate-pulse" />
        <div className="h-60 rounded-3xl border border-gray-800 bg-gray-900/60 animate-pulse" />
      </div>
    </div>
  );
}

export default async function MyPage() {
  const cookieStore = await cookies();
  const initialLanguage = normalizeLandingLanguage(
    cookieStore.get(LANDING_LANGUAGE_COOKIE)?.value
  );

  return (
    <Suspense fallback={<MyPageFallback />}>
      <BillingPageClient view="mypage" initialLanguage={initialLanguage} />
    </Suspense>
  );
}
