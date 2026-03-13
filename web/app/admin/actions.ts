"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createAdminClient, createServerClient, dbSchema } from "@/lib/supabase/server";
import { hasAdminAccess } from "@/lib/admin";

const REFUND_REASONS = new Set([
  "duplicate",
  "fraudulent",
  "customer_request",
  "service_disruption",
  "satisfaction_guarantee",
  "dispute_prevention",
  "other",
]);

const REFUND_LOCKED_STATUSES = new Set(["pending", "completed", "manual_review"]);

type AdminDb = ReturnType<ReturnType<typeof createAdminClient>["schema"]>;

function isMissingTableError(error: unknown) {
  const code = String((error as { code?: string } | null)?.code ?? "");
  const message = String((error as { message?: string } | null)?.message ?? error ?? "");
  return code === "PGRST205" || code === "42P01" || message.includes("refund_requests");
}

function adminRedirect(params: { message?: string; error?: string }): never {
  const search = new URLSearchParams();
  if (params.message) search.set("message", params.message);
  if (params.error) search.set("error", params.error);
  const suffix = search.size ? `?${search.toString()}` : "";
  redirect(`/admin${suffix}`);
}

async function requireAdminAccess() {
  const headerList = await headers();
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/admin");
  }

  if (!hasAdminAccess(headerList, user.email)) {
    redirect("/dashboard");
  }

  return { user, adminDb: createAdminClient().schema(dbSchema()) };
}

function extractBalance(row: Record<string, unknown> | null | undefined) {
  if (!row) return null;
  const balance = row.balance;
  if (typeof balance === "number") return balance;
  const credits = row.credits;
  if (typeof credits === "number") return credits;
  return null;
}

function creditColumnName(row: Record<string, unknown> | null | undefined) {
  if (row && "balance" in row) return "balance";
  if (row && "credits" in row) return "credits";
  return "balance";
}

async function syncProfileSnapshot(
  adminDb: AdminDb,
  {
    userId,
    email,
    balance,
  }: {
    userId: string;
    email?: string | null;
    balance: number;
  }
) {
  const existing = await adminDb
    .from("profiles")
    .select("user_id, email")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (existing.error) {
    if (String(existing.error.code ?? "") === "PGRST205" || String(existing.error.message ?? "").includes("profiles")) {
      return;
    }
    throw existing.error;
  }

  const nextEmail = email ?? (existing.data?.email as string | null | undefined) ?? null;

  if (existing.data) {
    const updated = await adminDb
      .from("profiles")
      .update({ email: nextEmail, user_credits: balance })
      .eq("user_id", userId);

    if (updated.error) {
      throw updated.error;
    }
    return;
  }

  const inserted = await adminDb
    .from("profiles")
    .insert({ user_id: userId, email: nextEmail, user_credits: balance });

  if (inserted.error) {
    throw inserted.error;
  }
}

async function ensureCreditRow(adminDb: AdminDb, userId: string) {
  const existing = await adminDb
    .from("user_credits")
    .select("*")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (existing.error) {
    throw existing.error;
  }

  if (existing.data) {
    return existing.data as Record<string, unknown>;
  }

  const inserted = await adminDb
    .from("user_credits")
    .insert({ user_id: userId, balance: 0 })
    .select("*")
    .single();

  if (inserted.error) {
    throw inserted.error;
  }

  return inserted.data as Record<string, unknown>;
}

