"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

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

  const { error } = await supabase.auth.signUp({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) {
    redirect(`/auth/signup?error=${encodeURIComponent(error.message)}`);
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
