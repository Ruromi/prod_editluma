"use client";

import Link from "next/link";
import { landingCopy, type LandingLanguage } from "@/components/landing/copy";

type HeroSectionProps = {
  isAuthenticated: boolean;
  language: LandingLanguage;
};

export default function HeroSection({ isAuthenticated, language }: HeroSectionProps) {
  const copy = landingCopy[language].hero;
  const primaryHref = isAuthenticated
    ? "/dashboard?tab=generate"
    : `/auth/signup?next=${encodeURIComponent("/dashboard?tab=generate")}`;

  return (
    <section className="pt-12 pb-16 sm:pt-16 sm:pb-20">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div className="max-w-xl text-center lg:text-left">
          <p className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-indigo-700">
            {copy.eyebrow}
          </p>

          <h1 className="mt-4 text-4xl font-bold leading-[1.05] tracking-tight text-gray-900 sm:text-6xl">
            {copy.titleLine1}
            <br />
            <span className="text-indigo-600">{copy.titleHighlight}</span>
          </h1>

          <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-gray-600 sm:text-lg lg:mx-0">
            {copy.subtitleLine1}
            <br className="hidden sm:block" />
            {copy.subtitleLine2}
          </p>

          <div className="mt-7">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
              {copy.audienceLabel}
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
              {copy.audienceButtons.map((button) => (
                <a
                  key={button.href}
                  href={button.href}
                  className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:text-gray-900"
                >
                  {button.label}
                </a>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center gap-3 lg:items-start">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                href={primaryHref}
                className="inline-flex min-w-[240px] items-center justify-center whitespace-nowrap rounded-xl bg-gray-950 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
              >
                {isAuthenticated ? copy.primaryCtaSignedIn : copy.primaryCtaSignedOut}
              </Link>
              <a
                href="#examples"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-xl border border-gray-200 px-6 py-3.5 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:text-gray-900"
              >
                {copy.secondaryCta}
              </a>
            </div>
            <Link
              href={copy.pricingHref}
              className="inline-flex items-center justify-center text-sm font-semibold text-indigo-700 transition-colors hover:text-indigo-900"
            >
              {copy.pricingHint}
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
            {copy.proofPoints.map((point) => (
              <span
                key={point}
                className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-500"
              >
                {point}
              </span>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white p-3 shadow-[0_24px_70px_-28px_rgba(15,23,42,0.25)]">
            <div className="relative overflow-hidden rounded-[1.5rem] bg-[#f4f4f1]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/landing/hero-profile-before-after.png"
                alt={copy.titleLine1}
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-700 shadow-sm">
                {copy.imageBeforeLabel}
              </div>
              <div className="absolute right-4 top-4 rounded-full bg-gray-950/92 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white shadow-sm">
                {copy.imageAfterLabel}
              </div>
              <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/70 bg-white/88 px-4 py-4 backdrop-blur">
                <p className="text-sm font-medium leading-relaxed text-gray-700">{copy.imageCaption}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
