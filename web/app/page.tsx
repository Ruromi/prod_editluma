import FeaturesSection from "@/components/landing/FeaturesSection";
import GallerySection from "@/components/landing/GallerySection";
import HeroSection from "@/components/landing/HeroSection";
import LandingFooter from "@/components/landing/LandingFooter";
import { createServerClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <div className="flex flex-col gap-28 pb-28">
        <HeroSection isAuthenticated={Boolean(user)} />
        <FeaturesSection />
        <GallerySection />
      </div>
      <LandingFooter />
    </>
  );
}
