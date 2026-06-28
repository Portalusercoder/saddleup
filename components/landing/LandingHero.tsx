"use client";

import Link from "next/link";
import { useLanguage } from "@/components/providers/LanguageProvider";

type LandingHeroProps = {
  onStartFree: () => void;
};

export default function LandingHero({ onStartFree }: LandingHeroProps) {
  const { t } = useLanguage();

  return (
    <section className="landing-hero relative w-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/hero-bg.png)" }}
        aria-hidden
      />
      <div className="absolute inset-0 landing-hero-mesh" aria-hidden />
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background:
            "radial-gradient(circle at 75% 25%, rgba(212,165,116,0.2) 0%, transparent 50%)",
        }}
        aria-hidden
      />

      <div className="landing-hero-content relative z-[1] max-w-4xl mx-auto px-5 sm:px-8 pt-28 sm:pt-32 pb-20 sm:pb-24 text-center">
        <p className="landing-hero-in landing-hero-in-delay-1 text-xs sm:text-sm font-medium tracking-[0.14em] text-white/70 uppercase">
          {t("home.heroEyebrow")}
        </p>

        <h1 className="landing-hero-in landing-hero-in-delay-2 landing-display mt-4 sm:mt-5 text-[2.125rem] leading-[1.08] min-[400px]:text-[2.5rem] sm:text-5xl md:text-[3.25rem] lg:text-6xl font-semibold text-white">
          {t("home.heroLine1")}
          <br />
          <span className="text-white/90">{t("home.heroLine2")}</span>
        </h1>

        <p className="landing-hero-in landing-hero-in-delay-3 mt-5 sm:mt-6 max-w-2xl mx-auto text-[0.9375rem] sm:text-lg text-white/72 leading-relaxed">
          {t("home.heroSub")}
        </p>

        <div className="landing-hero-in landing-hero-in-delay-4 mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-sm sm:max-w-none mx-auto">
          <button type="button" onClick={onStartFree} className="landing-cta-pill landing-cta-brand">
            {t("home.ctaPrimary")}
          </button>
          <Link href="#how-it-works" className="landing-cta-pill landing-cta-ghost">
            {t("home.ctaSecondary")}
          </Link>
        </div>

        <p className="landing-hero-in landing-hero-in-delay-5 mt-4 text-xs sm:text-sm text-white/50">
          {t("home.ctaPrimarySub")}
        </p>
      </div>
    </section>
  );
}
