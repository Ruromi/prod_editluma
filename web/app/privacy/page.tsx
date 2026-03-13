import type { Metadata } from "next";
import Link from "next/link";

type PrivacySection = {
  title: string;
  paragraphs?: string[];
  items?: string[];
  note?: string;
};

const effectiveDate = "2026년 3월 13일";

const sections: PrivacySection[] = [
  {
    title: "1. 수집하는 정보",
    items: [
      "회원가입 및 로그인 시 이메일 주소, 이름, 프로필 이미지 등 계정 식별 정보",
      "서비스 이용 과정에서 생성되거나 업로드되는 이미지, 프롬프트, 작업 기록, 결제 및 크레딧 사용 내역",
      "서비스 안정성 확보를 위한 접속 로그, 오류 로그, 기기 및 브라우저 정보",
    ],
  },
  {
    title: "2. 이용 목적",
    items: [
      "회원 식별, 로그인 유지, 고객 문의 대응",
      "AI 이미지 생성 및 보정 기능 제공, 결과물 저장 및 재조회 지원",
      "크레딧 지급, 차감, 결제 처리 및 부정 사용 방지",
      "서비스 품질 개선, 장애 대응, 보안 모니터링",
    ],
  },
  {
    title: "3. 보관 및 파기",
    paragraphs: [
      "회사는 서비스 제공과 법령 준수를 위해 필요한 기간 동안 개인정보를 보관합니다. 회원 탈퇴 또는 처리 목적 달성 후에는 관련 법령에 따라 보관이 필요한 경우를 제외하고 지체 없이 파기합니다.",
    ],
  },
  {
    title: "4. 제3자 제공 및 처리위탁",
    paragraphs: [
      "회사는 서비스 운영을 위해 Supabase, Vercel, Google OAuth, Polar, S3 호환 스토리지 등 외부 서비스를 사용할 수 있습니다. 이 과정에서 서비스 제공에 필요한 범위 내에서 개인정보 처리가 이루어질 수 있습니다.",
    ],
    note:
      "회사는 법령상 요구되거나 서비스 제공에 필수적인 경우를 제외하고 이용자의 개인정보를 임의로 판매하거나 제공하지 않습니다.",
  },
  {
    title: "5. 이용자 권리",
    items: [
      "이용자는 자신의 개인정보에 대해 열람, 정정, 삭제, 처리정지 등을 요청할 수 있습니다.",
      "Google 등 외부 계정 연동 권한은 각 제공자의 계정 설정에서 철회할 수 있습니다.",
      "회원 탈퇴 이후에도 관계 법령상 보존 의무가 있는 정보는 해당 기간 동안 별도 보관될 수 있습니다.",
    ],
  },
  {
    title: "6. 문의",
    paragraphs: [
      "개인정보 처리에 관한 문의가 있으면 서비스 운영자에게 연락해 주시기 바랍니다. 회사는 합리적인 기간 내에 관련 요청을 검토하고 응답합니다.",
    ],
  },
];

export const metadata: Metadata = {
  title: "개인정보처리방침 | EditLuma",
  description: "EditLuma 서비스 개인정보처리방침",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="mx-auto max-w-4xl px-6 py-10 sm:py-14">
        <div className="mb-8 rounded-[32px] border border-gray-800 bg-gray-950/80 p-6 sm:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
            Privacy Policy
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            EditLuma 개인정보처리방침
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-400 sm:text-base">
            본 방침은 EditLuma가 제공하는 로그인, 이미지 생성 및 보정, 결제와 관련하여 어떤 정보를 수집하고 어떻게 사용하는지 설명합니다.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <span className="rounded-full border border-gray-800 bg-gray-900/70 px-3 py-1">
              시행일: {effectiveDate}
            </span>
            <Link
              href="/"
              className="rounded-full border border-gray-800 bg-gray-900/70 px-3 py-1 transition-colors hover:border-gray-700 hover:text-white"
            >
              메인으로 돌아가기
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          {sections.map((section) => (
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
                <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-7 text-gray-300 sm:text-[15px]">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
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
