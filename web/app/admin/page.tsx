import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { adjustCredits, reactivateAccount, refundPayment } from "./actions";
import { hasAdminAccess } from "@/lib/admin";
import { createAdminClient, createServerClient, dbSchema } from "@/lib/supabase/server";

type AdminPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type LedgerRow = {
  id: string;
  user_id: string;
  source: string;
  source_id: string;
  delta: number;
  balance_after: number;
  description: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

type AdminUserSummary = {
  id: string;
  email?: string | null;
  created_at: string;
  last_sign_in_at?: string | null;
};

type DeletedAccountRow = {
  user_id: string;
  email: string;
  user_credits: number;
  deleted_at: string;
  deleted_reason: string | null;
  lastSignInAt?: string | null;
};

const dateTime = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
  timeStyle: "short",
});

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function asMetadata(value: unknown) {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function isMissingTableError(error: unknown) {
  const code = String((error as { code?: string } | null)?.code ?? "");
  const message = String((error as { message?: string } | null)?.message ?? error ?? "");
  return code === "PGRST205" || code === "42P01" || message.includes("profiles") || message.includes("refund_requests");
}

function extractCreditBalance(row: Record<string, unknown>) {
  const balance = row.balance;
  if (typeof balance === "number") {
    return balance;
  }
  const credits = row.credits;
  if (typeof credits === "number") {
    return credits;
  }
  return 0;
}

function formatRefundStatusLabel(status: string) {
  switch (status) {
    case "requested":
      return "사용자 요청";
    case "pending":
      return "처리 중";
    case "completed":
      return "환불 완료";
    case "failed":
      return "실패";
    case "manual_review":
      return "수동 검토";
    default:
      return status || "-";
  }
}

async function listAdminUsers() {
  const admin = createAdminClient();
  const users: AdminUserSummary[] = [];
  let total = 0;
  let page = 1;

  for (let i = 0; i < 10; i += 1) {
    const result = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (result.error) {
      throw result.error;
    }

    users.push(...result.data.users);
    total = result.data.total ?? users.length;
    if (!result.data.nextPage) {
      break;
    }
    page = result.data.nextPage;
  }

  return { users, total };
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const supabase = await createServerClient();
  const headerList = await headers();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/admin");
  }

  if (!hasAdminAccess(headerList, user.email)) {
    notFound();
  }

  const params = (await searchParams) ?? {};
  const message = typeof params.message === "string" ? params.message : null;
  const error = typeof params.error === "string" ? params.error : null;

  const admin = createAdminClient();
  const adminDb = admin.schema(dbSchema());
  const [{ users, total: totalUsers }, creditAccountsResult, paymentRowsResult, refundRequestsResult, deletedProfilesResult] =
    await Promise.all([
      listAdminUsers(),
      adminDb.from("user_credits").select("user_id", { count: "exact", head: true }),
      adminDb.from("credit_ledger").select("*").eq("source", "polar_topup").order("created_at", { ascending: false }).limit(30),
      adminDb.from("refund_requests").select("*").order("created_at", { ascending: false }).limit(30),
      adminDb
        .from("profiles")
        .select("user_id, email, user_credits, account_status, deleted_at, deleted_reason")
        .eq("account_status", "deleted")
        .order("deleted_at", { ascending: false })
        .limit(50),
    ]);

  const userMap = new Map(
    users.map((item) => [
      item.id,
      {
        email: item.email ?? "이메일 없음",
        createdAt: item.created_at,
        lastSignInAt: item.last_sign_in_at,
      },
    ])
  );

  const creditRowsResult = await adminDb
    .from("user_credits")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(100);

  const creditRows =
    !creditRowsResult.error
      ? ((creditRowsResult.data ?? []) as Array<Record<string, unknown>>).map((row) => ({
          user_id: String(row.user_id),
          balance: extractCreditBalance(row),
          created_at: String(row.created_at ?? new Date().toISOString()),
          updated_at: String(row.updated_at ?? new Date().toISOString()),
          email: String(userMap.get(String(row.user_id))?.email ?? "알 수 없음"),
          lastSignInAt: userMap.get(String(row.user_id))?.lastSignInAt ?? null,
        }))
      : [];

  const balanceByUserId = new Map(creditRows.map((row) => [row.user_id, row.balance]));
  const paymentRows = ((paymentRowsResult.data ?? []) as LedgerRow[]).map((row) => {
    const metadata = asMetadata(row.metadata);
    return {
      ...row,
      metadata,
      email: userMap.get(row.user_id)?.email ?? String(metadata.polar_customer_email ?? "알 수 없음"),
      orderId: String(metadata.order_id ?? row.source_id ?? ""),
      packageName: String(metadata.package_name ?? row.description ?? "Polar 결제"),
      amount: Number(metadata.amount ?? 0),
      currentBalance: balanceByUserId.get(row.user_id) ?? 0,
    };
  });

  const refundRows =
    !refundRequestsResult.error
      ? ((refundRequestsResult.data ?? []) as Array<Record<string, unknown>>).map((row) => ({
          id: String(row.id),
          email: userMap.get(String(row.user_id))?.email ?? "알 수 없음",
          orderId: String(row.order_id ?? ""),
          refundId: String(row.refund_id ?? ""),
          status: String(row.status ?? "requested"),
          amount: Number(row.amount ?? 0),
          reason: String(row.reason ?? "-"),
          comment: String(row.comment ?? ""),
          delta: Number(row.credits_reversed ?? 0) * -1,
          created_at: String(row.created_at ?? new Date().toISOString()),
        }))
      : isMissingTableError(refundRequestsResult.error)
      ? (
          await adminDb
            .from("credit_ledger")
            .select("*")
            .eq("source", "refund")
            .order("created_at", { ascending: false })
            .limit(30)
        ).data?.map((row) => {
          const ledgerRow = row as LedgerRow;
          const metadata = asMetadata(ledgerRow.metadata);
          return {
            id: ledgerRow.id,
            email: userMap.get(ledgerRow.user_id)?.email ?? "알 수 없음",
            orderId: String(metadata.order_id ?? ""),
            refundId: String(metadata.refund_id ?? ledgerRow.source_id ?? ""),
            status: String(metadata.refund_status ?? "recorded"),
            amount: Number(metadata.amount ?? 0),
            reason: String(metadata.reason ?? "-"),
            comment: String(metadata.comment ?? ""),
            delta: ledgerRow.delta,
            created_at: ledgerRow.created_at,
          };
        }) ?? []
      : [];

  const refundByOrderId = new Map(refundRows.map((row) => [row.orderId, row]));
  const managedCreditTotal = creditRows.reduce((sum, row) => sum + row.balance, 0);
  const deletedAccounts: DeletedAccountRow[] =
    !deletedProfilesResult.error
      ? ((deletedProfilesResult.data ?? []) as Array<Record<string, unknown>>).map((row) => ({
          user_id: String(row.user_id),
          email: String(row.email ?? userMap.get(String(row.user_id))?.email ?? "알 수 없음"),
          user_credits: Number(row.user_credits ?? 0),
          deleted_at: String(row.deleted_at ?? new Date().toISOString()),
          deleted_reason:
            typeof row.deleted_reason === "string" && row.deleted_reason.trim()
              ? row.deleted_reason
              : null,
          lastSignInAt: userMap.get(String(row.user_id))?.lastSignInAt ?? null,
        }))
      : [];

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Admin Console</p>
          <h1 className="mt-2 text-3xl font-semibold text-gray-900">관리자 페이지</h1>
          <p className="mt-2 text-sm text-gray-500">
            현재 접속 계정: {user.email ?? "로그인 사용자"} · 허용 IP에서만 접근됩니다.
          </p>
        </div>
        <Link
          href="/dashboard?tab=generate"
          className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-500 hover:border-gray-300 hover:text-gray-900 transition-colors"
        >
          대시보드로 돌아가기
        </Link>
      </section>

      {(message || error) && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            error
              ? "border-red-300 bg-red-50 text-red-700"
              : "border-green-300 bg-green-50 text-green-700"
          }`}
        >
          {error || message}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-gray-500">가입 유저</p>
          <p className="mt-3 text-3xl font-semibold text-gray-900">{totalUsers}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-gray-500">크레딧 계정</p>
          <p className="mt-3 text-3xl font-semibold text-gray-900">{creditAccountsResult.count ?? creditRows.length}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-gray-500">최근 결제</p>
          <p className="mt-3 text-3xl font-semibold text-gray-900">{paymentRows.length}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-gray-500">표시 중 잔액 합계</p>
          <p className="mt-3 text-3xl font-semibold text-gray-900">{managedCreditTotal}</p>
        </div>
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">탈퇴 계정 관리</h2>
            <p className="mt-1 text-sm text-gray-500">
              soft delete 처리된 계정을 다시 활성화할 수 있습니다.
            </p>
          </div>
          <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700">
            {deletedAccounts.length}명
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-[0.14em] text-gray-500">
              <tr className="border-b border-gray-200">
                <th className="pb-3 font-medium">이메일</th>
                <th className="pb-3 font-medium">보유 크레딧</th>
                <th className="pb-3 font-medium">최근 로그인</th>
                <th className="pb-3 font-medium">탈퇴 시각</th>
                <th className="pb-3 font-medium">탈퇴 사유</th>
                <th className="pb-3 font-medium text-right">액션</th>
              </tr>
            </thead>
            <tbody>
              {deletedAccounts.map((row) => (
                <tr key={row.user_id} className="border-b border-gray-100 last:border-0">
                  <td className="py-3 pr-4 text-gray-900">{row.email}</td>
                  <td className="py-3 pr-4 font-medium text-gray-900">{row.user_credits}</td>
                  <td className="py-3 pr-4 text-gray-500">
                    {row.lastSignInAt ? dateTime.format(new Date(row.lastSignInAt)) : "-"}
                  </td>
                  <td className="py-3 pr-4 text-gray-500">{dateTime.format(new Date(row.deleted_at))}</td>
                  <td className="py-3 pr-4 text-gray-500">{row.deleted_reason ?? "-"}</td>
                  <td className="py-3 text-right">
                    <form action={reactivateAccount} className="inline-flex">
                      <input type="hidden" name="user_id" value={row.user_id} />
                      <input type="hidden" name="email" value={row.email} />
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                      >
                        다시 활성화
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {deletedAccounts.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-500">
                    현재 탈퇴 처리된 계정이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr,1.9fr]">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">수동 크레딧 조정</h2>
            <p className="mt-1 text-sm text-gray-500">
              이메일 기준으로 크레딧을 수동 지급하거나 차감합니다. 음수는 차감입니다.
            </p>
          </div>

          <form action={adjustCredits} className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-medium text-gray-500">대상 이메일</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="user@example.com"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="delta" className="text-xs font-medium text-gray-500">증감 크레딧</label>
              <input
                id="delta"
                name="delta"
                type="number"
                required
                placeholder="예: 100 또는 -50"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="description" className="text-xs font-medium text-gray-500">사유</label>
              <input
                id="description"
                name="description"
                type="text"
                placeholder="예: 수동 보상 지급"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
            >
              크레딧 반영
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">유저 크레딧 현황</h2>
              <p className="mt-1 text-sm text-gray-500">최근 업데이트 순으로 최대 100명까지 표시합니다.</p>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-[0.14em] text-gray-500">
                <tr className="border-b border-gray-200">
                  <th className="pb-3 font-medium">이메일</th>
                  <th className="pb-3 font-medium">잔액</th>
                  <th className="pb-3 font-medium">최근 로그인</th>
                  <th className="pb-3 font-medium">최근 수정</th>
                </tr>
              </thead>
              <tbody>
                {creditRows.map((row) => (
                  <tr key={row.user_id} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 pr-4 text-gray-900">{row.email}</td>
                    <td className="py-3 pr-4 text-gray-900 font-medium">{row.balance}</td>
                    <td className="py-3 pr-4 text-gray-500">
                      {row.lastSignInAt ? dateTime.format(new Date(row.lastSignInAt)) : "-"}
                    </td>
                    <td className="py-3 text-gray-500">{dateTime.format(new Date(row.updated_at))}</td>
                  </tr>
                ))}
                {creditRows.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-500">
                      크레딧 계정 데이터가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">결제 관리</h2>
          <p className="mt-1 text-sm text-gray-500">
            최근 Polar 결제 내역입니다. 현재는 전액 환불만 지원하며, 사용자가 이미 해당 크레딧을 모두 사용한 경우 환불 버튼이 비활성화됩니다.
          </p>
        </div>

        <div className="space-y-4">
          {paymentRows.map((row) => {
            const existingRefund = refundByOrderId.get(row.orderId);
            const refundStatus = existingRefund?.status ?? null;
            const refundLocked =
              refundStatus === "pending" || refundStatus === "completed" || refundStatus === "manual_review";
            const canRefund =
              Boolean(process.env.POLAR_ACCESS_TOKEN) &&
              row.amount > 0 &&
              row.delta > 0 &&
              row.currentBalance >= row.delta &&
              (!existingRefund || refundStatus === "requested" || refundStatus === "failed");

            return (
              <div key={row.id} className="rounded-2xl border border-gray-200 p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">{row.packageName}</p>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                        {row.email}
                      </span>
                      {existingRefund && (
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                          {formatRefundStatusLabel(existingRefund.status)}
                        </span>
                      )}
                    </div>
                    <div className="grid gap-1 text-sm text-gray-500">
                      <p>주문 ID: <span className="font-mono text-gray-900">{row.orderId || "-"}</span></p>
                      <p>결제 금액: <span className="text-gray-900">{row.amount > 0 ? currency.format(row.amount / 100) : "-"}</span></p>
                      <p>지급 크레딧: <span className="text-gray-900">+{row.delta}</span></p>
                      <p>현재 잔액: <span className="text-gray-900">{row.currentBalance}</span></p>
                      <p>결제 시각: <span className="text-gray-900">{dateTime.format(new Date(row.created_at))}</span></p>
                    </div>
                    {existingRefund && (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm">
                        <p className="font-medium text-amber-900">환불 요청 내용</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.14em] text-amber-700">사유</p>
                        <p className="mt-1 text-sm text-amber-900">{existingRefund.reason || "-"}</p>
                        <p className="mt-3 text-xs uppercase tracking-[0.14em] text-amber-700">메모</p>
                        <p className="mt-1 text-sm text-amber-900">{existingRefund.comment || "-"}</p>
                      </div>
                    )}
                  </div>

                  <form action={refundPayment} className="w-full max-w-sm space-y-2">
                    <input type="hidden" name="ledger_id" value={row.id} />
                    <label className="block text-xs font-medium text-gray-500">
                      환불 사유
                      <select
                        name="reason"
                        defaultValue="customer_request"
                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500"
                      >
                        <option value="customer_request">customer_request</option>
                        <option value="duplicate">duplicate</option>
                        <option value="service_disruption">service_disruption</option>
                        <option value="satisfaction_guarantee">satisfaction_guarantee</option>
                        <option value="other">other</option>
                      </select>
                    </label>
                    <label className="block text-xs font-medium text-gray-500">
                      관리자 메모
                      <input
                        name="comment"
                        type="text"
                        placeholder="환불 메모"
                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500"
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={!canRefund}
                      className="w-full rounded-xl px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 bg-red-600 text-white hover:bg-red-500"
                    >
                      {refundStatus === "requested"
                        ? "요청 처리 후 환불"
                        : refundStatus === "failed"
                          ? "환불 재시도"
                          : "전액 환불"}
                    </button>
                    {!process.env.POLAR_ACCESS_TOKEN && (
                      <p className="text-xs text-amber-600">POLAR_ACCESS_TOKEN이 없어 환불 요청을 보낼 수 없습니다.</p>
                    )}
                    {refundStatus === "requested" && (
                      <p className="text-xs text-amber-700">사용자가 환불 요청을 남긴 주문입니다. 검토 후 환불을 진행하세요.</p>
                    )}
                    {refundLocked && (
                      <p className="text-xs text-gray-500">
                        {refundStatus === "completed"
                          ? "이미 환불 처리된 주문입니다."
                          : refundStatus === "manual_review"
                            ? "수동 검토가 필요한 환불 건입니다."
                            : "이미 환불 처리 중인 주문입니다."}
                      </p>
                    )}
                    {refundStatus === "failed" && (
                      <p className="text-xs text-amber-700">이전 환불 시도가 실패했습니다. 재시도 전에 주문 상태를 확인하세요.</p>
                    )}
                    {!refundLocked && row.currentBalance < row.delta && (
                      <p className="text-xs text-gray-500">현재 잔액이 부족해 자동 환불 회수가 불가능합니다.</p>
                    )}
                  </form>
                </div>
              </div>
            );
          })}

          {paymentRows.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-10 text-center text-sm text-gray-500">
              최근 결제 내역이 없습니다.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">환불 관리</h2>
          <p className="mt-1 text-sm text-gray-500">
            관리자 페이지에서 생성된 환불 기록과 회수된 크레딧을 확인합니다.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-[0.14em] text-gray-500">
              <tr className="border-b border-gray-200">
                <th className="pb-3 font-medium">이메일</th>
                <th className="pb-3 font-medium">주문 ID</th>
                <th className="pb-3 font-medium">사유 / 메모</th>
                <th className="pb-3 font-medium">환불 금액</th>
                <th className="pb-3 font-medium">회수 크레딧</th>
                <th className="pb-3 font-medium">상태</th>
                <th className="pb-3 font-medium">시각</th>
              </tr>
            </thead>
            <tbody>
              {refundRows.map((row) => (
                <tr key={row.id} className="border-b border-gray-100 last:border-0">
                  <td className="py-3 pr-4 text-gray-900">{row.email}</td>
                  <td className="py-3 pr-4 font-mono text-xs text-gray-500">{row.orderId || "-"}</td>
                  <td className="py-3 pr-4 text-gray-500">
                    <p className="font-medium text-gray-900">{row.reason}</p>
                    <p className="mt-1 text-xs leading-5 text-gray-500">{row.comment || "-"}</p>
                  </td>
                  <td className="py-3 pr-4 text-gray-900">{row.amount > 0 ? currency.format(row.amount / 100) : "-"}</td>
                  <td className="py-3 pr-4 text-gray-900">{row.delta}</td>
                  <td className="py-3 pr-4 text-gray-500">{row.status}</td>
                  <td className="py-3 text-gray-500">{dateTime.format(new Date(row.created_at))}</td>
                </tr>
              ))}
              {refundRows.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-gray-500">
                    아직 환불 기록이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
