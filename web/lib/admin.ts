type HeadersLike = {
  get(name: string): string | null;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getAllowedAdminEmails() {
  const raw = process.env.ADMIN_EMAILS?.trim();
  const values = (raw ? raw.split(",") : [])
    .map((value) => normalizeEmail(value))
    .filter(Boolean);

  return new Set(values);
}

export function hasAdminEmailAccess(email: string | null | undefined) {
  if (!email) {
    return false;
  }

  return getAllowedAdminEmails().has(normalizeEmail(email));
}

export function hasAdminAccess(
  _headersLike: HeadersLike,
  email: string | null | undefined
) {
  return hasAdminEmailAccess(email);
}
