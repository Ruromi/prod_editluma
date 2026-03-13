"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  broadcastCreditBalance,
  clearStoredCreditBalance,
  readStoredCreditBalance,
} from "@/lib/credits";
import { createClient } from "@/lib/supabase/client";

type CreditSummary = {
  balance: number;
  cost_per_image: number;
  initial_credits: number;
};

type BillingPackage = {
  id: string;
  name: string;
  badge: string;
  price: number;
  credits: number;
  bonus: number;
  total_credits: number;
  description: string;
  highlight: boolean;
  currency: string;
  available: boolean;
};

type BillingHistoryItem = {
  id: string;
  source_id: string;
  credits_added: number;
  balance_after: number;
  description?: string | null;
  package_id?: string | null;
  package_name?: string | null;
  product_id?: string | null;
  checkout_id?: string | null;
  order_id?: string | null;
  amount?: number | null;
  currency?: string | null;
  created_at: string;
};

type UsageHistoryItem = {
  id: string;
  source_id: string;
  credits_used: number;
  balance_after: number;
  description?: string | null;
  job_id?: string | null;
  filename?: string | null;
  mode?: string | null;
  prompt?: string | null;
  created_at: string;
};

type BillingPackagesResponse = {
  packages: BillingPackage[];
  provider: string;
  mode: string;
};

const ZERO_DECIMAL_CURRENCIES = new Set(["KRW", "JPY"]);

function normalizeCurrencyAmount(amount: number, currency?: string | null) {
  const normalizedCurrency = (currency ?? "").toUpperCase();
  if (!normalizedCurrency) {
    return amount;
  }

  return ZERO_DECIMAL_CURRENCIES.has(normalizedCurrency) ? amount : amount / 100;
}

function formatCurrency(amount: number, currency?: string | null) {
  const normalizedCurrency = (currency ?? "USD").toUpperCase();
  const isZeroDecimal = ZERO_DECIMAL_CURRENCIES.has(normalizedCurrency);

  return new Intl.NumberFormat(normalizedCurrency === "USD" ? "en-US" : "ko-KR", {
    style: "currency",
    currency: normalizedCurrency,
    minimumFractionDigits: isZeroDecimal ? 0 : 2,
    maximumFractionDigits: isZeroDecimal ? 0 : 2,
  }).format(amount);
}

function buildLoginHref(next: string) {
  return `/auth/login?next=${encodeURIComponent(next)}`;
}

function formatUsageMode(mode?: string | null) {
  if (mode === "generate") return "이미지 생성";
  if (mode === "enhance") return "이미지 보정";
  return "크레딧 사용";
}

function summarizePrompt(prompt?: string | null) {
  if (!prompt) return null;
  return prompt.length > 72 ? `${prompt.slice(0, 72)}…` : prompt;
}

function BillingPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-40 rounded-3xl border border-gray-200 bg-gray-100 animate-pulse" />
      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-[22rem] rounded-3xl border border-gray-200 bg-gray-100 animate-pulse"
          />
        ))}
      </div>
      <div className="h-60 rounded-3xl border border-gray-200 bg-gray-100 animate-pulse" />
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
}

