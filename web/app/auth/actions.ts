"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient, createServerClient, dbSchema } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { siteUrl } from "@/lib/site";
import { ACCOUNT_DELETED_ERROR_MESSAGE } from "@/lib/account-status";
import { isSoftDeletedAccount, isSoftDeletedEmail } from "@/lib/account-status.server";
import { provisionSignupCreditsForUser } from "@/lib/signup-credits.server";

const PASSWORD_POLICY_MESSAGE =
  "비밀번호는 8자 이상이며 영문, 숫자, 특수문자를 각각 1개 이상 포함해야 합니다.";
const PASSWORD_CONFIRMATION_MESSAGE = "비밀번호 확인이 일치하지 않습니다.";
const EMAIL_VERIFICATION_REQUIRED_MESSAGE =
  "가입 확인 이메일의 인증 링크를 완료한 뒤 로그인해주세요.";

function resolveNextPath(rawNext: FormDataEntryValue | null, fallback: string) {
  if (typeof rawNext !== "string" || !rawNext.startsWith("/") || rawNext.startsWith("//")) {
    return fallback;
  }

  return rawNext;
}

function isAllowedAppOrigin(candidate: string) {
  try {
    const parsed = new URL(candidate);
    const normalized = parsed.origin;
    const allowedOrigins = new Set<string>([siteUrl]);

    if (process.env.NODE_ENV !== "production") {
      allowedOrigins.add("http://localhost:3001");
      allowedOrigins.add("http://127.0.0.1:3001");
    }

    return allowedOrigins.has(normalized);
  } catch {
    return false;
  }
}

function resolveRequestOrigin(headersList: Awaited<ReturnType<typeof headers>>) {
  const origin = headersList.get("origin");
  if (origin && isAllowedAppOrigin(origin)) {
    return origin;
  }

  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  if (host) {
    const proto =
      headersList.get("x-forwarded-proto") ??
      (host.includes("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
    const candidate = `${proto}://${host}`;
    if (isAllowedAppOrigin(candidate)) {
      return candidate;
    }
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3001";
  }

  return siteUrl;
}

function isValidSignupPassword(password: string) {
  return (
    password.length >= 8 &&
    /[A-Za-z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

export async function login(formData: FormData) {
  const supabase = await createServerClient();
  const next = resolveNextPath(formData.get("next"), "/dashboard");

  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) {
    redirect(`/auth/login?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`);
  }

  if (await isSoftDeletedAccount(data.user)) {
    await supabase.auth.signOut();
    redirect(`/auth/login?error=${encodeURIComponent(ACCOUNT_DELETED_ERROR_MESSAGE)}`);
  }

  try {
    await provisionSignupCreditsForUser(data.user);
  } catch (provisionError) {
    console.error("Failed to provision signup credits after login", provisionError);
  }

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signup(formData: FormData) {
  const supabase = await createServerClient();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (password !== confirmPassword) {
    redirect(`/auth/signup?error=${encodeURIComponent(PASSWORD_CONFIRMATION_MESSAGE)}`);
  }

  if (!isValidSignupPassword(password)) {
    redirect(`/auth/signup?error=${encodeURIComponent(PASSWORD_POLICY_MESSAGE)}`);
  }

  if (await isSoftDeletedEmail(email)) {
    redirect(`/auth/signup?error=${encodeURIComponent(ACCOUNT_DELETED_ERROR_MESSAGE)}`);
  }

  const headersList = await headers();
  const origin = resolveRequestOrigin(headersList);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent("/dashboard")}`,
    },
  });

  if (error) {
    redirect(`/auth/signup?error=${encodeURIComponent(error.message)}`);
  }

  if (!data.user?.id) {
    redirect(`/auth/signup?error=${encodeURIComponent("회원가입 처리에 실패했습니다. 다시 시도해주세요.")}`);
  }

  redirect(`/auth/login?message=${encodeURIComponent(EMAIL_VERIFICATION_REQUIRED_MESSAGE)}`);
}

export async function loginWithGoogle(formData: FormData) {
  const supabase = await createServerClient();
  const headersList = await headers();
  const origin = resolveRequestOrigin(headersList);
  const next = resolveNextPath(formData.get("next"), "/dashboard");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    redirect(`/auth/login?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`);
  }

  redirect(data.url);
}

export async function logout() {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function deleteAccount(formData: FormData) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?error=${encodeURIComponent("로그인이 필요합니다.")}`);
  }

  const reason = String(formData.get("reason") ?? "").trim().slice(0, 500) || "user_requested_deletion";
  const deletedAt = new Date().toISOString();
  const admin = createAdminClient();
  const adminDb = admin.schema(dbSchema());

  const existingProfile = await adminDb
    .from("profiles")
    .select("user_id, email, user_credits")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  const profilePayload = {
    user_id: user.id,
    email: user.email ?? existingProfile.data?.email ?? null,
    user_credits: typeof existingProfile.data?.user_credits === "number" ? existingProfile.data.user_credits : 0,
    account_status: "deleted",
    deleted_at: deletedAt,
    deleted_reason: reason,
  };

  if (existingProfile.error) {
    throw existingProfile.error;
  }

  if (existingProfile.data) {
    const updateResult = await adminDb
      .from("profiles")
      .update({
        account_status: "deleted",
        deleted_at: deletedAt,
        deleted_reason: reason,
      })
      .eq("user_id", user.id);

    if (updateResult.error) {
      throw updateResult.error;
    }
  } else {
    const insertResult = await adminDb.from("profiles").insert(profilePayload);
    if (insertResult.error) {
      throw insertResult.error;
    }
  }

  const authUpdateResult = await admin.auth.admin.updateUserById(user.id, {
    app_metadata: {
      ...(user.app_metadata ?? {}),
      account_status: "deleted",
      deleted_at: deletedAt,
    },
    user_metadata: {
      ...(user.user_metadata ?? {}),
      account_status: "deleted",
      deleted_at: deletedAt,
    },
  });

  if (authUpdateResult.error) {
    throw authUpdateResult.error;
  }

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect(`/?message=${encodeURIComponent("회원 탈퇴가 완료되었습니다.")}`);
}
