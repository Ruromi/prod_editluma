"use client";

import Link from "next/link";
import { landingCopy, type LandingLanguage } from "@/components/landing/copy";

type LandingFooterProps = {
  language: LandingLanguage;
};

export default function LandingFooter({ language }: LandingFooterProps) {
  const copy = landingCopy[language].footer;
  const policyLang = language === "ko" ? "ko" : "en";

  return (
    <footer className="bg-gray-950">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-8 text-sm text-gray-400 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium text-white">EditLuma</p>
          <p className="mt-1">{copy.description}</p>
        </div>

        <div className="flex items-center gap-5 text-sm">
          <Link
            href="/pricing"
            className="transition-colors hover:text-white"
          >
            {copy.pricing}
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
      </div>
    </footer>
  );
}
