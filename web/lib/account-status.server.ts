import "server-only";

import type { User } from "@supabase/supabase-js";
import { createAdminClient, dbSchema } from "@/lib/supabase/server";
import { isDeletedAccountMetadata } from "@/lib/account-status";

type ProfileStatusRow = {
  account_status?: string | null;
  deleted_at?: string | null;
};

function isMissingProfileStatusError(error: { code?: string | null; message?: string | null } | null | undefined) {
  const code = String(error?.code ?? "");
  const message = String(error?.message ?? "");
  return (
    code === "PGRST205" ||
    message.includes("profiles") ||
    message.includes("account_status") ||
    message.includes("deleted_at")
  );
}

function isDeletedProfileRow(row: ProfileStatusRow | null | undefined) {
  return row?.account_status === "deleted" || Boolean(row?.deleted_at);
}

export async function isSoftDeletedAccount(
  user: Pick<User, "id" | "app_metadata" | "user_metadata"> | null | undefined
) {
  if (!user?.id) {
    return false;
  }

  if (isDeletedAccountMetadata(user)) {
    return true;
  }

  try {
    const adminDb = createAdminClient().schema(dbSchema());
    const result = await adminDb
      .from("profiles")
      .select("account_status, deleted_at")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (result.error) {
      if (isMissingProfileStatusError(result.error)) {
        return false;
      }
      throw result.error;
    }

    return isDeletedProfileRow((result.data ?? null) as ProfileStatusRow | null);
  } catch {
    return false;
  }
}
