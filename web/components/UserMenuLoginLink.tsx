"use client";

import Link from "next/link";
import type { HeaderLanguage } from "@/lib/landing-language";
import { useAppLanguage } from "@/lib/use-app-language";

type UserMenuLoginLinkProps = {
  initialLanguage?: HeaderLanguage;
};

export default function UserMenuLoginLink({
  initialLanguage = "en",
}: UserMenuLoginLinkProps) {
  const language = useAppLanguage(initialLanguage);

  return (
    <Link
      href="/auth/login"
      className="text-sm text-gray-400 transition-colors hover:text-indigo-400"
    >
      {language === "ko" ? "로그인" : "Log in"}
    </Link>
  );
}
