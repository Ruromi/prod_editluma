export const siteName = "EditLuma";
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.editluma.com").replace(/\/$/, "");
export const contactEmail = (process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "support@example.com").trim();
export const defaultDescription =
  "EditLuma turns casual photos into LinkedIn-ready, professional profile images and headshots with AI.";
export const defaultOgImagePath = "/opengraph-image";

export const defaultKeywords = [
  "AI profile photo",
  "LinkedIn photo AI",
  "professional headshot AI",
  "AI headshot generator",
  "LinkedIn headshot AI",
  "profile photo enhancer AI",
  "EditLuma",
];

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, `${siteUrl}/`).toString();
}
