import Link from "next/link";

export default function LandingFooter() {
  return (
    <footer className="bg-gray-950">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-8 text-sm text-gray-400 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium text-white">EditLuma</p>
          <p className="mt-1">AI 이미지 생성과 보정을 위한 크레딧 기반 서비스</p>
        </div>

        <div className="flex items-center gap-5 text-sm">
          <Link
            href="/pricing"
            className="transition-colors hover:text-white"
          >
            요금제
          </Link>
          <Link
            href="/privacy"
            className="transition-colors hover:text-white"
          >
            개인정보처리방침
          </Link>
          <Link
            href="/terms"
            className="transition-colors hover:text-white"
          >
            이용약관
          </Link>
        </div>
      </div>
    </footer>
  );
}
