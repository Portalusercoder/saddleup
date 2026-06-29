"use client";

import Image from "next/image";
import ScrollReveal from "@/components/ui/ScrollReveal";
import LandingSectionHeader from "@/components/landing/LandingSectionHeader";
import { useLanguage } from "@/components/providers/LanguageProvider";

type LandingCtaBandProps = {
  onStartFree: () => void;
};

export default function LandingCtaBand({ onStartFree }: LandingCtaBandProps) {
  const { t } = useLanguage();

  return (
    <section className="landing-cta-band relative overflow-hidden bg-[#1d1d1f] text-white">
      <div
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          background:
            "radial-gradient(ellipse 70% 80% at 50% 120%, rgba(83,22,29,0.5), transparent 60%)",
        }}
        aria-hidden
      />

      <div className="landing-cta-band-bg" aria-hidden>
        <Image
          src="/horseback.jpg"
          alt=""
          width={1920}
          height={1280}
          className="landing-cta-band-photo"
        />
        <div className="landing-cta-band-scrim" />
      </div>

      <div className="relative max-w-6xl mx-auto landing-cta-band-inner">
        <ScrollReveal className="landing-cta-band-copy">
          <LandingSectionHeader
            title={t("footer.ctaTitle")}
            description={t("home.ctaBandSub")}
            onDark
            className="mb-0"
          />
          <button
            type="button"
            onClick={onStartFree}
            className="mt-8 landing-cta-pill landing-cta-primary"
          >
            {t("footer.getStarted")}
          </button>
        </ScrollReveal>
      </div>
    </section>
  );
}
