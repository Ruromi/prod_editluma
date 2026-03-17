"use client";

export type AnalyticsEventName =
  | "visit_landing"
  | "click_start_free"
  | "signup_complete"
  | "first_image_done"
  | "visit_pricing"
  | "purchase_credit";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    posthog?: {
      capture?: (eventName: string, properties?: Record<string, unknown>) => void;
      identify?: (distinctId: string, properties?: Record<string, unknown>) => void;
      reset?: () => void;
    };
  }
}

function canUseBrowserStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readStorage(key: string) {
  if (!canUseBrowserStorage()) {
    return null;
  }

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  if (!canUseBrowserStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage write failures in private mode or locked-down browsers.
  }
}

function normalizeProperties(properties: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined)
  );
}

export function identifyUser(userId: string, properties: Record<string, unknown> = {}) {
  if (typeof window === "undefined") {
    return;
  }

  window.posthog?.identify?.(userId, normalizeProperties(properties));
}

export function trackEvent(
  eventName: AnalyticsEventName,
  properties: Record<string, unknown> = {}
) {
  if (typeof window === "undefined") {
    return;
  }

  const payload = normalizeProperties(properties);

  window.gtag?.("event", eventName, payload);
  window.posthog?.capture?.(eventName, payload);
}

export function trackEventOnce(
  eventName: AnalyticsEventName,
  dedupeKey: string,
  properties: Record<string, unknown> = {}
) {
  const storageKey = `editluma.analytics.${dedupeKey}`;
  if (readStorage(storageKey)) {
    return false;
  }

  writeStorage(storageKey, "1");
  trackEvent(eventName, properties);
  return true;
}
