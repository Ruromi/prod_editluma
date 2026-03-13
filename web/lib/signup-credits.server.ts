import "server-only";

import { createAdminClient, dbSchema } from "@/lib/supabase/server";

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

  const currentBalance =
    typeof creditRowResult.data?.balance === "number" ? creditRowResult.data.balance : null;
  const nextBalance = (currentBalance ?? 0) + initialCredits;

  if (currentBalance === null) {
    const insertCreditsResult = await admin.from("user_credits").insert({
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

  const ledgerResult = await admin.from("credit_ledger").insert({
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

export async function provisionSignupCredits(userId: string, email: string) {
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

export async function provisionSignupCreditsForUser(
  user: {
    id?: string | null;
    email?: string | null;
  } | null | undefined
) {
  if (!user?.id) {
    return;
  }

  await provisionSignupCredits(user.id, user.email ?? "");
}
