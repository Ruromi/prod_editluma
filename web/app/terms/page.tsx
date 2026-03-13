import type { Metadata } from "next";
import Link from "next/link";

type TermsSection = {
  title: string;
  paragraphs?: string[];
  items?: string[];
  note?: string;
};

const termsContent = {
  en: {
    effectiveDate: "March 6, 2026",
    eyebrow: "Terms Of Service",
    title: "EditLuma Terms of Service",
    description:
      "These terms describe the conditions for using EditLuma's AI image generation, enhancement, credit, and payment features.",
    effectiveLabel: "Effective date",
    homeLabel: "Back to home",
    sections: [
      {
        title: "1. Purpose",
        paragraphs: [
          "These Terms govern the rights, obligations, and responsibilities between EditLuma (the \"Company\") and users of the AI image generation and editing service (the \"Service\").",
        ],
      },
      {
        title: "2. Definitions",
        items: [
          "\"Service\" means AI-based image generation, enhancement, upscaling, style transfer, storage, credit top-up, and related features provided by the Company.",
          "\"User\" means any person who accesses or uses the Service.",
          "\"Member\" means a user who has created an account and entered into a service agreement with the Company.",
          "\"Credits\" means the digital usage units deducted when paid features are used.",
          "\"Paid Credits\" means credits purchased by a member, and \"Free Credits\" means credits granted by the Company through sign-up bonuses, events, or promotions.",
        ],
      },
      {
        title: "3. Posting and Amendment of Terms",
        items: [
          "The Company will make these Terms available through the Service or a linked page so users can review them easily.",
          "The Company may amend these Terms to the extent permitted by applicable law.",
          "When the Terms are amended, the effective date and reason for amendment will be announced at least 7 days in advance. Changes that materially disadvantage users may be announced 30 days in advance.",
        ],
      },
      {
        title: "4. Services Provided",
        items: [
          "AI image generation",
          "AI enhancement, upscaling, retouching, and style transfer",
          "Storage, retrieval, and gallery access for generated or edited outputs",
          "Credit top-up, usage history, and purchase history features",
          "Other related features determined by the Company",
        ],
      },
      {
        title: "5. Account Formation",
        items: [
          "A service agreement is formed when a user agrees to these Terms, applies for membership, and the Company accepts the application.",
          "The Company may refuse registration or terminate an account after the fact in cases such as:",
          "impersonation or submission of false information,",
          "interference with normal service operations or a substantial risk of such interference,",
          "use for purposes prohibited by law or these Terms, or",
          "other cases reasonably deemed inappropriate by the Company.",
        ],
      },
      {
        title: "6. Credits, Pricing, and Payments",
        items: [
          "Paid features require credits, and deduction rules are shown on the relevant feature screen or pricing page.",
          "The Company may grant free credits to new users, subject to conditions stated in the Service or separate notices.",
          "Prices, package composition, and quantities of paid credits are shown on the checkout screen and may change under the Company's operating policies.",
          "Payments are processed through Polar or another payment provider designated by the Company.",
          "Unless otherwise stated, paid credits do not expire. Free or promotional credits may be subject to separate conditions or expiration periods.",
          "Payment cancellations caused by the user's own circumstances, exchange-rate differences, or card issuer fees are handled according to applicable law and payment provider policy.",
        ],
      },
      {
        title: "7. Refund Policy",
        items: [
          "A member may request a full refund within 7 days of purchase only if none of the paid credits from that purchase have been used.",
          "If any portion of the purchased credits has been used, partial refunds are generally not available unless required by law.",
          "Refunds are processed to the original payment method after Company review and payment provider processing.",
          "The actual completion time of a refund may vary depending on the card issuer, payment provider, or financial institution.",
          "Because AI outputs vary depending on prompts, settings, and model behavior, subjective dissatisfaction with results alone does not automatically qualify for a refund.",
          "Free credits, promotional credits, and event credits are not refundable.",
        ],
        note:
          "Repeated payment-refund cycles, suspected abuse, or payment misuse patterns may result in restrictions on service use.",
      },
      {
        title: "8. User Obligations and Prohibited Conduct",
        items: [
          "Users must comply with applicable law, these Terms, and all notices displayed in the Service.",
          "Users must not generate, store, or distribute unlawful content or content that infringes the rights of others.",
          "Users must not use bots, macros, scraping, or any abnormal method to use the Service or acquire credits improperly.",
          "Users must not impersonate others or abuse events or promotions through multiple accounts.",
          "Depending on the severity of the violation, the Company may issue warnings, temporary restrictions, permanent suspension, payment cancellation, or take legal action.",
        ],
      },
      {
        title: "9. Intellectual Property and Outputs",
        items: [
          "Rights in the Service, including software, design, trademarks, logos, text, and interface, belong to the Company or the legitimate rights holder.",
          "To the extent allowed by applicable law and third-party AI model terms, the user is responsible for the lawful use of outputs they generate.",
          "The Company does not claim ownership of outputs created by users, but users must ensure those outputs do not infringe copyrights, trademarks, portrait rights, publicity rights, or other third-party rights.",
          "Users bear legal responsibility for the use, publication, redistribution, and commercial use of content they upload or generate.",
        ],
      },
      {
        title: "10. Privacy",
        paragraphs: [
          "The Company complies with applicable privacy laws. Details on collection, use, retention, deletion, and third-party sharing of personal information are set out in the separate Privacy Policy.",
        ],
      },
      {
        title: "11. Service Changes and Suspension",
        items: [
          "The Company may change all or part of the Service for operational or technical reasons.",
          "The Company may temporarily suspend the Service for maintenance, system repair, equipment failure, network issues, third-party outages, force majeure, or similar reasons.",
          "Where advance notice is possible, the Company will announce changes or interruptions through the Service or its notices page.",
        ],
      },
      {
        title: "12. Limitation of Liability",
        items: [
          "The Company is not liable where the Service cannot be provided due to force majeure such as natural disaster, war, terrorism, regulation, or power/network failure.",
          "The Company is not liable for service issues caused by the user's own actions, including poor account management or credential leakage.",
          "The Company does not guarantee the content, accuracy, legality, completeness, or fitness for a particular purpose of user-generated or uploaded content.",
          "Except in cases of willful misconduct or gross negligence under applicable law, the Company is not liable for loss of images or outputs caused by system failure, data loss, hacking, or server incidents.",
          "Users are responsible for third-party rights violations, defamation, privacy invasion, or unlawful acts arising from their generated or uploaded content.",
          "The Company has no duty to intervene in disputes between users or between users and third parties, and is not liable for related damages.",
        ],
      },
      {
        title: "13. Termination and End of Service",
        items: [
          "Members may request account deletion or termination of the service agreement at any time through the Service.",
          "The Company may terminate an account or restrict access after notice if a member violates these Terms or applicable law. In urgent cases, notice may follow the action.",
          "If the Company decides to discontinue the Service, it will generally announce this 30 days in advance.",
          "In the event of service termination, refunds or compensation for unused paid credits will be determined in accordance with applicable law, payment provider policy, and Company notices.",
          "If generated outputs remain downloadable for a limited period after service termination, the Company will announce that period separately.",
        ],
      },
      {
        title: "14. Governing Law and Dispute Resolution",
        items: [
          "The Company and users will first attempt to resolve disputes through good-faith consultation.",
          "Any unresolved dispute will be governed by and interpreted under the laws of the Republic of Korea.",
          "If litigation is necessary, the court with jurisdiction under the Korean Civil Procedure Act will be the court of first instance.",
        ],
      },
    ] satisfies TermsSection[],
  },
  ko: {
    effectiveDate: "2026년 3월 6일",
    eyebrow: "Terms Of Service",
    title: "EditLuma 이용약관",
    description:
      "아래 약관은 현재 EditLuma의 AI 이미지 생성, 보정, 크레딧 충전, 결제 흐름에 맞춰 정리한 서비스 이용 조건입니다.",
    effectiveLabel: "시행일",
    homeLabel: "메인으로 돌아가기",
    sections: [
      {
        title: "제1조 (목적)",
        paragraphs: [
          "이 약관은 EditLuma 운영자(이하 \"회사\")가 제공하는 AI 이미지 생성 및 편집 서비스(이하 \"서비스\")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.",
        ],
      },
      {
        title: "제2조 (정의)",
        items: [
          "\"서비스\"란 회사가 제공하는 AI 기반 이미지 생성, 보정, 업스케일, 스타일 변환, 결과물 보관, 크레딧 충전 및 이에 부수되는 제반 기능을 의미합니다.",
          "\"이용자\"란 이 약관에 따라 서비스에 접속하거나 서비스를 이용하는 자를 말합니다.",
          "\"회원\"이란 회사와 서비스 이용계약을 체결하고 계정을 생성하여 서비스를 이용하는 자를 말합니다.",
          "\"크레딧\"이란 서비스 내 유료 기능 이용 시 차감되는 디지털 이용 단위를 의미합니다.",
          "\"유료 크레딧\"이란 회원이 결제를 통해 충전한 크레딧을 말하며, \"무상 크레딧\"이란 신규 가입, 이벤트, 프로모션 등으로 회사가 무상 지급한 크레딧을 말합니다.",
        ],
      },
      {
        title: "제3조 (약관의 게시와 개정)",
        items: [
          "회사는 이 약관의 내용을 이용자가 쉽게 확인할 수 있도록 서비스 화면 또는 연결 페이지에 게시합니다.",
          "회사는 관련 법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.",
          "회사가 약관을 개정하는 경우 시행일과 개정 사유를 명시하여 시행일 7일 전부터 공지합니다. 다만 이용자에게 불리한 내용의 변경은 시행일 30일 전부터 공지할 수 있습니다.",
        ],
      },
      {
        title: "제4조 (서비스의 제공)",
        items: [
          "AI 기반 이미지 생성 서비스",
          "AI 기반 이미지 보정, 업스케일, 리터치 및 스타일 변환 서비스",
          "생성 또는 편집 결과물의 저장, 조회 및 갤러리 기능",
          "크레딧 충전, 사용 내역 및 구매 내역 확인 기능",
          "기타 회사가 정하여 제공하는 부가 서비스",
        ],
      },
      {
        title: "제5조 (이용계약의 성립)",
        items: [
          "이용계약은 이용자가 본 약관에 동의하고 회원가입을 신청한 후 회사가 이를 승낙함으로써 성립합니다.",
          "회사는 다음 각 호에 해당하는 경우 회원가입 신청을 거부하거나 사후에 이용계약을 해지할 수 있습니다.",
          "타인의 명의를 도용하거나 허위 정보를 입력한 경우",
          "서비스의 정상적인 운영을 방해하거나 방해할 우려가 있는 경우",
          "관련 법령 또는 본 약관에서 금지하는 목적으로 서비스를 이용하려는 경우",
          "그 밖에 회사가 합리적 기준에 따라 부적절하다고 판단하는 경우",
        ],
      },
      {
        title: "제6조 (크레딧, 요금 및 결제)",
        items: [
          "서비스의 유료 기능 이용에는 크레딧이 필요하며, 차감 기준은 각 기능의 이용 화면 또는 요금제 화면에 표시됩니다.",
          "회사는 신규 회원에게 무상 크레딧을 지급할 수 있으며, 지급 조건과 사용 조건은 서비스 화면 또는 별도 공지에 따릅니다.",
          "유료 크레딧의 가격, 패키지 구성, 제공 수량은 결제 화면에 표시되며, 회사는 운영 정책에 따라 이를 변경할 수 있습니다.",
          "결제는 Polar 또는 회사가 지정하는 결제대행사 및 결제수단을 통해 이루어집니다.",
          "회사가 별도로 유효기간을 고지하지 않은 유료 크레딧은 유효기간 없이 사용할 수 있습니다. 무상 크레딧 또는 프로모션 크레딧은 별도 고지된 조건과 기간이 적용될 수 있습니다.",
          "이용자의 귀책사유로 인한 결제 취소, 환율 차이, 카드사 수수료 등은 관계 법령과 결제대행사의 정책에 따릅니다.",
        ],
      },
      {
        title: "제7조 (환불 정책)",
        items: [
          "회원은 구매일로부터 7일 이내에 해당 구매 건으로 충전된 유료 크레딧을 전혀 사용하지 않은 경우에 한하여 전액 환불을 요청할 수 있습니다.",
          "구매한 크레딧 중 일부라도 사용한 경우에는 해당 구매 건에 대한 부분 환불은 원칙적으로 불가능합니다. 다만 관련 법령에 따라 환불이 인정되는 경우는 예외로 합니다.",
          "환불은 회사의 확인 및 결제대행사 처리 절차를 거쳐 원 결제수단으로 진행됩니다.",
          "환불 승인 후 실제 환불 완료 시점은 카드사, 결제대행사 또는 금융기관의 처리 일정에 따라 달라질 수 있습니다.",
          "AI 모델의 특성상 결과물은 입력 프롬프트, 설정, 학습 특성 등에 따라 달라질 수 있으며, 단순한 결과물의 주관적 불만족만으로는 환불 사유가 되지 않습니다.",
          "무상 크레딧, 프로모션 크레딧, 이벤트 지급 크레딧은 환불 대상에서 제외됩니다.",
        ],
        note: "반복적인 결제 후 환불 요청, 부정 사용 정황 또는 결제 악용 패턴이 확인되는 경우 서비스 이용이 제한될 수 있습니다.",
      },
      {
        title: "제8조 (이용자의 의무 및 금지행위)",
        items: [
          "이용자는 관련 법령, 본 약관, 서비스 화면에 표시된 안내사항을 준수하여야 합니다.",
          "이용자는 타인의 권리를 침해하거나 불법적인 콘텐츠를 생성, 저장, 배포하여서는 안 됩니다.",
          "이용자는 자동화 도구, 봇, 매크로, 스크래핑 등 비정상적인 방식으로 서비스를 이용하거나 크레딧을 부정 취득하여서는 안 됩니다.",
          "이용자는 타인의 계정을 도용하거나 다중 계정을 이용하여 이벤트 또는 프로모션을 부정하게 악용하여서는 안 됩니다.",
          "회사는 위반 정도에 따라 경고, 일시 제한, 영구 정지, 결제 취소, 법적 조치 등의 조치를 취할 수 있습니다.",
        ],
      },
      {
        title: "제9조 (지식재산권 및 결과물)",
        items: [
          "서비스 및 서비스 내 제공되는 소프트웨어, 디자인, 상표, 로고, 문구, 인터페이스 등에 관한 권리는 회사 또는 정당한 권리자에게 귀속됩니다.",
          "관련 법령 및 제3자 AI 모델 제공자의 이용조건이 허용하는 범위 내에서, 이용자가 적법하게 생성한 결과물에 대한 이용 책임과 판단은 이용자에게 있습니다.",
          "회사는 이용자가 생성한 결과물 자체에 대한 권리를 주장하지 않으나, 이용자는 해당 결과물이 제3자의 저작권, 상표권, 초상권, 퍼블리시티권 등 권리를 침해하지 않도록 주의하여야 합니다.",
          "이용자가 생성 또는 업로드한 콘텐츠의 사용, 게시, 재배포, 상업적 이용에 관한 법적 책임은 이용자에게 있습니다.",
        ],
      },
      {
        title: "제10조 (개인정보보호)",
        paragraphs: [
          "회사는 이용자의 개인정보를 보호하기 위해 관련 법령을 준수하며, 개인정보의 수집, 이용, 보관, 파기 및 제3자 제공 등에 관한 사항은 별도의 개인정보처리방침에 따릅니다.",
        ],
      },
      {
        title: "제11조 (서비스의 변경 및 중단)",
        items: [
          "회사는 운영상, 기술상 필요에 따라 서비스의 전부 또는 일부를 변경할 수 있습니다.",
          "회사는 정기점검, 시스템 보수, 설비 장애, 네트워크 장애, 제3자 서비스 장애, 천재지변, 국가비상사태 등 불가피한 사유가 있는 경우 서비스 제공을 일시적으로 중단할 수 있습니다.",
          "회사는 사전 공지가 가능한 경우 서비스 화면 또는 공지사항을 통해 변경 또는 중단 사실을 안내합니다.",
        ],
      },
      {
        title: "제12조 (책임의 제한)",
        items: [
          "회사는 천재지변, 전쟁, 테러, 정부 규제, 전력 또는 통신망 장애 등 불가항력으로 인하여 서비스를 제공할 수 없는 경우 책임을 지지 않습니다.",
          "회사는 이용자의 귀책사유로 인한 서비스 이용 장애, 계정 관리 소홀, 비밀번호 유출 등에 대하여 책임을 지지 않습니다.",
          "회사는 이용자가 생성하거나 업로드한 콘텐츠의 내용, 정확성, 적법성, 완성도, 특정 목적 적합성에 대해 보증하지 않습니다.",
          "회사는 시스템 장애, 데이터 손실, 해킹, 서버 장애 등으로 인한 이미지 또는 결과물의 손실에 관하여 관련 법령상 회사의 고의 또는 중대한 과실이 있는 경우를 제외하고 책임을 지지 않습니다.",
          "이용자가 생성 또는 업로드한 콘텐츠로 인해 제3자의 권리 침해, 명예훼손, 프라이버시 침해, 불법행위 등이 발생한 경우 그에 따른 책임은 이용자에게 있습니다.",
          "회사는 이용자 상호 간 또는 이용자와 제3자 간 분쟁에 개입할 의무가 없으며, 관련 손해에 대해 책임을 지지 않습니다.",
        ],
      },
      {
        title: "제13조 (계약 해지 및 서비스 종료)",
        items: [
          "회원은 언제든지 서비스에서 제공하는 방법으로 이용계약 해지 또는 계정 삭제를 요청할 수 있습니다.",
          "회사는 회원이 본 약관 또는 관련 법령을 위반하는 경우 사전 통지 후 이용계약을 해지하거나 서비스 이용을 제한할 수 있습니다. 다만 긴급한 경우 사후 통지할 수 있습니다.",
          "회사는 서비스 운영을 종료할 필요가 있는 경우 원칙적으로 30일 전에 공지합니다.",
          "서비스 종료 시 미사용 유료 크레딧의 환불 또는 보상 여부는 관련 법령, 결제대행사 정책 및 회사의 별도 공지에 따릅니다.",
          "회사는 서비스 종료 시 생성된 결과물의 다운로드 가능 기간이 있는 경우 이를 별도로 안내합니다.",
        ],
      },
      {
        title: "제14조 (준거법 및 분쟁해결)",
        items: [
          "회사와 이용자 간 발생한 분쟁은 상호 협의를 통해 우선 해결하도록 노력합니다.",
          "협의로 해결되지 않는 분쟁은 대한민국 법령에 따라 규율되고 해석됩니다.",
          "소송이 필요한 경우 민사소송법에 따른 관할법원을 제1심 관할법원으로 합니다.",
        ],
      },
    ] satisfies TermsSection[],
  },
} as const;

