"use client";

import { landingCopy, type LandingLanguage } from "@/components/landing/copy";

type TrustSectionProps = {
  language: LandingLanguage;
};

export default function TrustSection({ language }: TrustSectionProps) {
  const copy = landingCopy[language].trust;

  return (
    <section className="mx-auto max-w-6xl px-6">
      <div className="overflow-hidden rounded-[2rem] border border-gray-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-6 py-8 sm:px-8 sm:py-10">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
            {copy.eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {copy.heading}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">{copy.subheading}</p>
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm leading-relaxed text-emerald-900">
          {copy.note}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {copy.items.map((item) => (
            <div
              key={item.title}
              className="rounded-[1.5rem] border border-gray-200 bg-white px-5 py-5 shadow-[0_18px_50px_-36px_rgba(15,23,42,0.25)]"
            >
              <h3 className="text-base font-semibold tracking-tight text-gray-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
