import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { LANDING_LANGUAGE_COOKIE, normalizeLandingLanguage } from "@/lib/landing-language";
import { updatePassword } from "../actions";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;
  const cookieStore = await cookies();
  const language = normalizeLandingLanguage(cookieStore.get(LANDING_LANGUAGE_COOKIE)?.value);
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">EditLuma</h1>
          <p className="text-gray-500 mt-1">
            {language === "ko" ? "새 비밀번호 설정" : "Set a new password"}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-700 text-red-600 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-green-50 border border-green-700 text-green-600 text-sm rounded-lg px-4 py-3">
            {message}
          </div>
        )}

        {!user ? (
          <div className="space-y-4 rounded-2xl border border-gray-300 bg-gray-50 p-5 text-sm text-gray-600">
            <p>
              {language === "ko"
                ? "비밀번호 재설정 링크가 만료되었거나 유효하지 않습니다."
                : "Your reset link is invalid or has expired."}
            </p>
            <Link href="/auth/forgot-password" className="text-indigo-600 hover:text-indigo-500">
              {language === "ko" ? "재설정 메일 다시 요청하기" : "Request a new reset email"}
            </Link>
          </div>
        ) : (
          <form action={updatePassword} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm text-gray-400 mb-1">
                {language === "ko" ? "새 비밀번호" : "New password"}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder={language === "ko" ? "8자 이상 입력하세요" : "Use at least 8 characters"}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm text-gray-400 mb-1">
                {language === "ko" ? "새 비밀번호 확인" : "Confirm new password"}
              </label>
              <input
                id="confirm-password"
                name="confirm_password"
                type="password"
                required
                minLength={8}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder={
                  language === "ko" ? "비밀번호를 다시 입력하세요" : "Enter your new password again"
                }
              />
            </div>
            <p className="text-xs leading-5 text-gray-500">
              {language === "ko"
                ? "비밀번호는 8자 이상이어야 합니다."
                : "Passwords must be at least 8 characters long."}
            </p>
            <button
              type="submit"
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-gray-900 hover:bg-indigo-500 transition-colors"
            >
              {language === "ko" ? "비밀번호 변경" : "Update password"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500">
          <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-500">
            {language === "ko" ? "로그인으로 돌아가기" : "Back to log in"}
          </Link>
        </p>
      </div>
    </div>
  );
}
