"use client";

import Link from "next/link";
import { landingCopy, type LandingLanguage } from "@/components/landing/copy";

type LandingFooterProps = {
  language: LandingLanguage;
};

export default function LandingFooter({ language }: LandingFooterProps) {
  const copy = landingCopy[language].footer;
  const policyLang = language === "ko" ? "ko" : "en";
  const contactEmail = "rurumi1991@gmail.com";

  return (
    <footer className="bg-gray-950">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-8 text-sm text-gray-400 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium text-white">EditLuma</p>
          <p className="mt-1">{copy.description}</p>
          <p className="mt-2">
            {copy.contactLabel}:{" "}
            <a
              href={`mailto:${contactEmail}`}
              className="transition-colors hover:text-white"
            >
              {contactEmail}
            </a>
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 text-sm sm:items-end">
          <div className="flex flex-wrap items-center gap-5">
            <Link
              href="/pricing"
              className="transition-colors hover:text-white"
            >
              {copy.pricing}
            </Link>
            <Link
              href="/refund-policy"
              className="transition-colors hover:text-white"
            >
              {copy.refundPolicy}
            </Link>
            <Link
              href="/contact"
              className="transition-colors hover:text-white"
            >
              {copy.contactPage}
            </Link>
            <Link
              href={`/privacy?lang=${policyLang}`}
              className="transition-colors hover:text-white"
            >
              {copy.privacy}
            </Link>
            <Link
              href={`/terms?lang=${policyLang}`}
              className="transition-colors hover:text-white"
            >
              {copy.terms}
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs text-gray-500">
            <Link href="/ai-image-generator" className="transition-colors hover:text-white">
              {copy.aiImageGenerator}
            </Link>
            <Link href="/ai-photo-enhancer" className="transition-colors hover:text-white">
              {copy.aiPhotoEnhancer}
            </Link>
            <Link href="/ai-portrait-enhancer" className="transition-colors hover:text-white">
              {copy.aiPortraitEnhancer}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
