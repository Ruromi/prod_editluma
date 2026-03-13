import { createServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import UserMenuPopover from "@/components/UserMenuPopover";

export default async function UserMenu() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="text-sm text-gray-400 hover:text-indigo-400 transition-colors"
      >
        로그인
      </Link>
    );
  }

  const displayName =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "사용자";
  const avatarUrl = user.user_metadata?.avatar_url;

  return (
    <UserMenuPopover
      avatarUrl={avatarUrl}
      displayName={displayName}
      email={user.email}
    />
  );
}
