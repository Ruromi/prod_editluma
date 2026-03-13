import { siteUrl } from "@/lib/site";

type HeadersLike = {
  get(name: string): string | null;
};

export function getAllowedAppOrigins() {
  const allowedOrigins = new Set<string>([siteUrl]);

  if (process.env.NODE_ENV !== "production") {
    allowedOrigins.add("http://localhost:3001");
    allowedOrigins.add("http://127.0.0.1:3001");
  }

  return allowedOrigins;
}

export function isAllowedAppOrigin(candidate: string) {
  try {
    const parsed = new URL(candidate);
    return getAllowedAppOrigins().has(parsed.origin);
  } catch {
    return false;
  }
}

export function resolveTrustedRequestOrigin(headersLike: HeadersLike) {
  const origin = headersLike.get("origin");
  if (origin && isAllowedAppOrigin(origin)) {
    return origin;
  }

  const referer = headersLike.get("referer");
  if (referer) {
    try {
      const parsed = new URL(referer);
      if (isAllowedAppOrigin(parsed.origin)) {
        return parsed.origin;
      }
    } catch {
      // ignore malformed referer
    }
  }

  const host = headersLike.get("x-forwarded-host") ?? headersLike.get("host");
  if (host) {
    const proto =
      headersLike.get("x-forwarded-proto") ??
      (host.includes("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
    const candidate = `${proto}://${host}`;
    if (isAllowedAppOrigin(candidate)) {
      return candidate;
    }
  }

  return process.env.NODE_ENV !== "production" ? "http://localhost:3001" : siteUrl;
}

export function isTrustedMutationRequest(headersLike: HeadersLike) {
  const origin = headersLike.get("origin");
  if (origin) {
    return isAllowedAppOrigin(origin);
  }

  const referer = headersLike.get("referer");
  if (referer) {
    try {
      const parsed = new URL(referer);
      return isAllowedAppOrigin(parsed.origin);
    } catch {
      return false;
    }
  }

  const host = headersLike.get("x-forwarded-host") ?? headersLike.get("host");
  if (!host) {
    return false;
  }

  const proto =
    headersLike.get("x-forwarded-proto") ??
    (host.includes("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
  return isAllowedAppOrigin(`${proto}://${host}`);
}
