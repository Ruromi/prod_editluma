"use client";

import { landingCopy, type LandingLanguage } from "@/components/landing/copy";

type FeaturesSectionProps = {
  language: LandingLanguage;
};

type FeatureCard = {
  img: string;
  title: string;
  desc: string;
};

export default function FeaturesSection({ language }: FeaturesSectionProps) {
  const copy = landingCopy[language].features;
  const features: FeatureCard[] = copy.items;

  return (
    <section id="features" className="mx-auto max-w-6xl px-6">
      <div className="mb-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">{copy.heading}</h2>
        <p className="mt-3 text-sm text-gray-500">{copy.subheading}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <div
            key={f.title}
            className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:border-gray-300 hover:bg-gray-50"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={f.img}
                alt={f.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
            <div className="flex flex-1 flex-col p-4">
              <h4 className="text-sm font-semibold text-gray-900">{f.title}</h4>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
