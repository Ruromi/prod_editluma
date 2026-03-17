"use client";

import { landingCopy, type LandingLanguage } from "@/components/landing/copy";

type ProblemSectionProps = {
  language: LandingLanguage;
};

export default function ProblemSection({ language }: ProblemSectionProps) {
  const copy = landingCopy[language].problem;

  return (
    <section className="mx-auto max-w-6xl px-6">
      <div className="mb-10 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-600">
          {copy.eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          {copy.heading}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-gray-500">
          {copy.subheading}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {copy.items.map((item, index) => (
          <div
            key={item.title}
            className="rounded-[1.75rem] border border-gray-200 bg-white px-5 py-5 shadow-[0_18px_50px_-36px_rgba(15,23,42,0.25)]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-sm font-semibold text-rose-600">
              0{index + 1}
            </div>
            <h3 className="mt-4 text-lg font-semibold tracking-tight text-gray-900">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
