export const CREDIT_BALANCE_STORAGE_KEY = "editluma:credit-balance";
export const CREDIT_BALANCE_UPDATED_EVENT = "editluma:credits-updated";

export function broadcastCreditBalance(balance: number) {
  if (typeof window === "undefined" || !Number.isFinite(balance)) {
    return;
  }

  window.localStorage.setItem(CREDIT_BALANCE_STORAGE_KEY, String(balance));
  window.dispatchEvent(
    new CustomEvent(CREDIT_BALANCE_UPDATED_EVENT, {
      detail: { balance },
    })
  );
}

export function readStoredCreditBalance(): number | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(CREDIT_BALANCE_STORAGE_KEY);
  if (raw === null) {
    return null;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export function clearStoredCreditBalance() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(CREDIT_BALANCE_STORAGE_KEY);
  window.dispatchEvent(
    new CustomEvent(CREDIT_BALANCE_UPDATED_EVENT, {
      detail: { balance: null },
    })
  );
}
