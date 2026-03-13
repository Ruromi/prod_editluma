import type { Metadata } from "next";
import { createSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata({
  title: "Contact",
  path: "/contact",
  description:
    "Contact EditLuma for billing, refund, privacy, or product support inquiries.",
  keywords: ["EditLuma contact", "AI SaaS support", "billing support"],
});

const contactContent = {
  en: {
    eyebrow: "Contact",
    title: "Contact EditLuma",
    description:
      "For billing questions, refund requests, privacy issues, or product support, contact us using the email below.",
    supportEmailLabel: "Support email",
    supportHint:
      "Please include your account email, order ID, or checkout ID when asking about payments or refunds.",
  },
  ko: {
    eyebrow: "문의",
    title: "EditLuma 문의",
    description:
      "결제 문의, 환불 요청, 개인정보 관련 문의, 제품 지원이 필요하면 아래 이메일로 연락해 주세요.",
    supportEmailLabel: "문의 메일",
    supportHint:
      "결제 또는 환불 문의 시 계정 이메일, 주문 ID 또는 체크아웃 ID를 함께 적어주시면 더 빠르게 확인할 수 있습니다.",
  },
} as const;

type ContactPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = (await searchParams) ?? {};
  const langParam = typeof params.lang === "string" ? params.lang : "en";
  const locale = langParam === "ko" ? "ko" : "en";
  const content = contactContent[locale];

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
          <div className="mt-6 rounded-3xl border border-gray-800 bg-gray-900/70 p-5">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-500">
              {content.supportEmailLabel}
            </p>
            <a
              href="mailto:rurumi1991@gmail.com"
              className="mt-3 inline-flex text-lg font-semibold text-white transition-colors hover:text-indigo-300"
            >
              rurumi1991@gmail.com
            </a>
            <p className="mt-4 text-sm leading-7 text-gray-400">
              {content.supportHint}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
