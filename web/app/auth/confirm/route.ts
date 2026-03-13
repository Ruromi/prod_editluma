import { type EmailOtpType } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { ACCOUNT_DELETED_ERROR_MESSAGE } from "@/lib/account-status";
import { isSoftDeletedAccount } from "@/lib/account-status.server";
import { provisionSignupCreditsForUser } from "@/lib/signup-credits.server";

function resolveRedirectPath(request: NextRequest) {
  const redirectTo = request.nextUrl.searchParams.get("redirect_to");
  if (typeof redirectTo === "string" && redirectTo.length > 0) {
    try {
      const parsed = new URL(redirectTo);
      if (parsed.origin === request.nextUrl.origin) {
        return `${parsed.pathname}${parsed.search}${parsed.hash}`;
      }
    } catch {
      if (redirectTo.startsWith("/") && !redirectTo.startsWith("//")) {
        return redirectTo;
      }
    }
  }

  const next = request.nextUrl.searchParams.get("next");
  if (typeof next === "string" && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }

  return "/dashboard";
}

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type") as EmailOtpType | null;
  const redirectPath = resolveRedirectPath(request);
  const errorRedirect = request.nextUrl.clone();
  errorRedirect.pathname = "/auth/login";

  if (!tokenHash || !type) {
    errorRedirect.searchParams.set("error", "인증 링크가 올바르지 않습니다.");
    return NextResponse.redirect(errorRedirect);
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error) {
    errorRedirect.searchParams.set("error", error.message);
    return NextResponse.redirect(errorRedirect);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (await isSoftDeletedAccount(user)) {
    await supabase.auth.signOut();
    errorRedirect.searchParams.set("error", ACCOUNT_DELETED_ERROR_MESSAGE);
    return NextResponse.redirect(errorRedirect);
  }

  try {
    await provisionSignupCreditsForUser(user);
  } catch (provisionError) {
    console.error("Failed to provision signup credits after email confirmation", provisionError);
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = redirectPath.startsWith("/") ? redirectPath : "/dashboard";
  redirectUrl.search = "";
  return NextResponse.redirect(redirectUrl);
}
