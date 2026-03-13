import FeaturesSection from "@/components/landing/FeaturesSection";
import GallerySection from "@/components/landing/GallerySection";
import HeroSection from "@/components/landing/HeroSection";
import LandingFooter from "@/components/landing/LandingFooter";

export default function Home() {
  return (
    <>
      <div className="flex flex-col gap-28 pb-28">
        <HeroSection />
        <FeaturesSection />
        <GallerySection />
      </div>
      <LandingFooter />
    </>
  );
}
