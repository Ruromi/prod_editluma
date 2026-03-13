export const siteName = "EditLuma";
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.editluma.com").replace(/\/$/, "");
export const defaultDescription =
  "EditLuma is an AI image generator and photo enhancer for portraits, retouching, upscaling, and fast credit-based image editing.";
export const defaultOgImagePath = "/opengraph-image";

export const defaultKeywords = [
  "AI image generator",
  "AI photo enhancer",
  "AI portrait enhancer",
  "AI image editor",
  "AI photo retouch",
  "photo upscaler",
  "EditLuma",
];

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, `${siteUrl}/`).toString();
}
