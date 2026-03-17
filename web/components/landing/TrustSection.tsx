"use client";

import { landingCopy, type LandingLanguage } from "@/components/landing/copy";

type TrustSectionProps = {
  language: LandingLanguage;
};

export default function TrustSection({ language }: TrustSectionProps) {
  const copy = landingCopy[language].trust;

  return (
    <section id="proof" className="mx-auto max-w-6xl px-6">
      <div className="rounded-[32px] border border-gray-200 bg-white p-7 shadow-sm sm:p-8">
        <div className="max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-indigo-600">
            {copy.eyebrow}
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
            {copy.heading}
          </h2>
          <p className="mt-4 text-sm leading-7 text-gray-500 sm:text-base">
            {copy.subheading}
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {copy.metrics.map((metric) => (
            <article
              key={metric.label}
              className="rounded-[24px] border border-gray-200 bg-gray-50 px-5 py-5"
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-gray-500">
                {metric.label}
              </p>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-gray-900">
                {metric.value}
              </p>
              <p className="mt-3 text-sm leading-6 text-gray-500">
                {metric.detail}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-6 rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-amber-700">
            {copy.limitationTitle}
          </p>
          <p className="mt-3 text-sm leading-7 text-amber-900">
            {copy.limitationBody}
          </p>
        </div>
      </div>
    </section>
  );
}
