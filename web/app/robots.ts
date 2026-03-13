import type { MetadataRoute } from "next";
import { absoluteUrl, siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/auth", "/dashboard", "/mypage", "/billing"],
      },
      {
        userAgent: ["OAI-SearchBot", "ChatGPT-User", "GPTBot"],
        allow: "/",
        disallow: ["/admin", "/auth", "/dashboard", "/mypage", "/billing"],
      },
      {
        userAgent: ["PerplexityBot", "Perplexity-User"],
        allow: "/",
        disallow: ["/admin", "/auth", "/dashboard", "/mypage", "/billing"],
      },
      {
        userAgent: ["ClaudeBot", "Google-Extended", "CCBot"],
        allow: "/",
        disallow: ["/admin", "/auth", "/dashboard", "/mypage", "/billing"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteUrl,
  };
}
