"use client";

import { useState } from "react";
import AuthModal from "@/components/landing/AuthModal";
import AudiencePage from "@/components/landing/AudiencePage";

export default function ForSchoolsPage() {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      <AudiencePage
        titleKey="forSchools.title"
        subtitleKey="forSchools.subtitle"
        bodyKey="forSchools.body"
        ctaKey="forSchools.cta"
        onStartFree={() => setAuthOpen(true)}
      />
    </>
  );
}
