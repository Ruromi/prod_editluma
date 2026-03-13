"use client";

import type { ReactNode } from "react";
import { landingCopy, type LandingLanguage } from "@/components/landing/copy";

// ---------------------------------------------------------------------------
// Korean Prompt feature card – code-rendered UI mockup (no broken hangul image)
// ---------------------------------------------------------------------------
function KoreanPromptMockup({ language }: { language: LandingLanguage }) {
  const copy = landingCopy[language].features;

  return (
    <div className="relative h-full w-full flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-xs space-y-3">
        {/* Input bubble */}
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 shadow-sm">
          <p className="text-xs text-gray-500 mb-1.5 font-mono">{copy.koreanPromptInputLabel}</p>
          <p className="text-sm text-gray-900 leading-relaxed">{copy.koreanPromptInputText}</p>
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center gap-2 text-indigo-600">
          <div className="h-px w-8 bg-indigo-500/40" />
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
          <div className="h-px w-8 bg-indigo-500/40" />
        </div>

        {/* Translated bubble */}
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 shadow-sm">
          <p className="text-xs text-indigo-600 mb-1.5 font-mono">{copy.koreanPromptOutputLabel}</p>
          <p className="text-sm text-indigo-600 leading-relaxed">{copy.koreanPromptOutputText}</p>
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center gap-2 text-indigo-600">
          <div className="h-px w-8 bg-indigo-500/40" />
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
          <div className="h-px w-8 bg-indigo-500/40" />
        </div>

        {/* Result */}
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 shadow-sm flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-green-600 font-mono">{copy.koreanPromptResultLabel}</p>
            <p className="text-xs text-green-500 mt-0.5">{copy.koreanPromptResultMeta}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

type FeaturesSectionProps = {
  language: LandingLanguage;
};

type FeatureCard = {
  img: string;
  title: string;
  desc: string;
  custom?: ReactNode;
};

export default function FeaturesSection({ language }: FeaturesSectionProps) {
  const copy = landingCopy[language].features;
  const features: FeatureCard[] = copy.items.map((item, index) =>
    index === 4 ? { ...item, custom: <KoreanPromptMockup language={language} /> } : item
  );

  return (
    <section id="features" className="mx-auto max-w-5xl px-6">
      <div className="mb-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">{copy.heading}</h2>
        <p className="mt-3 text-sm text-gray-500">{copy.subheading}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <div
            key={f.title}
            className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:border-gray-300 hover:bg-gray-50"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-white">
              {f.custom ? (
                f.custom
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={f.img}
                  alt={f.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
            </div>
            <div className="p-4">
              <h4 className="text-sm font-semibold text-gray-900">{f.title}</h4>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