export default function BillingPageClient() {
  const [supabase] = useState(() => createClient());
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [packages, setPackages] = useState<BillingPackage[]>([]);
  const [history, setHistory] = useState<BillingHistoryItem[]>([]);
  const [usageHistory, setUsageHistory] = useState<UsageHistoryItem[]>([]);
  const [creditBalance, setCreditBalance] = useState<number | null>(null);
  const [creditCost, setCreditCost] = useState(10);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingCredits, setIsRefreshingCredits] = useState(false);
  const [checkoutingPackageId, setCheckoutingPackageId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const autoCheckoutPackageRef = useRef<string | null>(null);
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
  const checkoutPackageId = searchParams.get("checkoutPackage");

  const getAccessToken = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const accessToken = data.session?.access_token ?? null;
    setIsAuthenticated(Boolean(accessToken));
    return accessToken;
  }, [supabase]);

  const apiFetchWithToken = useCallback(
    async (path: string, accessToken: string, init: RequestInit = {}) => {
      const headers = new Headers(init.headers ?? undefined);
      if (init.body && !headers.has("Content-Type") && typeof init.body === "string") {
        headers.set("Content-Type", "application/json");
      }
      headers.set("Authorization", `Bearer ${accessToken}`);

      return fetch(`${apiUrl}${path}`, {
        ...init,
        headers,
      });
    },
    [apiUrl]
  );

  const refreshCredits = useCallback(async (accessToken?: string | null) => {
    setIsRefreshingCredits(true);

    try {
      const token = accessToken ?? (await getAccessToken());
      if (!token) {
        setCreditBalance(null);
        clearStoredCreditBalance();
        return false;
      }

      const response = await apiFetchWithToken("/api/credits/me", token);
      if (!response.ok) {
        throw new Error("크레딧 정보를 불러오지 못했습니다.");
      }

      const payload: CreditSummary = await response.json();
      setCreditBalance(payload.balance);
      setCreditCost(payload.cost_per_image);
      broadcastCreditBalance(payload.balance);
      return true;
    } finally {
      setIsRefreshingCredits(false);
    }
  }, [apiFetchWithToken, getAccessToken]);

  const refreshPackages = useCallback(async () => {
    const response = await fetch(`${apiUrl}/api/billing/packages`, {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error("결제 패키지 정보를 불러오지 못했습니다.");
    }

    const payload: BillingPackagesResponse = await response.json();
    setPackages(payload.packages);
  }, [apiUrl]);

  const refreshHistory = useCallback(async (accessToken?: string | null) => {
    const token = accessToken ?? (await getAccessToken());
    if (!token) {
      setHistory([]);
      return false;
    }

    const response = await apiFetchWithToken("/api/billing/history", token);
    if (!response.ok) {
      throw new Error("결제 내역을 불러오지 못했습니다.");
    }

    const payload: BillingHistoryItem[] = await response.json();
    setHistory(payload);
    return true;
  }, [apiFetchWithToken, getAccessToken]);

  const refreshUsageHistory = useCallback(async (accessToken?: string | null) => {
    const token = accessToken ?? (await getAccessToken());
    if (!token) {
      setUsageHistory([]);
      return false;
    }

    const response = await apiFetchWithToken("/api/billing/usage-history", token);
    if (!response.ok) {
      throw new Error("사용 내역을 불러오지 못했습니다.");
    }

    const payload: UsageHistoryItem[] = await response.json();
    setUsageHistory(payload);
    return true;
  }, [apiFetchWithToken, getAccessToken]);

  const loadBillingPage = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const accessToken = await getAccessToken();
      await refreshPackages();

      if (accessToken) {
        await Promise.all([
          refreshCredits(accessToken),
          refreshHistory(accessToken),
          refreshUsageHistory(accessToken),
        ]);
      } else {
        setCreditBalance(null);
        setHistory([]);
        setUsageHistory([]);
        clearStoredCreditBalance();
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "결제 정보를 불러오지 못했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  }, [getAccessToken, refreshCredits, refreshHistory, refreshPackages, refreshUsageHistory]);

  useEffect(() => {
    setCreditBalance(readStoredCreditBalance());
  }, []);

  useEffect(() => {
    void loadBillingPage();
  }, [loadBillingPage]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") !== "success") return;

    setStatusMessage("결제 완료를 확인하고 있습니다. 크레딧 반영까지 몇 초 정도 걸릴 수 있습니다.");

    let attempts = 0;
    const intervalId = window.setInterval(() => {
      attempts += 1;
      void Promise.all([refreshCredits(), refreshHistory(), refreshUsageHistory()]).catch((pollError) => {
        setError(
          pollError instanceof Error
            ? pollError.message
            : "결제 반영 상태를 확인하지 못했습니다."
        );
      });
      if (attempts >= 5) {
        window.clearInterval(intervalId);
      }
    }, 3000);

    void Promise.all([refreshCredits(), refreshHistory(), refreshUsageHistory()]).catch((pollError) => {
      setError(
        pollError instanceof Error
          ? pollError.message
          : "결제 반영 상태를 확인하지 못했습니다."
      );
    });

    return () => {
      window.clearInterval(intervalId);
    };
  }, [refreshCredits, refreshHistory, refreshUsageHistory]);

  const handleCheckout = useCallback(
    async (packageId: string) => {
      setCheckoutingPackageId(packageId);
      setError(null);

      try {
        const accessToken = await getAccessToken();
        const nextPath = `${pathname.startsWith("/billing") ? "/billing" : "/pricing"}?checkoutPackage=${encodeURIComponent(packageId)}`;

        if (!accessToken) {
          window.location.assign(buildLoginHref(nextPath));
          return;
        }

        const response = await apiFetchWithToken("/api/billing/checkout", accessToken, {
          method: "POST",
          body: JSON.stringify({ package_id: packageId }),
        });

        if (!response.ok) {
          let detail = "체크아웃을 시작하지 못했습니다.";
          try {
            const payload = await response.json();
            if (payload?.detail) {
              detail = payload.detail;
            }
          } catch {
            // ignore JSON parse failure
          }
          throw new Error(detail);
        }

        const payload: { checkout_url: string } = await response.json();
        window.location.assign(payload.checkout_url);
      } catch (checkoutError) {
        setError(
          checkoutError instanceof Error
            ? checkoutError.message
            : "체크아웃을 시작하지 못했습니다."
        );
      } finally {
        setCheckoutingPackageId(null);
      }
    },
    [apiFetchWithToken, getAccessToken, pathname]
  );

  useEffect(() => {
    if (!checkoutPackageId || isLoading || isAuthenticated !== true) {
      return;
    }

    if (!packages.some((pkg) => pkg.id === checkoutPackageId)) {
      return;
    }

    if (autoCheckoutPackageRef.current === checkoutPackageId) {
      return;
    }

    autoCheckoutPackageRef.current = checkoutPackageId;
    void handleCheckout(checkoutPackageId);
  }, [checkoutPackageId, handleCheckout, isAuthenticated, isLoading, packages]);

  const imageCapacity = useMemo(() => {
    if (typeof creditBalance !== "number" || creditCost <= 0) {
      return null;
    }
    return Math.floor(creditBalance / creditCost);
  }, [creditBalance, creditCost]);
  const loginHref = buildLoginHref(pathname.startsWith("/billing") ? "/billing" : "/pricing");

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-gray-500">
            안전 결제
          </span>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
              요금제
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-500 sm:text-base">
              필요한 만큼 크레딧을 충전하고 바로 이미지 생성과 보정에 사용할 수 있습니다.
              로그인한 상태라면 패키지 선택 후 바로 결제로 이어집니다.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void loadBillingPage()}
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
          >
            새로고침
          </button>
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
            >
              대시보드로 돌아가기
            </Link>
          ) : (
            <Link
              href={loginHref}
              className="inline-flex items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-2.5 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-500/20"
            >
              로그인하고 결제하기
            </Link>
          )}
        </div>
      </div>

      {isLoading ? (
        <BillingPageSkeleton />
      ) : (
        <div className="space-y-6">
          <section className="relative overflow-hidden rounded-[32px] border border-gray-200 bg-white/80 p-6 sm:p-8">
            <div
              className="pointer-events-none absolute inset-0 opacity-70"
              style={{
                background:
                  "radial-gradient(circle at 18% 22%, rgba(99,102,241,0.22), transparent 32%), radial-gradient(circle at 82% 78%, rgba(34,211,238,0.12), transparent 28%)",
              }}
            />
            <div className="relative z-10">
              <div className="space-y-5">
                {isAuthenticated ? (
                  <>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
                        Current Balance
                      </p>
                      <div className="mt-3 flex items-end gap-3">
                        <span className="text-4xl font-semibold text-gray-900 sm:text-5xl">
                          {typeof creditBalance === "number" ? creditBalance : "—"}
                        </span>
                        <span className="pb-2 text-sm text-gray-500">credits</span>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">
                          Cost Per Image
                        </p>
                        <p className="mt-2 text-xl font-semibold text-indigo-600">
                          {creditCost} credits
                        </p>
                      </div>
                      <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">
                          Est. Remaining Jobs
                        </p>
                        <p className="mt-2 text-xl font-semibold text-gray-900">
                          {imageCapacity === null ? "—" : `${imageCapacity} images`}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-[28px] border border-gray-200 bg-gray-50 p-5">
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
                        Pricing Flow
                      </p>
                      <h2 className="mt-3 text-2xl font-semibold text-gray-900">
                        패키지를 고르면 로그인 후 바로 결제로 이어집니다.
                      </h2>
                      <p className="mt-3 text-sm leading-relaxed text-gray-500">
                        비로그인 상태에서도 요금제는 볼 수 있고, 원하는 패키지를 누르면 로그인 후
                        동일한 패키지로 곧바로 체크아웃을 시작합니다.
                      </p>
                    </div>

                    <div className="rounded-[28px] border border-indigo-500/20 bg-indigo-500/10 p-5">
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-indigo-600">
                        Sign In Required
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-indigo-700">
                        결제 완료 후에는 자동으로 크레딧이 반영되고, 로그인하면 충전 내역도 함께 확인할 수 있습니다.
                      </p>
                      <Link
                        href={loginHref}
                        className="mt-5 inline-flex items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-gray-950 transition-colors hover:bg-gray-100"
                      >
                        로그인하고 결제 시작
                      </Link>
                    </div>
                  </div>
                )}

                {statusMessage && (
                  <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-3 text-sm text-indigo-700">
                    {statusMessage}
                  </div>
                )}

                {error && (
                  <div className="rounded-2xl border border-red-900/60 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  {isAuthenticated
                    ? isRefreshingCredits
                      ? "크레딧을 새로고침 중입니다."
                      : "결제 반영이 늦으면 몇 초 후 새로고침하세요."
                    : "패키지 버튼을 누르면 로그인 후 바로 해당 결제로 이어집니다."}
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            {packages.map((pkg) => {
              const pricePerCredit = pkg.price / pkg.total_credits;
              const isBusy = checkoutingPackageId === pkg.id;

              return (
                <article
                  key={pkg.id}
                  className={`relative overflow-hidden rounded-[28px] border p-6 transition-colors ${
                    pkg.highlight
                      ? "border-indigo-500/40 bg-indigo-500/10 shadow-lg shadow-indigo-950/20"
                      : "border-gray-200 bg-white/80"
                  }`}
                >
                  {pkg.highlight && (
                    <div className="absolute right-4 top-4 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-indigo-600">
                      Recommended
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">
                        {pkg.badge}
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold text-gray-900">{pkg.name}</h2>
                    </div>

                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-semibold text-gray-900">{pkg.total_credits}</span>
                      <span className="pb-1 text-sm text-gray-500">credits</span>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-gray-400">
                        기본 {pkg.credits}
                      </span>
                      {pkg.bonus > 0 && (
                        <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-green-700">
                          보너스 +{pkg.bonus}
                        </span>
                      )}
                    </div>

                    <p className="text-sm leading-relaxed text-gray-500">{pkg.description}</p>

                    <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4">
                      <p className="text-2xl font-semibold text-gray-900">
                        {formatCurrency(pkg.price, pkg.currency)}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        크레딧당 약 {formatCurrency(pricePerCredit, pkg.currency)}
                      </p>
                    </div>

                    {pkg.available ? (
                      <button
                        type="button"
                        onClick={() => void handleCheckout(pkg.id)}
                        disabled={isBusy}
                        className={`inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                          pkg.highlight
                            ? "bg-indigo-500 text-gray-900 hover:bg-indigo-400 disabled:opacity-50"
                            : "bg-white text-gray-950 hover:bg-gray-100 disabled:opacity-50"
                        }`}
                      >
                        {isBusy
                          ? "체크아웃 준비 중..."
                          : isAuthenticated
                            ? "결제하기"
                            : "로그인 후 결제하기"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="inline-flex w-full items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-500"
                      >
                        상품 ID 연결 필요
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </section>

          <section className="rounded-[32px] border border-gray-200 bg-white/80 p-6 sm:p-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
                  Purchase History
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-gray-900">최근 충전 내역</h2>
              </div>
              <p className="text-sm text-gray-500">
                웹훅이 정상 반영되면 이 영역에 최신 결제 내역이 추가됩니다.
              </p>
            </div>

            {!isAuthenticated ? (
              <div className="mt-6 rounded-3xl border border-dashed border-gray-200 px-6 py-12 text-center">
                <p className="text-sm text-gray-500">로그인하면 최근 충전 내역과 현재 잔액을 함께 확인할 수 있습니다.</p>
                <Link
                  href={loginHref}
                  className="mt-4 inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-indigo-500"
                >
                  로그인하기
                </Link>
              </div>
            ) : history.length === 0 ? (
              <div className="mt-6 rounded-3xl border border-dashed border-gray-200 px-6 py-12 text-center text-sm text-gray-500">
                아직 충전 내역이 없습니다.
              </div>
            ) : (
              <div className="mt-6 overflow-hidden rounded-3xl border border-gray-200">
                <div className="grid grid-cols-[1.4fr_0.9fr_0.8fr_1fr] gap-4 border-b border-gray-200 bg-gray-50 px-5 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-gray-500">
                  <span>Package</span>
                  <span>Credits</span>
                  <span>Amount</span>
                  <span>Created</span>
                </div>
                <div className="divide-y divide-gray-200">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-1 gap-3 px-5 py-4 text-sm text-gray-400 sm:grid-cols-[1.4fr_0.9fr_0.8fr_1fr]"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.package_name ?? item.package_id ?? "Credit top-up"}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Order {item.order_id ?? item.source_id}
                        </p>
                      </div>
                      <div className="font-medium text-indigo-600">+{item.credits_added} credits</div>
                      <div>
                        {typeof item.amount === "number"
                          ? formatCurrency(
                              normalizeCurrencyAmount(item.amount, item.currency),
                              item.currency
                            )
                          : "—"}
                      </div>
                      <div className="text-gray-500">{formatDate(item.created_at)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="rounded-[32px] border border-gray-200 bg-white/80 p-6 sm:p-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
                  Usage History
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-gray-900">최근 사용 내역</h2>
              </div>
              <p className="text-sm text-gray-500">
                이미지 생성과 보정으로 차감된 크레딧이 이력으로 남습니다.
              </p>
            </div>

            {!isAuthenticated ? (
              <div className="mt-6 rounded-3xl border border-dashed border-gray-200 px-6 py-12 text-center">
                <p className="text-sm text-gray-500">로그인하면 최근 사용 내역을 함께 확인할 수 있습니다.</p>
                <Link
                  href={loginHref}
                  className="mt-4 inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-indigo-500"
                >
                  로그인하기
                </Link>
              </div>
            ) : usageHistory.length === 0 ? (
              <div className="mt-6 rounded-3xl border border-dashed border-gray-200 px-6 py-12 text-center text-sm text-gray-500">
                아직 사용 내역이 없습니다.
              </div>
            ) : (
              <div className="mt-6 overflow-hidden rounded-3xl border border-gray-200">
                <div className="grid grid-cols-[1.6fr_0.7fr_0.8fr_1fr] gap-4 border-b border-gray-200 bg-gray-50 px-5 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-gray-500">
                  <span>Action</span>
                  <span>Used</span>
                  <span>Balance</span>
                  <span>Created</span>
                </div>
                <div className="divide-y divide-gray-200">
                  {usageHistory.map((item) => {
                    const prompt = summarizePrompt(item.prompt);
                    return (
                      <div
                        key={item.id}
                        className="grid grid-cols-1 gap-3 px-5 py-4 text-sm text-gray-400 sm:grid-cols-[1.6fr_0.7fr_0.8fr_1fr]"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.description ?? formatUsageMode(item.mode)}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {item.filename ?? item.job_id ?? item.source_id}
                          </p>
                          {prompt && (
                            <p className="mt-2 text-xs leading-5 text-gray-500">
                              {prompt}
                            </p>
                          )}
                        </div>
                        <div className="font-medium text-rose-600">-{item.credits_used} credits</div>
                        <div>{item.balance_after} credits</div>
                        <div className="text-gray-500">{formatDate(item.created_at)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
