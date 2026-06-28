"use client";

import ScrollReveal from "@/components/ui/ScrollReveal";
import { useLanguage } from "@/components/providers/LanguageProvider";

type LandingCtaBandProps = {
  onStartFree: () => void;
};

export default function LandingCtaBand({ onStartFree }: LandingCtaBandProps) {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-[#1d1d1f] text-white py-20 sm:py-28 px-6">
      <div
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          background:
            "radial-gradient(ellipse 70% 80% at 50% 120%, rgba(83,22,29,0.5), transparent 60%)",
        }}
      />
      <ScrollReveal className="relative max-w-3xl mx-auto text-center">
        <h2 className="landing-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
          {t("footer.ctaTitle")}
        </h2>
        <p className="mt-4 text-base sm:text-lg text-white/55 max-w-xl mx-auto">{t("home.ctaBandSub")}</p>
        <button
          type="button"
          onClick={onStartFree}
          className="mt-8 landing-cta-pill landing-cta-primary"
        >
          {t("footer.getStarted")}
        </button>
      </ScrollReveal>
    </section>
  );
}
