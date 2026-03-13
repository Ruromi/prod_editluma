import type { Metadata } from "next";
import { createSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata({
  title: "Contact",
  path: "/contact",
  description:
    "Contact EditLuma for billing, refund, privacy, or product support inquiries.",
  keywords: ["EditLuma contact", "AI SaaS support", "billing support"],
});

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="mx-auto max-w-4xl px-6 py-10 sm:py-14">
        <div className="rounded-[32px] border border-gray-800 bg-gray-950/80 p-6 sm:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
            Contact
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Contact EditLuma
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-400 sm:text-base">
            For billing questions, refund requests, privacy issues, or product support, contact us using the email below.
          </p>
          <div className="mt-6 rounded-3xl border border-gray-800 bg-gray-900/70 p-5">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-500">
              Support email
            </p>
            <a
              href="mailto:rurumi1991@gmail.com"
              className="mt-3 inline-flex text-lg font-semibold text-white transition-colors hover:text-indigo-300"
            >
              rurumi1991@gmail.com
            </a>
            <p className="mt-4 text-sm leading-7 text-gray-400">
              Please include your account email, order ID, or checkout ID when asking about payments or refunds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
