"use client";

import { landingCopy, type LandingLanguage } from "@/components/landing/copy";

type UseCasesSectionProps = {
  language: LandingLanguage;
};

export default function UseCasesSection({ language }: UseCasesSectionProps) {
  const copy = landingCopy[language].useCases;

  return (
    <section id="use-cases" className="mx-auto max-w-6xl px-6 scroll-mt-24">
      <div className="mb-10 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-600">
          {copy.eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          {copy.heading}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-gray-500">
          {copy.subheading}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {copy.items.map((item) => (
          <div
            key={item.id}
            id={`use-case-${item.id}`}
            className="scroll-mt-28 rounded-[1.75rem] border border-gray-200 bg-white px-5 py-5 shadow-[0_18px_50px_-36px_rgba(15,23,42,0.25)]"
          >
            <h3 className="text-lg font-semibold tracking-tight text-gray-900">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.desc}</p>
            <ul className="mt-4 space-y-2">
              {item.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-indigo-500" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
