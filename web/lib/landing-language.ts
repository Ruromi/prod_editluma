export const LANDING_LANGUAGE_COOKIE = "editluma_lang";
export const LANDING_LANGUAGE_STORAGE_KEY = "editluma_lang";
export const LANDING_LANGUAGE_EVENT = "editluma-language-change";

export type HeaderLanguage = "en" | "ko";

export function normalizeLandingLanguage(value?: string | null): HeaderLanguage {
  return value === "ko" ? "ko" : "en";
}

function readCookieValue(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const encodedName = `${name}=`;
  const match = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(encodedName));

  return match ? decodeURIComponent(match.slice(encodedName.length)) : null;
}

export function readBrowserLandingLanguage(): HeaderLanguage {
  if (typeof window === "undefined") {
    return "en";
  }

  const stored = window.localStorage.getItem(LANDING_LANGUAGE_STORAGE_KEY);
  if (stored) {
    return normalizeLandingLanguage(stored);
  }

  return normalizeLandingLanguage(readCookieValue(LANDING_LANGUAGE_COOKIE));
}

export function persistLandingLanguage(language: HeaderLanguage) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LANDING_LANGUAGE_STORAGE_KEY, language);
  document.cookie = `${LANDING_LANGUAGE_COOKIE}=${encodeURIComponent(language)}; path=/; max-age=31536000; samesite=lax`;
  window.dispatchEvent(
    new CustomEvent<{ language: HeaderLanguage }>(LANDING_LANGUAGE_EVENT, {
      detail: { language },
    })
  );
}
