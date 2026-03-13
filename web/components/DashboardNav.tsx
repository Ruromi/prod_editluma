"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LANDING_LANGUAGE_EVENT,
  normalizeLandingLanguage,
  readBrowserLandingLanguage,
  type HeaderLanguage,
} from "@/lib/landing-language";

const TABS = [
  { id: "generate", label: { en: "Create", ko: "생성" } },
  { id: "gallery", label: { en: "Gallery", ko: "갤러리" } },
] as const;

type DashboardNavProps = {
  initialLanguage?: HeaderLanguage;
};

export default function DashboardNav({
  initialLanguage = "en",
}: DashboardNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [language, setLanguage] = useState<HeaderLanguage>(initialLanguage);
  const isDashboard = pathname.startsWith("/dashboard");
  const isPricing = pathname.startsWith("/pricing");
  const isMyPage = pathname.startsWith("/mypage") || pathname.startsWith("/billing");
  const tab = isDashboard ? (searchParams.get("tab") ?? "generate") : null;

  useEffect(() => {
    setLanguage(readBrowserLandingLanguage());

    function handleLanguageChange(event: Event) {
      const nextLanguage = (event as CustomEvent<{ language?: string }>).detail?.language;
      setLanguage(normalizeLandingLanguage(nextLanguage));
    }

    window.addEventListener(LANDING_LANGUAGE_EVENT, handleLanguageChange as EventListener);
    return () => {
      window.removeEventListener(LANDING_LANGUAGE_EVENT, handleLanguageChange as EventListener);
    };
  }, []);

  return (
    <nav className="flex items-center gap-6">
      {TABS.map((t) =>
        isDashboard ? (
          <button
            key={t.id}
            onClick={() => router.replace(`/dashboard?tab=${t.id}`)}
            className={`text-sm font-medium transition-colors relative pb-0.5 ${
              tab === t.id
                ? "text-gray-900"
                : "text-gray-500 hover:text-gray-400"
            }`}
          >
            {t.label[language]}
            {tab === t.id && (
              <span className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-indigo-500 rounded-full" />
            )}
          </button>
        ) : (
          <Link
            key={t.id}
            href={`/dashboard?tab=${t.id}`}
            className="text-sm font-medium transition-colors relative pb-0.5 text-gray-500 hover:text-gray-400"
          >
            {t.label[language]}
          </Link>
        )
      )}

      <Link
        href="/pricing"
        className={`text-sm font-medium transition-colors relative pb-0.5 ${
          isPricing
            ? "text-gray-900"
            : "text-gray-500 hover:text-gray-400"
        }`}
      >
        {language === "ko" ? "요금제" : "Pricing"}
        {isPricing && (
          <span className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-indigo-500 rounded-full" />
        )}
      </Link>

      <Link
        href="/mypage"
        className={`text-sm font-medium transition-colors relative pb-0.5 ${
          isMyPage
            ? "text-gray-900"
            : "text-gray-500 hover:text-gray-400"
        }`}
      >
        {language === "ko" ? "마이페이지" : "My Page"}
        {isMyPage && (
          <span className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-indigo-500 rounded-full" />
        )}
      </Link>
    </nav>
  );
}
