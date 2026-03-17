import { createServerClient } from "@/lib/supabase/server";
import { hasAdminAccess } from "@/lib/admin";
import UserMenuPopover from "@/components/UserMenuPopover";
import UserMenuLoginLink from "@/components/UserMenuLoginLink";
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
    return <UserMenuLoginLink initialLanguage={initialLanguage} />;
  }

  const displayName =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    (initialLanguage === "ko" ? "사용자" : "User");
  const avatarUrl = user.user_metadata?.avatar_url;
  const showAdminLink = hasAdminAccess(headerList, user.email);

  return (
    <UserMenuPopover
      avatarUrl={avatarUrl}
      displayName={displayName}
      email={user.email}
      showAdminLink={showAdminLink}
      initialLanguage={initialLanguage}
    />
  );
}
