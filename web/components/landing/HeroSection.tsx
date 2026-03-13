"use client";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="pt-20 pb-16 sm:pt-28 sm:pb-24">
      <div className="mx-auto max-w-4xl px-6 text-center">
        {/* Headline */}
        <h1 className="text-4xl font-bold leading-[1.15] tracking-tight text-gray-900 sm:text-6xl">
          사진 한 장의 차이,
          <br />
          <span className="text-indigo-600">AI가 만듭니다</span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-gray-500 sm:text-lg">
          업로드 한 번으로 인물 보정부터
          <br className="hidden sm:block" />
          프롬프트 한 줄로 이미지 생성까지.
        </p>

        {/* CTA */}
        <div className="mt-10 flex items-center justify-center gap-6">
          <Link
            href="/dashboard"
            className="rounded-lg bg-indigo-600 px-8 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-indigo-500"
          >
            무료로 시작하기
          </Link>
          <a
            href="#features"
            className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            기능 보기 →
          </a>
        </div>
      </div>
    </section>
  );
}
