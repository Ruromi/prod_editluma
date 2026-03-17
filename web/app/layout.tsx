import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { cookies } from "next/headers";
import DashboardNav from "@/components/DashboardNav";
import UserMenu from "@/components/UserMenu";
import {
  LANDING_LANGUAGE_COOKIE,
  normalizeLandingLanguage,
} from "@/lib/landing-language";
import { defaultDescription, defaultOgImagePath, siteName, siteUrl } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} | AI Portrait Enhancer for Creators`,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  openGraph: {
    title: `${siteName} | AI Portrait Enhancer for Creators`,
    description: defaultDescription,
    url: siteUrl,
    siteName,
    type: "website",
    locale: "en_US",
    images: [
      {
        url: defaultOgImagePath,
        width: 1200,
        height: 630,
        alt: `${siteName} Open Graph image`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} | AI Portrait Enhancer for Creators`,
    description: defaultDescription,
    images: [defaultOgImagePath],
  },
};

const isDevelopment = process.env.NEXT_PUBLIC_ENVIRONMENT === "dev";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const initialLanguage = normalizeLandingLanguage(
    cookieStore.get(LANDING_LANGUAGE_COOKIE)?.value
  );

  return (
    <html lang={initialLanguage}>
      <body className="bg-white text-gray-800 min-h-screen">
        <header className="sticky top-0 z-40 border-b border-gray-200/50 bg-white/80 backdrop-blur-md px-6 h-14 flex items-center">
          {/* 좌: 로고 */}
          <div className="flex items-center gap-2 w-40">
            <Link href="/" className="text-lg font-semibold text-gray-900 tracking-tight hover:text-gray-700 transition-colors">EditLuma</Link>
            {isDevelopment && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">dev</span>
            )}
          </div>
          {/* 중앙: 대시보드 탭 nav */}
          <div className="flex-1 flex justify-center">
            <Suspense>
              <DashboardNav initialLanguage={initialLanguage} />
            </Suspense>
          </div>
          {/* 우: 사용자 메뉴 */}
          <div className="w-40 flex justify-end">
            <Suspense>
              <UserMenu initialLanguage={initialLanguage} />
            </Suspense>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
