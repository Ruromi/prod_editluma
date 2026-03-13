import Link from "next/link";
import SignupForm from "./SignupForm";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">EditLuma</h1>
          <p className="text-gray-500 mt-1">회원가입</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-700 text-red-600 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <SignupForm />

        <p className="text-center text-sm text-gray-500">
          이미 계정이 있으신가요?{" "}
          <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-500">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
