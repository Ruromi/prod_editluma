import { redirect } from "next/navigation";

export default async function LoginAliasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = new URLSearchParams();
  const resolvedSearchParams = await searchParams;

  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (typeof value === "string") {
      params.set(key, value);
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
    }
  });

  const query = params.toString();
  redirect(`/auth/login${query ? `?${query}` : ""}`);
}