export const metadata: Metadata = {
  title: "Terms of Service | EditLuma",
  description: "EditLuma terms of service",
};

type TermsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TermsPage({ searchParams }: TermsPageProps) {
  const params = (await searchParams) ?? {};
  const langParam = typeof params.lang === "string" ? params.lang : "en";
  const locale = langParam === "ko" ? "ko" : "en";
  const content = termsContent[locale];

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="mx-auto max-w-4xl px-6 py-10 sm:py-14">
        <div className="mb-8 rounded-[32px] border border-gray-800 bg-gray-950/80 p-6 sm:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
            {content.eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {content.title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-400 sm:text-base">
            {content.description}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <span className="rounded-full border border-gray-800 bg-gray-900/70 px-3 py-1">
              {content.effectiveLabel}: {content.effectiveDate}
            </span>
            <Link
              href="/"
              className="rounded-full border border-gray-800 bg-gray-900/70 px-3 py-1 transition-colors hover:border-gray-700 hover:text-white"
            >
              {content.homeLabel}
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          {content.sections.map((section) => (
            <section
              key={section.title}
              className="rounded-[28px] border border-gray-800 bg-gray-950/80 p-6 sm:p-7"
            >
              <h2 className="text-lg font-semibold text-white sm:text-xl">
                {section.title}
              </h2>

              {section.paragraphs?.length ? (
                <div className="mt-4 space-y-3 text-sm leading-7 text-gray-300 sm:text-[15px]">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              ) : null}

              {section.items?.length ? (
                <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-7 text-gray-300 sm:text-[15px]">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
              ) : null}

              {section.note ? (
                <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm leading-6 text-amber-200">
                  {section.note}
                </div>
              ) : null}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
