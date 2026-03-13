import { createServerClient } from "@/lib/supabase/server";
import { hasAdminAccess } from "@/lib/admin";
import Link from "next/link";
import UserMenuPopover from "@/components/UserMenuPopover";
import { headers } from "next/headers";
import type { HeaderLanguage } from "@/lib/landing-language";

type UserMenuProps = {
  initialLanguage?: HeaderLanguage;
};

export default async function UserMenu({
  initialLanguage = "en",
}: UserMenuProps) {
  const supabase = await createServerClient();
  const headerList = await headers();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="text-sm text-gray-400 hover:text-indigo-400 transition-colors"
      >
        {initialLanguage === "ko" ? "로그인" : "Log in"}
      </Link>
    );
  }

  const displayName =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "사용자";
  const avatarUrl = user.user_metadata?.avatar_url;
  const showAdminLink = hasAdminAccess(headerList, user.email);

  return (
    <UserMenuPopover
      avatarUrl={avatarUrl}
      displayName={displayName}
      email={user.email}
      showAdminLink={showAdminLink}
    />
  );
}
