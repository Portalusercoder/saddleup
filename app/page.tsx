"use client";

import { useState } from "react";
import AuthModal from "@/components/landing/AuthModal";
import Footer from "@/components/landing/Footer";
import PartnerSpotlight from "@/components/landing/PartnerSpotlight";
import LandingFeatures from "@/components/landing/LandingFeatures";
import HowItWorks from "@/components/landing/HowItWorks";
import LandingPricing from "@/components/landing/LandingPricing";
import LandingTestimonial from "@/components/landing/LandingTestimonial";
import LandingHero from "@/components/landing/LandingHero";
import LandingCtaBand from "@/components/landing/LandingCtaBand";
import ThemeToggle from "@/components/layout/ThemeToggle";

export default function Home() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | undefined>();

  const openAuth = (planId?: string) => {
    setSelectedPlan(planId);
    setAuthModalOpen(true);
  };

  return (
    <main className="min-h-screen bg-[#f5f5f7]">
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        planId={selectedPlan}
      />

      <LandingHero onStartFree={() => openAuth()} />

      <div className="landing-premium landing-surface">
        <HowItWorks />
        <LandingFeatures />
        <LandingPricing onSelectPlan={openAuth} />
        <LandingTestimonial />
        <PartnerSpotlight />
      </div>

      <LandingCtaBand onStartFree={() => openAuth()} />
      <Footer />

      <div className="fixed bottom-6 end-6 z-50">
        <ThemeToggle variant="dark" />
      </div>
    </main>
  );
}
