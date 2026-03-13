"use client";
import { landingCopy, type LandingLanguage } from "@/components/landing/copy";

type GallerySectionProps = {
  language: LandingLanguage;
};

export default function GallerySection({ language }: GallerySectionProps) {
  const copy = landingCopy[language].gallery;

  return (
    <section className="mx-auto max-w-6xl px-6">
      <div className="mb-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">{copy.heading}</h2>
        <p className="mt-3 text-sm text-gray-500">{copy.subheading}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {copy.items.map((g) => (
          <div
            key={g.src}
            className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:border-gray-300 hover:shadow-xl hover:shadow-indigo-500/5"
          >
            <div className="relative aspect-square w-full overflow-hidden bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={g.src}
                alt={g.alt}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
            <div className="space-y-2 px-5 py-4">
              <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-500">
                {g.label}
              </span>
              <p className="text-sm leading-relaxed text-gray-700">{g.summary}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
