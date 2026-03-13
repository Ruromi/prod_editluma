"use client";

import Link from "next/link";
import { logout } from "@/app/auth/actions";
import { clearStoredCreditBalance, CREDIT_BALANCE_UPDATED_EVENT, broadcastCreditBalance, readStoredCreditBalance } from "@/lib/credits";
import { createClient } from "@/lib/supabase/client";
import { useCallback, useEffect, useRef, useState } from "react";

type UserMenuPopoverProps = {
  avatarUrl?: string | null;
  displayName: string;
  email?: string | null;
  showAdminLink?: boolean;
};

type CreditSummary = {
  balance: number;
  cost_per_image: number;
  initial_credits: number;
};

export default function UserMenuPopover({
  avatarUrl,
  displayName,
  email,
  showAdminLink = false,
}: UserMenuPopoverProps) {
  const [supabase] = useState(() => createClient());
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [creditBalance, setCreditBalance] = useState<number | null>(null);
  const [creditCost, setCreditCost] = useState(10);
  const [initialCredits, setInitialCredits] = useState(100);
  const [isLoadingCredits, setIsLoadingCredits] = useState(false);
  const [creditError, setCreditError] = useState<string | null>(null);
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

  const refreshCredits = useCallback(async () => {
    setIsLoadingCredits(true);
    setCreditError(null);

    try {
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;

      if (!accessToken) {
        throw new Error("세션이 만료되었습니다.");
      }

      const response = await fetch(`${apiUrl}/api/credits/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("크레딧 정보를 불러오지 못했습니다.");
      }

      const payload: CreditSummary = await response.json();
      setCreditBalance(payload.balance);
      setCreditCost(payload.cost_per_image);
      setInitialCredits(payload.initial_credits);
      broadcastCreditBalance(payload.balance);
    } catch (error) {
      setCreditError(error instanceof Error ? error.message : "크레딧 정보를 불러오지 못했습니다.");
    } finally {
      setIsLoadingCredits(false);
    }
  }, [apiUrl, supabase]);

  useEffect(() => {
    setCreditBalance(readStoredCreditBalance());
  }, []);

  useEffect(() => {
    void refreshCredits();
  }, [refreshCredits]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    function handleCreditUpdate(event: Event) {
      const balance = (event as CustomEvent<{ balance: number | null }>).detail?.balance;
      if (typeof balance === "number") {
        setCreditBalance(balance);
      } else if (balance === null) {
        setCreditBalance(null);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener(CREDIT_BALANCE_UPDATED_EVENT, handleCreditUpdate as EventListener);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener(CREDIT_BALANCE_UPDATED_EVENT, handleCreditUpdate as EventListener);
    };
  }, []);

  const initial = displayName[0]?.toUpperCase() ?? "U";

  return (
    <div ref={containerRef} className="relative flex items-center justify-end">
      <button
        type="button"
        onClick={() => {
          const nextOpen = !isOpen;
          setIsOpen(nextOpen);
          if (nextOpen) {
            void refreshCredits();
          }
        }}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="group inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-2 py-1.5 text-left transition-colors hover:border-gray-300 hover:bg-gray-50"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="h-8 w-8 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-gray-900">
            {initial}
          </div>
        )}
        <div className="hidden min-w-0 sm:block">
          <p className="max-w-[96px] truncate text-sm text-gray-500">{displayName}</p>
          <p className="text-[11px] uppercase tracking-[0.14em] text-gray-500">
            {typeof creditBalance === "number" ? `${creditBalance} credits` : "Profile"}
          </p>
        </div>
        <div className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-1 text-[11px] font-semibold text-indigo-600 sm:hidden">
          {typeof creditBalance === "number" ? creditBalance : "—"}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[19rem] rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-2xl shadow-black/40 backdrop-blur">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="h-11 w-11 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-gray-900">
                {initial}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">{displayName}</p>
              <p className="truncate text-xs text-gray-500">{email ?? "로그인된 사용자"}</p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">Credits</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {typeof creditBalance === "number" ? creditBalance : "—"}
              </p>
            </div>
            <p className="mt-3 text-xs text-gray-500">
              신규 계정은 {initialCredits} 크레딧으로 시작합니다.
            </p>
            {isLoadingCredits && (
              <p className="mt-3 text-xs text-gray-500">크레딧 정보를 새로고침 중입니다.</p>
            )}
            {creditError && (
              <p className="mt-3 text-xs text-red-600">{creditError}</p>
            )}
          </div>

          <Link
            href="/mypage"
            onClick={() => setIsOpen(false)}
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-900"
          >
            마이페이지
          </Link>

          <Link
            href="/pricing"
            onClick={() => setIsOpen(false)}
            className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-3 py-2.5 text-sm font-medium text-gray-900 transition-colors hover:bg-indigo-500"
          >
            크레딧 충전하기
          </Link>

          {showAdminLink && (
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-900"
            >
              관리자 페이지
            </Link>
          )}

          <form
            action={logout}
            onSubmit={() => {
              clearStoredCreditBalance();
            }}
            className="mt-3"
          >
            <button
              type="submit"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-400 transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-600"
            >
              로그아웃
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
