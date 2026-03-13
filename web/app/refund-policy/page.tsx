import type { Metadata } from "next";
import { createSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata({
  title: "Refund Policy",
  path: "/refund-policy",
  description:
    "Read the EditLuma refund policy for credit purchases, eligibility windows, and refund processing details.",
  keywords: ["refund policy", "credit refund", "AI SaaS refund policy"],
});

const refundPolicyContent = {
  en: {
    eyebrow: "Refund Policy",
    title: "EditLuma Refund Policy",
    description:
      "This page summarizes how refunds work for paid credit purchases made through EditLuma.",
    items: [
      "Refund requests are available within 7 days of purchase.",
      "A full refund is only available when none of the paid credits from that purchase have been used.",
      "Partial refunds are generally not supported once any paid credits from that purchase have been consumed.",
      "Refunds are sent back to the original payment method after review and payment provider processing.",
      "Free credits, promotional credits, and event credits are not refundable.",
    ],
  },
  ko: {
    eyebrow: "환불 정책",
    title: "EditLuma 환불 정책",
    description:
      "이 페이지는 EditLuma에서 구매한 유료 크레딧의 환불 기준과 처리 방식을 요약합니다.",
    items: [
      "환불 요청은 구매일로부터 7일 이내에 가능합니다.",
      "해당 구매 건으로 충전된 유료 크레딧을 전혀 사용하지 않은 경우에만 전액 환불이 가능합니다.",
      "구매한 유료 크레딧을 일부라도 사용한 경우에는 원칙적으로 부분 환불이 지원되지 않습니다.",
      "환불은 운영자 확인과 결제 대행사 처리 후 원래 결제 수단으로 반환됩니다.",
      "무상 크레딧, 프로모션 크레딧, 이벤트 지급 크레딧은 환불 대상이 아닙니다.",
    ],
  },
} as const;

type RefundPolicyPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RefundPolicyPage({
  searchParams,
}: RefundPolicyPageProps) {
  const params = (await searchParams) ?? {};
  const langParam = typeof params.lang === "string" ? params.lang : "en";
  const locale = langParam === "ko" ? "ko" : "en";
  const content = refundPolicyContent[locale];

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="mx-auto max-w-4xl px-6 py-10 sm:py-14">
        <div className="rounded-[32px] border border-gray-800 bg-gray-950/80 p-6 sm:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
            {content.eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {content.title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-400 sm:text-base">
            {content.description}
          </p>
          <ul className="mt-6 list-disc space-y-3 pl-5 text-sm leading-7 text-gray-300 sm:text-[15px]">
            {content.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
