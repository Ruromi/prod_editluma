"use client";

import { useRef } from "react";
import { signup, loginWithGoogle } from "../actions";

const PASSWORD_POLICY_TITLE = "8자 이상, 대문자/숫자/특수문자를 각각 1개 이상 포함해야 합니다.";
const PASSWORD_CONFIRMATION_MESSAGE = "비밀번호가 일치하지 않습니다.";

export default function SignupForm() {
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const syncPasswordConfirmation = () => {
    const password = passwordRef.current?.value ?? "";
    const confirmPasswordInput = confirmPasswordRef.current;

    if (!confirmPasswordInput) {
      return;
    }

    if (confirmPasswordInput.value && confirmPasswordInput.value !== password) {
      confirmPasswordInput.setCustomValidity(PASSWORD_CONFIRMATION_MESSAGE);
      return;
    }

    confirmPasswordInput.setCustomValidity("");
  };

  return (
    <>
      <form action={signup} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm text-gray-400 mb-1">
            이메일
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm text-gray-400 mb-1">
            비밀번호
          </label>
          <input
            id="password"
            ref={passwordRef}
            name="password"
            type="password"
            required
            minLength={8}
            pattern="^(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$"
            title={PASSWORD_POLICY_TITLE}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="8자 이상, 대문자/숫자/특수문자 포함"
            onInput={syncPasswordConfirmation}
          />
          <p className="mt-2 text-xs leading-5 text-gray-500">
            8자 이상, 대문자 1개 이상, 숫자 1개 이상, 특수문자 1개 이상이 필요합니다.
          </p>
        </div>
        <div>
          <label htmlFor="confirm-password" className="block text-sm text-gray-400 mb-1">
            비밀번호 확인
          </label>
          <input
            id="confirm-password"
            ref={confirmPasswordRef}
            name="confirm_password"
            type="password"
            required
            minLength={8}
            title={PASSWORD_CONFIRMATION_MESSAGE}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="비밀번호를 다시 입력하세요"
            onInput={syncPasswordConfirmation}
            onBlur={syncPasswordConfirmation}
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-gray-900 hover:bg-indigo-500 transition-colors"
        >
          회원가입
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">또는</span>
        </div>
      </div>

      <form action={loginWithGoogle}>
        <button
          type="submit"
          className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 font-medium text-gray-800 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google로 회원가입
        </button>
      </form>
    </>
  );
}