async function directRecordLedgerEntry(
  adminDb: AdminDb,
  {
    userId,
    source,
    sourceId,
    delta,
    description,
    metadata,
  }: {
    userId: string;
    source: "manual_adjustment" | "refund";
    sourceId: string;
    delta: number;
    description: string;
    metadata: Record<string, unknown>;
  }
) {
  const row = await ensureCreditRow(adminDb, userId);
  const column = creditColumnName(row);
  const currentBalance = extractBalance(row);
  if (currentBalance === null) {
    throw new Error("크레딧 잔액 컬럼을 찾지 못했습니다.");
  }

  const nextBalance = currentBalance + delta;
  if (nextBalance < 0) {
    throw new Error("현재 잔액보다 많은 크레딧을 차감할 수 없습니다.");
  }

  const updated = await adminDb
    .from("user_credits")
    .update({ [column]: nextBalance })
    .eq("user_id", userId)
    .eq(column, currentBalance);

  if (updated.error) {
    throw updated.error;
  }

  const inserted = await adminDb.from("credit_ledger").insert({
    user_id: userId,
    source,
    source_id: sourceId,
    delta,
    balance_after: nextBalance,
    description,
    metadata,
  });

  if (inserted.error) {
    throw inserted.error;
  }

  return nextBalance;
}

async function recordLedgerEntry(
  adminDb: AdminDb,
  {
    userId,
    source,
    sourceId,
    delta,
    description,
    metadata,
  }: {
    userId: string;
    source: "manual_adjustment" | "refund";
    sourceId: string;
    delta: number;
    description: string;
    metadata: Record<string, unknown>;
  }
) {
  const rpcResult = await adminDb.rpc("record_credit_ledger_entry", {
    p_user_id: userId,
    p_source: source,
    p_source_id: sourceId,
    p_delta: delta,
    p_description: description,
    p_metadata: metadata,
    p_initial_credits: 0,
  });

  if (!rpcResult.error) {
    return Number((rpcResult.data as { balance?: number } | null)?.balance ?? 0);
  }

  return directRecordLedgerEntry(adminDb, {
    userId,
    source,
    sourceId,
    delta,
    description,
    metadata,
  });
}

async function findUserByEmail(email: string) {
  const admin = createAdminClient();
  let page = 1;

  for (;;) {
    const result = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (result.error) {
      throw result.error;
    }

    const match = result.data.users.find(
      (user) => user.email?.trim().toLowerCase() === email.trim().toLowerCase()
    );
    if (match) {
      return match;
    }

    if (!result.data.nextPage) {
      break;
    }
    page = result.data.nextPage;
  }

  return null;
}

async function createPolarRefund(payload: {
  orderId: string;
  reason: string;
  amount: number;
  comment?: string;
  metadata?: Record<string, unknown>;
}) {
  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("POLAR_ACCESS_TOKEN이 설정되지 않았습니다.");
  }

  const apiBase =
    process.env.POLAR_SERVER === "sandbox"
      ? "https://sandbox-api.polar.sh/v1"
      : "https://api.polar.sh/v1";

  const response = await fetch(`${apiBase}/refunds`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      order_id: payload.orderId,
      reason: payload.reason,
      amount: payload.amount,
      comment: payload.comment || undefined,
      metadata: payload.metadata || {},
      revoke_benefits: false,
    }),
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const detail =
      typeof data?.detail === "string"
        ? data.detail
        : `Polar 환불 요청 실패 (HTTP ${response.status})`;
    throw new Error(detail);
  }

  return data as Record<string, unknown>;
}

