"use client";

// ---------------------------------------------------------------------------
// Korean Prompt feature card – code-rendered UI mockup (no broken hangul image)
// ---------------------------------------------------------------------------
function KoreanPromptMockup() {
  return (
    <div className="relative h-full w-full flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-xs space-y-3">
        {/* Input bubble */}
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 shadow-sm">
          <p className="text-xs text-gray-500 mb-1.5 font-mono">프롬프트 입력</p>
          <p className="text-sm text-gray-900 leading-relaxed">
            벚꽃이 흩날리는 교토의 골목길
          </p>
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center gap-2 text-indigo-600">
          <div className="h-px w-8 bg-indigo-500/40" />
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
          <div className="h-px w-8 bg-indigo-500/40" />
        </div>

        {/* Translated bubble */}
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 shadow-sm">
          <p className="text-xs text-indigo-600 mb-1.5 font-mono">Auto-translated</p>
          <p className="text-sm text-indigo-600 leading-relaxed">
            A narrow alley in Kyoto with cherry blossom petals falling
          </p>
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center gap-2 text-indigo-600">
          <div className="h-px w-8 bg-indigo-500/40" />
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
          <div className="h-px w-8 bg-indigo-500/40" />
        </div>

        {/* Result */}
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 shadow-sm flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-green-600 font-mono">이미지 생성 완료</p>
            <p className="text-xs text-green-500 mt-0.5">1024 × 1024</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const features = [
  {
    img: "/landing/feature-enhance-portrait.png",
    title: "인물 보정",
    desc: "피부 질감, 선명도, 색감까지 — AI가 자연스럽게 보정",
  },
  {
    img: "/landing/ai-landing_2.png",
    title: "이미지 생성",
    desc: "원하는 장면을 텍스트로 입력하면 AI가 바로 생성",
  },
  {
    img: "/landing/features/selfie-retouch.png",
    title: "셀피 피부 보정",
    desc: "모공, 잡티, 피부톤을 자연스럽게 정리",
  },
  {
    img: "/landing/features/upscale-4k.png",
    title: "4K 업스케일링",
    desc: "저해상도 사진을 고화질로 복원",
  },
  {
    img: "",
    custom: <KoreanPromptMockup />,
    title: "한국어 프롬프트",
    desc: "한국어로 입력하면 자동 번역 후 생성",
  },
  {
    img: "/landing/features/style-transfer.png",
    title: "스타일 변환",
    desc: "사진을 다양한 아트 스타일로 변환",
  },
  {
    img: "/landing/features/easy-upload.png",
    title: "간편 업로드",
    desc: "드래그 앤 드롭으로 바로 보정 시작",
  },
  {
    img: "/landing/features/fast-process.png",
    title: "빠른 처리",
    desc: "대부분의 작업이 수 초 내에 완료",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="mx-auto max-w-5xl px-6">
      <div className="mb-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">이런 걸 할 수 있어요</h2>
        <p className="mt-3 text-sm text-gray-500">
          복잡한 편집 없이, AI가 알아서 처리합니다
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <div
            key={f.title}
            className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:border-gray-300 hover:bg-gray-50"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-white">
              {f.custom ? (
                f.custom
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={f.img}
                  alt={f.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
            </div>
            <div className="p-4">
              <h4 className="text-sm font-semibold text-gray-900">{f.title}</h4>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
