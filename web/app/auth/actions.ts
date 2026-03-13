"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient, createServerClient, dbSchema } from "@/lib/supabase/server";
import { headers } from "next/headers";

const PASSWORD_POLICY_MESSAGE =
  "비밀번호는 8자 이상이며 대문자, 숫자, 특수문자를 각각 1개 이상 포함해야 합니다.";
const PASSWORD_CONFIRMATION_MESSAGE = "비밀번호 확인이 일치하지 않습니다.";
const SIGNUP_CREDIT_ERROR_MESSAGE = "회원가입은 완료되었지만 기본 크레딧 지급 중 문제가 발생했습니다. 다시 로그인해 주세요.";

function resolveNextPath(rawNext: FormDataEntryValue | null, fallback: string) {
  if (typeof rawNext !== "string" || !rawNext.startsWith("/") || rawNext.startsWith("//")) {
    return fallback;
  }

  return rawNext;
}

function resolveRequestOrigin(headersList: Awaited<ReturnType<typeof headers>>) {
  const origin = headersList.get("origin");
  if (origin) {
    return origin;
  }

  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  if (host) {
    const proto =
      headersList.get("x-forwarded-proto") ??
      (host.includes("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
    return `${proto}://${host}`;
  }

  return "http://localhost:3001";
}

function isValidSignupPassword(password: string) {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

function resolveInitialUserCredits() {
  const rawValue = Number(process.env.INITIAL_USER_CREDITS ?? "100");
  if (!Number.isFinite(rawValue) || rawValue < 0) {
    return 100;
  }

  return Math.floor(rawValue);
}

async function directProvisionSignupCredits(userId: string, email: string) {
  const initialCredits = resolveInitialUserCredits();
  if (initialCredits <= 0) {
    return;
  }

  const admin = createAdminClient().schema(dbSchema());
  const existingLedgerResult = await admin
    .from("credit_ledger")
    .select("id")
    .eq("source", "signup_bonus")
    .eq("source_id", userId)
    .limit(1)
    .maybeSingle();

  if (existingLedgerResult.error) {
    throw existingLedgerResult.error;
  }

  if (existingLedgerResult.data) {
    return;
  }

  const creditRowResult = await admin
    .from("user_credits")
    .select("balance")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (creditRowResult.error) {
    throw creditRowResult.error;
  }

  const currentBalance = typeof creditRowResult.data?.balance === "number"
    ? creditRowResult.data.balance
    : null;
  const nextBalance = (currentBalance ?? 0) + initialCredits;

  if (currentBalance === null) {
    const insertCreditsResult = await admin
      .from("user_credits")
      .insert({
        user_id: userId,
        balance: nextBalance,
      });

    if (insertCreditsResult.error) {
      throw insertCreditsResult.error;
    }
  } else {
    const updateCreditsResult = await admin
      .from("user_credits")
      .update({ balance: nextBalance })
      .eq("user_id", userId)
      .eq("balance", currentBalance);

    if (updateCreditsResult.error) {
      throw updateCreditsResult.error;
    }
  }

  const ledgerResult = await admin
    .from("credit_ledger")
    .insert({
      user_id: userId,
      source: "signup_bonus",
      source_id: userId,
      delta: initialCredits,
      balance_after: nextBalance,
      description: "신규 가입 크레딧 지급",
      metadata: {
        reason: "signup_bonus",
        email,
      },
    });

  if (ledgerResult.error) {
    throw ledgerResult.error;
  }
}

async function provisionSignupCredits(userId: string, email: string) {
  const initialCredits = resolveInitialUserCredits();
  if (initialCredits <= 0) {
    return;
  }

  const admin = createAdminClient().schema(dbSchema());
  const rpcResult = await admin.rpc("record_credit_ledger_entry", {
    p_user_id: userId,
    p_source: "signup_bonus",
    p_source_id: userId,
    p_delta: initialCredits,
    p_description: "신규 가입 크레딧 지급",
    p_metadata: {
      reason: "signup_bonus",
      email,
    },
    p_initial_credits: 0,
  });

  if (!rpcResult.error) {
    return;
  }

  await directProvisionSignupCredits(userId, email);
}

export async function login(formData: FormData) {
  const supabase = await createServerClient();
  const next = resolveNextPath(formData.get("next"), "/dashboard");

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) {
    redirect(`/auth/login?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`);
  }

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signup(formData: FormData) {
  const supabase = await createServerClient();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (password !== confirmPassword) {
    redirect(`/auth/signup?error=${encodeURIComponent(PASSWORD_CONFIRMATION_MESSAGE)}`);
  }

  if (!isValidSignupPassword(password)) {
    redirect(`/auth/signup?error=${encodeURIComponent(PASSWORD_POLICY_MESSAGE)}`);
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    redirect(`/auth/signup?error=${encodeURIComponent(error.message)}`);
  }

  try {
    if (data.user?.id) {
      await provisionSignupCredits(data.user.id, email);
    }
  } catch (provisionError) {
    console.error("Failed to provision signup credits", provisionError);
    redirect(`/auth/login?message=${encodeURIComponent(SIGNUP_CREDIT_ERROR_MESSAGE)}`);
  }

  redirect("/auth/login?message=가입 확인 이메일을 확인해주세요.");
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
