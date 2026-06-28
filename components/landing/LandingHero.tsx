"use client";

import Link from "next/link";
import { useLanguage } from "@/components/providers/LanguageProvider";

type LandingHeroProps = {
  onStartFree: () => void;
};

export default function LandingHero({ onStartFree }: LandingHeroProps) {
  const { t } = useLanguage();

  const trustItems = [
    t("home.trustBuiltFor"),
    t("home.trustArabic"),
    t("home.trustFreeStart"),
  ];

  return (
    <section className="landing-hero relative min-h-[100dvh] w-full flex flex-col overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{ backgroundImage: "url(/hero-bg.png)" }}
        aria-hidden
      />
      <div className="absolute inset-0 landing-hero-mesh" aria-hidden />
      <div
        className="absolute inset-0 pointer-events-none opacity-40 landing-orb"
        style={{
          background:
            "radial-gradient(circle at 70% 30%, rgba(212,165,116,0.25) 0%, transparent 45%)",
        }}
        aria-hidden
      />

      <div className="absolute bottom-0 inset-x-0 h-20 sm:h-28 bg-gradient-to-b from-transparent to-[#f5f5f7] pointer-events-none z-[1]" aria-hidden />

      <div className="landing-hero-content relative z-[2] flex-1 flex flex-col items-center justify-center px-5 sm:px-10 pb-16 sm:pb-20 pt-24 sm:pt-28 text-center">
        <p className="landing-hero-in landing-hero-in-delay-1 landing-display text-[0.65rem] sm:text-sm font-semibold tracking-wide text-white/75 uppercase">
          {t("home.heroEyebrow")}
        </p>

        <h1 className="landing-hero-in landing-hero-in-delay-2 landing-display mt-4 sm:mt-5 max-w-4xl text-[2.125rem] leading-[1.08] min-[400px]:text-[2.35rem] sm:text-5xl md:text-6xl lg:text-[4.25rem] font-semibold text-white">
          {t("home.heroLine1")}
          <br />
          <span className="text-white/90">{t("home.heroLine2")}</span>
        </h1>

        <p className="landing-hero-in landing-hero-in-delay-3 mt-5 sm:mt-6 max-w-2xl text-[0.9375rem] sm:text-lg md:text-xl text-white/75 leading-relaxed font-normal">
          {t("home.heroSub")}
        </p>

        <div className="landing-hero-in landing-hero-in-delay-4 mt-8 sm:mt-10 flex flex-col min-[480px]:flex-row w-full max-w-md sm:max-w-none sm:w-auto items-stretch min-[480px]:items-center justify-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onStartFree}
            className="landing-cta-pill landing-cta-primary w-full sm:w-auto justify-center"
          >
            {t("home.ctaPrimary")}
          </button>
          <Link
            href="#how-it-works"
            className="landing-cta-pill landing-cta-secondary w-full sm:w-auto justify-center"
          >
            {t("home.ctaSecondary")}
          </Link>
        </div>

        <p className="landing-hero-in landing-hero-in-delay-5 mt-3 sm:mt-4 text-xs sm:text-sm text-white/55">
          {t("home.ctaPrimarySub")}
        </p>

        <div className="landing-hero-in landing-hero-in-delay-6 mt-10 sm:mt-12 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2 sm:gap-3 max-w-3xl w-full">
          {trustItems.map((item) => (
            <span
              key={item}
              className="landing-glass-dark rounded-full px-3.5 sm:px-4 py-2 text-[0.68rem] sm:text-xs text-white/85 font-medium w-full sm:w-auto text-center"
            >
              {item}
            </span>
          ))}
        </div>

        <a
          href="#how-it-works"
          aria-label={t("home.scrollFeatures")}
          className="landing-hero-in landing-hero-in-delay-7 mt-10 sm:mt-12 inline-flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </a>
      </div>
    </section>
  );
}
