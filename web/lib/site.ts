export const siteName = "EditLuma";
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.editluma.com").replace(/\/$/, "");
export const contactEmail = (process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "support@example.com").trim();
export const defaultDescription =
  "EditLuma is an AI portrait enhancer for creators who need cleaner profile photos, selfie retouching, and fast credit-based image cleanup.";
export const defaultOgImagePath = "/opengraph-image";

export const defaultKeywords = [
  "AI portrait enhancer",
  "creator profile photo enhancer",
  "AI selfie retouch",
  "AI photo cleanup",
  "AI photo enhancer",
  "portrait retouch AI",
  "EditLuma",
];

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, `${siteUrl}/`).toString();
}
