import Link from "next/link";

type KeywordLandingPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryKeyword: string;
  secondaryKeyword: string;
  benefits: string[];
  useCases: string[];
};

export default function KeywordLandingPage({
  eyebrow,
  title,
  description,
  primaryKeyword,
  secondaryKeyword,
  benefits,
  useCases,
}: KeywordLandingPageProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-14 sm:py-20">
        <section className="grid gap-8 rounded-[36px] border border-gray-200 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-8 sm:grid-cols-[1.2fr_0.8fr] sm:p-10">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-indigo-600">
              {eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
              {title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-gray-600">
              {description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/dashboard?tab=generate"
                className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
              >
                Start creating
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
              >
                View pricing
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-[28px] border border-gray-200 bg-white/90 p-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
                Core keywords
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
                  {primaryKeyword}
                </span>
                <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-sm font-medium text-cyan-700">
                  {secondaryKeyword}
                </span>
              </div>
            </div>

            <p className="mt-8 text-sm leading-7 text-gray-500">
              EditLuma combines AI image generation, portrait enhancement, retouching, and credit-based checkout flows in one streamlined product experience.
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-gray-200 bg-white p-7">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
              Why EditLuma
            </p>
            <ul className="mt-5 space-y-4 text-sm leading-7 text-gray-600">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-indigo-500" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[28px] border border-gray-200 bg-white p-7">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
              Popular use cases
            </p>
            <ul className="mt-5 space-y-4 text-sm leading-7 text-gray-600">
              {useCases.map((useCase) => (
                <li key={useCase} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-cyan-500" />
                  <span>{useCase}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
