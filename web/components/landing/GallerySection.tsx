"use client";

const gallery = [
  {
    src: "/landing/gallery-enhance.png",
    alt: "AI 화질 보정 비포 앤 애프터",
    label: "화질 보정",
    summary: "흐릿한 사진을 더 또렷하고 선명하게 복원",
  },
  {
    src: "/landing/ai-landing.png",
    alt: "AI 생성 이미지 예시",
    label: "AI 생성",
    summary: "프롬프트 한 줄로 완성한 콘셉트 이미지",
  },
  {
    src: "/landing/hero-main.png",
    alt: "AI 인물 보정 결과",
    label: "인물 보정",
    summary: "피부톤과 디테일을 자연스럽게 정리한 결과",
  },
  {
    src: "/landing/ai-landing_2.png",
    alt: "AI 생성 판타지 이미지 예시",
    label: "컨셉 아트",
    summary: "분위기 중심 프롬프트로 만든 감성 장면",
  },
  {
    src: "/landing/features/selfie-retouch.png",
    alt: "셀피 리터치 결과 예시",
    label: "셀피 리터치",
    summary: "잡티와 피부 질감을 과하지 않게 보정",
  },
  {
    src: "/landing/features/style-transfer.png",
    alt: "스타일 변환 결과 예시",
    label: "스타일 변환",
    summary: "원본 분위기를 살리면서 스타일만 재해석",
  },
];

export default function GallerySection() {
  return (
    <section className="mx-auto max-w-6xl px-6">
      <div className="mb-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">결과물 미리보기</h2>
        <p className="mt-3 text-sm text-gray-500">
          생성과 보정 결과를 한 번에 둘러볼 수 있습니다
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {gallery.map((g) => (
          <div
            key={g.src}
            className="group overflow-hidden rounded-2xl border border-gray-200 bg-gray-900/60 transition-all duration-300 hover:border-gray-300 hover:shadow-xl hover:shadow-indigo-500/5"
          >
            <div className="relative aspect-square w-full overflow-hidden bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={g.src}
                alt={g.alt}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
            <div className="space-y-2 px-5 py-4">
              <span className="inline-flex rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-500">
                {g.label}
              </span>
              <p className="text-sm leading-relaxed text-gray-600">{g.summary}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
