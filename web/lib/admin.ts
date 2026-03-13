type HeadersLike = {
  get(name: string): string | null;
};

const DEFAULT_ADMIN_IPS = ["211.204.0.211"];
const DEFAULT_ADMIN_EMAILS = ["oasis_0421@naver.com"];

function normalizeIp(ip: string) {
  const trimmed = ip.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("::ffff:")) {
    return trimmed.slice("::ffff:".length);
  }
  if (trimmed === "::1") {
    return "127.0.0.1";
  }
  return trimmed;
}

export function getAllowedAdminIps() {
  const raw = process.env.ADMIN_ALLOWED_IPS?.trim();
  const values = (raw ? raw.split(",") : DEFAULT_ADMIN_IPS)
    .map((value) => normalizeIp(value))
    .filter(Boolean);

  if (process.env.NODE_ENV !== "production") {
    values.push("127.0.0.1", "localhost");
  }

  return new Set(values);
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getAllowedAdminEmails() {
  const raw = process.env.ADMIN_EMAILS?.trim();
  const values = (raw ? raw.split(",") : DEFAULT_ADMIN_EMAILS)
    .map((value) => normalizeEmail(value))
    .filter(Boolean);

  return new Set(values);
}

export function getRequestIp(headersLike: HeadersLike) {
  const forwardedFor = headersLike.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0];
    return normalizeIp(first);
  }

  const realIp = headersLike.get("x-real-ip");
  if (realIp) {
    return normalizeIp(realIp);
  }

  return "";
}

export function hasAdminIpAccess(headersLike: HeadersLike) {
  const requestIp = getRequestIp(headersLike);
  if (!requestIp) {
    return false;
  }

  return getAllowedAdminIps().has(requestIp);
}

export function hasAdminEmailAccess(email: string | null | undefined) {
  if (!email) {
    return false;
  }

  return getAllowedAdminEmails().has(normalizeEmail(email));
}

export function hasAdminAccess(
  headersLike: HeadersLike,
  email: string | null | undefined
) {
  return hasAdminIpAccess(headersLike) && hasAdminEmailAccess(email);
}
