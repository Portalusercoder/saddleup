"use client";

import { useState } from "react";
import AuthModal from "@/components/landing/AuthModal";
import AudiencePage from "@/components/landing/AudiencePage";

export default function ForTrainersPage() {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      <AudiencePage
        titleKey="forTrainers.title"
        subtitleKey="forTrainers.subtitle"
        bodyKey="forTrainers.body"
        ctaKey="forTrainers.cta"
        onStartFree={() => setAuthOpen(true)}
      />
    </>
  );
}
