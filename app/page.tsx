import Footer from "@/components/landing/Footer";
import PartnerSpotlight from "@/components/landing/PartnerSpotlight";
import LandingFeatures from "@/components/landing/LandingFeatures";
import HowItWorks from "@/components/landing/HowItWorks";
import LandingPricing from "@/components/landing/LandingPricing";
import LandingTestimonial from "@/components/landing/LandingTestimonial";
import LandingHero from "@/components/landing/LandingHero";
import LandingCtaBand from "@/components/landing/LandingCtaBand";

export default function Home() {
  return (
    <main className="landing-page min-h-screen">
      <LandingHero />

      <div className="landing-premium">
        <HowItWorks />
        <LandingFeatures />
        <LandingPricing />
        <LandingTestimonial />
        <PartnerSpotlight />
      </div>

      <LandingCtaBand />
      <Footer />
    </main>
  );
}
