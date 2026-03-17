import Link from "next/link";
import { landingCopy, type LandingLanguage } from "@/components/landing/copy";
import { trackEvent } from "@/lib/analytics";

type CTASectionProps = {
  isAuthenticated: boolean;
  language: LandingLanguage;
};

export default function CTASection({ isAuthenticated, language }: CTASectionProps) {
  const copy = landingCopy[language].cta;
  const primaryHref = isAuthenticated
    ? "/dashboard?tab=generate"
    : `/auth/signup?next=${encodeURIComponent("/dashboard?tab=generate")}`;

  return (
    <section className="mx-auto max-w-4xl px-6">
      <div className="relative overflow-hidden rounded-[28px] border border-gray-200 bg-gray-50 px-6 py-8 sm:px-8 sm:py-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, rgba(99,102,241,0.22), transparent 38%), radial-gradient(circle at 80% 75%, rgba(56,189,248,0.12), transparent 32%)",
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent" />

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <span className="inline-flex items-center rounded-full border border-gray-300 bg-white/80 px-3 py-1 text-[11px] font-medium tracking-[0.14em] text-gray-500 uppercase">
              {copy.eyebrow}
            </span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 sm:text-[2rem]">
              {copy.heading}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-500 sm:text-base">
              {copy.body}
            </p>
          </div>

          <div className="flex shrink-0 items-center">
            <Link
              href={primaryHref}
              onClick={() => {
                if (isAuthenticated) {
                  return;
                }

                trackEvent("click_start_free", {
                  cta_location: "bottom_cta",
                  authenticated: isAuthenticated,
                  landing_focus: "creator_portrait_cleanup",
                  language,
                });
              }}
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20"
            >
              {isAuthenticated ? copy.primaryCtaSignedIn : copy.primaryCtaSignedOut}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
