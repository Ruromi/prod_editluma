import LandingPageContent from "@/components/landing/LandingPageContent";
import { createServerClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <LandingPageContent isAuthenticated={Boolean(user)} />
  );
}
