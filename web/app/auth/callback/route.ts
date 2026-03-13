import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { ACCOUNT_DELETED_ERROR_MESSAGE } from "@/lib/account-status";
import { isSoftDeletedAccount } from "@/lib/account-status.server";

function resolveNextPath(rawNext: string | null) {
  if (!rawNext || !rawNext.startsWith("/") || rawNext.startsWith("//")) {
    return "/dashboard";
  }

  return rawNext;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = resolveNextPath(searchParams.get("next"));

  if (code) {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (await isSoftDeletedAccount(user)) {
        await supabase.auth.signOut();
        return NextResponse.redirect(
          `${origin}/auth/login?error=${encodeURIComponent(ACCOUNT_DELETED_ERROR_MESSAGE)}`
        );
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/auth/login?error=${encodeURIComponent("인증에 실패했습니다.")}`
  );
}
