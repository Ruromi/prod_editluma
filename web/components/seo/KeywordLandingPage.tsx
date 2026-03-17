import Image from "next/image";
import Link from "next/link";
import type { KeywordLandingContent } from "@/lib/keyword-landings";
import { absoluteUrl, contactEmail } from "@/lib/site";

export default function KeywordLandingPage({
  path,
  eyebrow,
  title,
  description,
  primaryKeyword,
  secondaryKeyword,
  heroVisual,
  highlights,
  benefitsIntro,
  benefits,
  workflowIntro,
  steps,
  useCasesIntro,
  useCases,
  faqIntro,
  faq,
  relatedIntro,
  relatedPages,
  cta,
}: KeywordLandingContent) {
  const activeCtaVariant =
    cta.variants[cta.activeVariantIndex] ?? cta.variants[0];
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.answer,
      },
    })),
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: title,
        item: absoluteUrl(path),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.12),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(6,182,212,0.12),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#ffffff_38%,_#f8fafc_100%)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10 sm:py-14">
        <section className="overflow-hidden rounded-[36px] border border-gray-200 bg-white/90 p-8 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.38)] backdrop-blur sm:p-10">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-sm text-gray-500"
          >
            <Link href="/" className="transition-colors hover:text-gray-900">
              Home
            </Link>
            <span>/</span>
            <span className="text-gray-900">{eyebrow}</span>
          </nav>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-indigo-600">
                {eyebrow}
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                {title}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-gray-600">
                {description}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
                  {primaryKeyword}
                </span>
                <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-sm font-medium text-cyan-700">
                  {secondaryKeyword}
                </span>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={cta.primaryHref}
                  className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
                >
                  {activeCtaVariant.label}
                </Link>
                <Link
                  href={cta.secondaryHref}
                  className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
                >
                  {cta.secondaryLabel}
                </Link>
              </div>

              <p className="mt-4 max-w-xl text-sm leading-7 text-gray-500">
                {activeCtaVariant.supportingText}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="relative overflow-hidden rounded-[30px] border border-gray-200 bg-gray-100 aspect-[4/3]">
                <Image
                  src={heroVisual.src}
                  alt={heroVisual.alt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 34rem, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-5 py-5">
                  <span className="inline-flex rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white">
                    {heroVisual.badge}
                  </span>
                  <p className="mt-3 max-w-md text-sm leading-6 text-white/88">
                    {heroVisual.caption}
                  </p>
                </div>
              </div>

              <div className="grid gap-3">
                {highlights.map((highlight) => (
                  <article
                    key={highlight.label}
                    className="rounded-[24px] border border-gray-200 bg-gray-50 px-5 py-5"
                  >
                    <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-gray-500">
                      {highlight.label}
                    </p>
                    <p className="mt-2 text-lg font-semibold tracking-tight text-gray-900">
                      {highlight.value}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-gray-500">
                      {highlight.detail}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-gray-200 bg-white p-8 shadow-sm sm:p-10">
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-indigo-600">
              Why this workflow
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-gray-900">
              Practical reasons to use {primaryKeyword}
            </h2>
            <p className="mt-4 text-base leading-8 text-gray-600">
              {benefitsIntro}
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {benefits.map((benefit) => (
              <article
                key={benefit.title}
                className="rounded-[24px] border border-gray-200 bg-gray-50 px-6 py-6"
              >
                <p className="text-lg font-semibold tracking-tight text-gray-900">
                  {benefit.title}
                </p>
                <p className="mt-3 text-sm leading-7 text-gray-600">
                  {benefit.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[32px] border border-gray-200 bg-white p-8 shadow-sm sm:p-10">
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-indigo-600">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-gray-900">
              A simple path from weak input to usable output
            </h2>
            <p className="mt-4 text-base leading-8 text-gray-600">
              {workflowIntro}
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {steps.map((step, index) => (
              <article
                key={step.title}
                className="rounded-[24px] border border-gray-200 bg-gray-50 px-6 py-6"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <p className="mt-5 text-lg font-semibold tracking-tight text-gray-900">
                  {step.title}
                </p>
                <p className="mt-3 text-sm leading-7 text-gray-600">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="use-cases"
          className="rounded-[32px] border border-gray-200 bg-white p-8 shadow-sm sm:p-10"
        >
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-indigo-600">
              Use cases
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-gray-900">
              Real production moments where this page earns its keep
            </h2>
            <p className="mt-4 text-base leading-8 text-gray-600">
              {useCasesIntro}
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {useCases.map((useCase) => (
              <article
                key={useCase.title}
                className="rounded-[24px] border border-gray-200 bg-gray-50 px-6 py-6"
              >
                <p className="text-lg font-semibold tracking-tight text-gray-900">
                  {useCase.title}
                </p>
                <p className="mt-3 text-sm leading-7 text-gray-600">
                  {useCase.description}
                </p>
                <ul className="mt-4 space-y-2 text-sm leading-6 text-gray-500">
                  {useCase.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-cyan-500" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[32px] border border-gray-200 bg-white p-8 shadow-sm sm:p-10">
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-indigo-600">
              FAQ
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-gray-900">
              Questions people usually ask before they try this workflow
            </h2>
            <p className="mt-4 text-base leading-8 text-gray-600">
              {faqIntro}
            </p>
          </div>

          <div className="mt-8 space-y-3">
            {faq.map((entry, index) => (
              <details
                key={entry.question}
                open={index === 0}
                className="group rounded-[24px] border border-gray-200 bg-gray-50 px-6 py-5"
              >
                <summary className="cursor-pointer list-none text-base font-semibold tracking-tight text-gray-900">
                  <span className="flex items-start justify-between gap-4">
                    <span>{entry.question}</span>
                    <span className="text-gray-400 transition-transform group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-4 max-w-4xl text-sm leading-7 text-gray-600">
                  {entry.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        <section className="rounded-[32px] border border-gray-200 bg-white p-8 shadow-sm sm:p-10">
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-indigo-600">
              Related workflows
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-gray-900">
              Keep the visitor moving to the next useful page
            </h2>
            <p className="mt-4 text-base leading-8 text-gray-600">
              {relatedIntro}
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {relatedPages.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className="group rounded-[24px] border border-gray-200 bg-gray-50 px-6 py-6 transition-colors hover:border-indigo-200 hover:bg-indigo-50/50"
              >
                <p className="text-lg font-semibold tracking-tight text-gray-900 transition-colors group-hover:text-indigo-700">
                  {page.title}
                </p>
                <p className="mt-3 text-sm leading-7 text-gray-600">
                  {page.description}
                </p>
                <p className="mt-5 text-sm font-medium text-indigo-600">
                  Explore page
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="relative overflow-hidden rounded-[32px] border border-gray-200 bg-gray-950 px-8 py-8 text-white shadow-sm sm:px-10 sm:py-10">
          <div
            className="pointer-events-none absolute inset-0 opacity-50"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(circle at 20% 20%, rgba(99,102,241,0.36), transparent 32%), radial-gradient(circle at 85% 25%, rgba(34,211,238,0.2), transparent 28%)",
            }}
          />
          <div className="relative">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-indigo-200">
              {cta.eyebrow}
            </p>
            <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
              {cta.heading}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
              {cta.body}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={cta.primaryHref}
                className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-gray-950 transition-colors hover:bg-indigo-50"
              >
                {activeCtaVariant.label}
              </Link>
              <Link
                href={cta.secondaryHref}
                className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/15"
              >
                {cta.secondaryLabel}
              </Link>
            </div>
            <p className="mt-4 text-sm leading-7 text-white/65">
              {activeCtaVariant.supportingText}
            </p>
          </div>
        </section>

        <footer className="rounded-[28px] border border-gray-200 bg-white px-6 py-6 text-sm text-gray-500 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-medium text-gray-900">EditLuma</p>
              <p className="mt-1 max-w-2xl">
                Professional profile photo AI for cleaner LinkedIn headshots, founder bios, and polished public-facing photos.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Link href="/" className="transition-colors hover:text-gray-900">
                Home
              </Link>
              <Link href="/pricing" className="transition-colors hover:text-gray-900">
                Pricing
              </Link>
              <Link href="/contact" className="transition-colors hover:text-gray-900">
                Contact
              </Link>
              <Link href="/privacy" className="transition-colors hover:text-gray-900">
                Privacy
              </Link>
              <Link href="/terms" className="transition-colors hover:text-gray-900">
                Terms
              </Link>
              <a
                href={`mailto:${contactEmail}`}
                className="transition-colors hover:text-gray-900"
              >
                {contactEmail}
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
