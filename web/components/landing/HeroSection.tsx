"use client";

import Link from "next/link";
import { landingCopy, type LandingLanguage } from "@/components/landing/copy";

type HeroSectionProps = {
  isAuthenticated: boolean;
  language: LandingLanguage;
};

export default function HeroSection({ isAuthenticated, language }: HeroSectionProps) {
  const copy = landingCopy[language].hero;

  return (
    <section className="pt-20 pb-16 sm:pt-28 sm:pb-24">
      <div className="mx-auto max-w-4xl px-6 text-center">
        {/* Headline */}
        <h1 className="text-4xl font-bold leading-[1.15] tracking-tight text-gray-900 sm:text-6xl">
          {copy.titleLine1}
          <br />
          <span className="text-indigo-600">{copy.titleHighlight}</span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-gray-500 sm:text-lg">
          {copy.subtitleLine1}
          <br className="hidden sm:block" />
          {copy.subtitleLine2}
        </p>

        {/* CTA */}
        <div className="mt-10 flex items-center justify-center gap-6">
          <Link
            href={isAuthenticated ? "/dashboard?tab=generate" : "/dashboard"}
            className="rounded-lg bg-indigo-600 px-8 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-indigo-500"
          >
            {isAuthenticated ? copy.primaryCtaSignedIn : copy.primaryCtaSignedOut}
          </Link>
          <a
            href="#features"
            className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            {copy.secondaryCta} →
          </a>
        </div>
      </div>
    </section>
  );
}
