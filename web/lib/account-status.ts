type UserMetadataLike = {
  app_metadata?: Record<string, unknown> | null;
  user_metadata?: Record<string, unknown> | null;
} | null | undefined;

export const ACCOUNT_DELETED_ERROR_MESSAGE =
  "탈퇴 처리된 계정입니다. 도움이 필요하면 문의 메일로 연락해주세요.";

export function isDeletedAccountMetadata(user: UserMetadataLike) {
  const appMetadata = user?.app_metadata ?? {};
  const userMetadata = user?.user_metadata ?? {};

  return (
    appMetadata.account_status === "deleted" ||
    userMetadata.account_status === "deleted" ||
    Boolean(appMetadata.deleted_at) ||
    Boolean(userMetadata.deleted_at)
  );
}
