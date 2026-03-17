"use client";

import FeaturesSection from "@/components/landing/FeaturesSection";
import GallerySection from "@/components/landing/GallerySection";
import HeroSection from "@/components/landing/HeroSection";
import LandingFooter from "@/components/landing/LandingFooter";
import { landingCopy } from "@/components/landing/copy";
import {
  persistLandingLanguage,
  type HeaderLanguage,
} from "@/lib/landing-language";
import { useAppLanguage } from "@/lib/use-app-language";

type LandingPageContentProps = {
  isAuthenticated: boolean;
  initialLanguage?: HeaderLanguage;
};

export default function LandingPageContent({
  isAuthenticated,
  initialLanguage = "en",
}: LandingPageContentProps) {
  const language = useAppLanguage(initialLanguage);
  const copy = landingCopy[language];

  function handleLanguageChange(nextLanguage: HeaderLanguage) {
    persistLandingLanguage(nextLanguage);
  }

  return (
    <>
      <div className="mx-auto max-w-6xl px-6 pt-6">
        <div className="flex justify-end">
          <div className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white/90 p-1 shadow-sm">
            <span className="px-3 text-[11px] font-medium uppercase tracking-[0.16em] text-gray-500">
              {copy.languageLabel}
            </span>
            <button
              type="button"
              onClick={() => handleLanguageChange("en")}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                language === "en" ? "bg-gray-950 text-white" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange("ko")}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                language === "ko" ? "bg-gray-950 text-white" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              한국어
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-28 pb-28">
        <HeroSection isAuthenticated={isAuthenticated} language={language} />
        <FeaturesSection language={language} />
        <GallerySection language={language} />
      </div>
      <LandingFooter language={language} />
    </>
  );
}
