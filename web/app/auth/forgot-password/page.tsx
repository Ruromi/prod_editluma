import Link from "next/link";
import { cookies } from "next/headers";
import { LANDING_LANGUAGE_COOKIE, normalizeLandingLanguage } from "@/lib/landing-language";
import { requestPasswordReset } from "../actions";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;
  const cookieStore = await cookies();
  const language = normalizeLandingLanguage(cookieStore.get(LANDING_LANGUAGE_COOKIE)?.value);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">EditLuma</h1>
          <p className="text-gray-500 mt-1">
            {language === "ko" ? "비밀번호 재설정" : "Reset password"}
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

        <form action={requestPasswordReset} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-gray-400 mb-1">
              {language === "ko" ? "이메일" : "Email"}
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
          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-gray-900 hover:bg-indigo-500 transition-colors"
          >
            {language === "ko" ? "재설정 메일 보내기" : "Send reset email"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-500">
            {language === "ko" ? "로그인으로 돌아가기" : "Back to log in"}
          </Link>
        </p>
      </div>
    </div>
  );
}
