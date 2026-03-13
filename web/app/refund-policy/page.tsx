import type { Metadata } from "next";
import { createSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata({
  title: "Refund Policy",
  path: "/refund-policy",
  description:
    "Read the EditLuma refund policy for credit purchases, eligibility windows, and refund processing details.",
  keywords: ["refund policy", "credit refund", "AI SaaS refund policy"],
});

const items = [
  "Refund requests are available within 7 days of purchase.",
  "A full refund is only available when none of the paid credits from that purchase have been used.",
  "Partial refunds are generally not supported once any paid credits from that purchase have been consumed.",
  "Refunds are sent back to the original payment method after review and payment provider processing.",
  "Free credits, promotional credits, and event credits are not refundable.",
];

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="mx-auto max-w-4xl px-6 py-10 sm:py-14">
        <div className="rounded-[32px] border border-gray-800 bg-gray-950/80 p-6 sm:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
            Refund Policy
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            EditLuma Refund Policy
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-400 sm:text-base">
            This page summarizes how refunds work for paid credit purchases made through EditLuma.
          </p>
          <ul className="mt-6 list-disc space-y-3 pl-5 text-sm leading-7 text-gray-300 sm:text-[15px]">
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
