import type { Metadata } from "next";
import {
  absoluteUrl,
  defaultDescription,
  defaultKeywords,
  defaultOgImagePath,
  siteName,
} from "@/lib/site";

type SeoInput = {
  title: string;
  description?: string;
  path?: string;
  keywords?: string[];
  noIndex?: boolean;
};

export function createSeoMetadata({
  title,
  description = defaultDescription,
  path = "/",
  keywords = [],
  noIndex = false,
}: SeoInput): Metadata {
  const canonical = absoluteUrl(path);
  const mergedKeywords = [...defaultKeywords, ...keywords];

  return {
    title,
    description,
    keywords: mergedKeywords,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
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
      title,
      description,
      images: [defaultOgImagePath],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : undefined,
  };
}