export async function adjustCredits(formData: FormData) {
  const { user, adminDb } = await requireAdminAccess();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const delta = Number(formData.get("delta") ?? 0);
  const description = String(formData.get("description") ?? "").trim();

  if (!email) {
    adminRedirect({ error: "대상 이메일을 입력하세요." });
  }

  if (!Number.isInteger(delta) || delta === 0) {
    adminRedirect({ error: "증감 크레딧은 0이 아닌 정수여야 합니다." });
  }

  const targetUser = await findUserByEmail(email);
  if (!targetUser?.id) {
    adminRedirect({ error: "해당 이메일의 사용자를 찾지 못했습니다." });
  }
  const targetUserId = targetUser.id;

  const sourceId = crypto.randomUUID();
  const finalDescription =
    description || (delta > 0 ? "관리자 수동 크레딧 지급" : "관리자 수동 크레딧 차감");

  try {
    const nextBalance = await recordLedgerEntry(adminDb, {
      userId: targetUserId,
      source: "manual_adjustment",
      sourceId,
      delta,
      description: finalDescription,
      metadata: {
        target_email: email,
        admin_email: user.email ?? null,
        action: "manual_adjustment",
      },
    });
    await syncProfileSnapshot(adminDb, {
      userId: targetUserId,
      email,
      balance: nextBalance,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "크레딧 조정 중 오류가 발생했습니다.";
    adminRedirect({ error: message });
  }

  revalidatePath("/admin");
  adminRedirect({ message: `${email} 계정의 크레딧을 ${delta > 0 ? "지급" : "차감"}했습니다.` });
}

export async function refundPayment(formData: FormData) {
  const { user, adminDb } = await requireAdminAccess();
  const ledgerId = String(formData.get("ledger_id") ?? "").trim();
  const reason = String(formData.get("reason") ?? "customer_request").trim();
  const comment = String(formData.get("comment") ?? "").trim();

  if (!ledgerId) {
    adminRedirect({ error: "환불할 결제 정보를 찾지 못했습니다." });
  }

  if (!REFUND_REASONS.has(reason)) {
    adminRedirect({ error: "지원되지 않는 환불 사유입니다." });
  }

  const ledgerResult = await adminDb
    .from("credit_ledger")
    .select("*")
    .eq("id", ledgerId)
    .eq("source", "polar_topup")
    .maybeSingle();

  if (ledgerResult.error) {
    adminRedirect({ error: "결제 내역을 불러오지 못했습니다." });
  }

  const paymentRow = ledgerResult.data as Record<string, unknown> | null;
  if (!paymentRow) {
    adminRedirect({ error: "존재하지 않는 결제 내역입니다." });
  }

  const metadata =
    paymentRow.metadata && typeof paymentRow.metadata === "object"
      ? (paymentRow.metadata as Record<string, unknown>)
      : {};
  const orderId = String(metadata.order_id ?? paymentRow.source_id ?? "").trim();
  const amount = Number(metadata.amount ?? 0);
  const creditsToReverse = Number(paymentRow.delta ?? 0);
  const targetUserId = String(paymentRow.user_id ?? "");
  const packageName = String(metadata.package_name ?? paymentRow.description ?? "Polar 결제");

  if (!orderId || !targetUserId || !Number.isFinite(amount) || amount <= 0 || creditsToReverse <= 0) {
    adminRedirect({ error: "환불에 필요한 결제 메타데이터가 부족합니다." });
  }

  const existingRefundRequest = await adminDb
    .from("refund_requests")
    .select("id, status, comment, metadata")
    .eq("order_id", orderId)
    .limit(1)
    .maybeSingle();

  if (existingRefundRequest.error && !isMissingTableError(existingRefundRequest.error)) {
    adminRedirect({ error: "기존 환불 여부를 확인하지 못했습니다." });
  }

  const existingRequestRow =
    !existingRefundRequest.error && existingRefundRequest.data
      ? (existingRefundRequest.data as Record<string, unknown>)
      : null;
  const existingRequestStatus = String(existingRequestRow?.status ?? "");

  if (existingRequestRow && REFUND_LOCKED_STATUSES.has(existingRequestStatus)) {
    const message =
      existingRequestStatus === "completed"
        ? "이미 환불 처리된 결제입니다."
        : existingRequestStatus === "manual_review"
          ? "이미 수동 검토 중인 환불 건입니다."
          : "이미 환불 처리 중인 결제입니다.";
    adminRedirect({ error: message });
  }

  if (existingRefundRequest.error && isMissingTableError(existingRefundRequest.error)) {
    const existingRefund = await adminDb
      .from("credit_ledger")
      .select("id")
      .eq("source", "refund")
      .contains("metadata", { order_id: orderId })
      .limit(1)
      .maybeSingle();

    if (existingRefund.error) {
      adminRedirect({ error: "기존 환불 여부를 확인하지 못했습니다." });
    }

    if (existingRefund.data) {
      adminRedirect({ error: "이미 환불 처리된 결제입니다." });
    }
  }

  const creditRow = await ensureCreditRow(adminDb, targetUserId);
  const currentBalance = extractBalance(creditRow);
  if (currentBalance === null || currentBalance < creditsToReverse) {
    adminRedirect({ error: "사용자 현재 잔액이 부족해서 전액 환불을 진행할 수 없습니다." });
  }

  let refundData: Record<string, unknown>;
  try {
    refundData = await createPolarRefund({
      orderId,
      reason,
      amount,
      comment,
      metadata: {
        admin_email: user.email ?? null,
        original_ledger_id: ledgerId,
        original_order_id: orderId,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Polar 환불 요청에 실패했습니다.";
    adminRedirect({ error: message });
  }

  const refundId = String(refundData.id ?? "");
  const refundStatus = String(refundData.status ?? "pending");
  if (!refundId) {
    adminRedirect({ error: "Polar 환불 응답에 refund id가 없습니다." });
  }

  const nextRefundRequestStatus = refundStatus === "succeeded" ? "completed" : "pending";
  const existingMetadata =
    existingRequestRow?.metadata && typeof existingRequestRow.metadata === "object"
      ? (existingRequestRow.metadata as Record<string, unknown>)
      : {};
  const existingComment =
    typeof existingRequestRow?.comment === "string" ? existingRequestRow.comment : null;
  const refundRequestPayload = {
    user_id: targetUserId,
    payment_ledger_id: ledgerId,
    order_id: orderId,
    refund_id: refundId,
    status: nextRefundRequestStatus,
    reason,
    amount,
    credits_reversed: creditsToReverse,
    admin_email: user.email ?? null,
    comment: comment || existingComment || null,
    metadata: {
      ...existingMetadata,
      package_name: packageName,
      polar_refund_status: refundStatus,
      ...(existingComment ? { customer_comment: existingComment } : {}),
      ...(comment ? { admin_comment: comment } : {}),
    },
  };
  const refundRequestResult = existingRequestRow
    ? await adminDb
        .from("refund_requests")
        .update(refundRequestPayload)
        .eq("id", String(existingRequestRow.id))
    : await adminDb.from("refund_requests").insert(refundRequestPayload);

  if (refundRequestResult.error && !isMissingTableError(refundRequestResult.error)) {
    adminRedirect({ error: "환불 처리 테이블 기록 중 오류가 발생했습니다." });
  }

  try {
    const nextBalance = await recordLedgerEntry(adminDb, {
      userId: targetUserId,
      source: "refund",
      sourceId: refundId,
      delta: -creditsToReverse,
      description: `Polar 환불: ${packageName}`,
      metadata: {
        order_id: orderId,
        refund_id: refundId,
        amount,
        reason,
        comment: comment || null,
        original_ledger_id: ledgerId,
        original_credits: creditsToReverse,
        admin_email: user.email ?? null,
        refund_status: refundStatus,
        package_name: packageName,
      },
    });
    await syncProfileSnapshot(adminDb, {
      userId: targetUserId,
      email: typeof metadata.polar_customer_email === "string" ? metadata.polar_customer_email : null,
      balance: nextBalance,
    });
  } catch (error) {
    if (!refundRequestResult.error) {
      await adminDb
        .from("refund_requests")
        .update({
          status: "manual_review",
          metadata: {
            package_name: packageName,
            polar_refund_status: refundStatus,
            review_reason: "credit_reversal_failed",
          },
        })
        .eq("refund_id", refundId);
    }
    const message =
      error instanceof Error
        ? error.message
        : "환불 후 크레딧 회수 중 오류가 발생했습니다. 수동 확인이 필요합니다.";
    adminRedirect({ error: message });
  }

  revalidatePath("/admin");
  adminRedirect({ message: `주문 ${orderId} 환불을 요청했습니다.` });
}
