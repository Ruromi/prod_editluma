/**
 * Browser-side Supabase client.
 * Uses NEXT_PUBLIC_SUPABASE_ANON_KEY — safe to expose to the browser.
 */
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
