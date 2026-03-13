"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

const TABS = [
  { id: "generate", label: "생성" },
  { id: "gallery", label: "갤러리" },
  { id: "history", label: "작업 내역" },
] as const;

export default function DashboardNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isDashboard = pathname.startsWith("/dashboard");
  const isPricing = pathname.startsWith("/pricing") || pathname.startsWith("/billing");
  const tab = isDashboard ? (searchParams.get("tab") ?? "generate") : null;

  return (
    <nav className="flex items-center gap-6">
      {TABS.map((t) =>
        isDashboard ? (
          <button
            key={t.id}
            onClick={() => router.replace(`/dashboard?tab=${t.id}`)}
            className={`text-sm font-medium transition-colors relative pb-0.5 ${
              tab === t.id
                ? "text-gray-900"
                : "text-gray-500 hover:text-gray-400"
            }`}
          >
            {t.label}
            {tab === t.id && (
              <span className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-indigo-500 rounded-full" />
            )}
          </button>
        ) : (
          <Link
            key={t.id}
            href={`/dashboard?tab=${t.id}`}
            className="text-sm font-medium transition-colors relative pb-0.5 text-gray-500 hover:text-gray-400"
          >
            {t.label}
          </Link>
        )
      )}

      <Link
        href="/pricing"
        className={`text-sm font-medium transition-colors relative pb-0.5 ${
          isPricing
            ? "text-gray-900"
            : "text-gray-500 hover:text-gray-400"
        }`}
      >
        요금제
        {isPricing && (
          <span className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-indigo-500 rounded-full" />
        )}
      </Link>
    </nav>
  );
}
