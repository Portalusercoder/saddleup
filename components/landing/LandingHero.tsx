"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/components/providers/LanguageProvider";

type LandingHeroProps = {
  onStartFree: () => void;
};

export default function LandingHero({ onStartFree }: LandingHeroProps) {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();

  const fade = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 28, filter: "blur(8px)" },
          animate: { opacity: 1, y: 0, filter: "blur(0px)" },
          transition: { duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] as const },
        };

  const trustItems = [
    t("home.trustBuiltFor"),
    t("home.trustArabic"),
    t("home.trustFreeStart"),
  ];

  return (
    <section className="relative min-h-[100dvh] w-screen left-1/2 -ml-[50vw] flex flex-col overflow-hidden -mt-16 sm:-mt-20 pt-16 sm:pt-20">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{ backgroundImage: "url(/hero-bg.png)" }}
      />
      <div className="absolute inset-0 landing-hero-mesh" />
      <div
        className="absolute inset-0 pointer-events-none opacity-40 landing-orb"
        style={{
          background:
            "radial-gradient(circle at 70% 30%, rgba(212,165,116,0.25) 0%, transparent 45%)",
        }}
      />

      {/* Fade hero into the light section below */}
      <div className="absolute bottom-0 inset-x-0 h-28 sm:h-36 bg-gradient-to-b from-transparent via-[#f5f5f7]/40 to-[#f5f5f7] pointer-events-none z-[1]" />

      <div className="relative z-[2] flex-1 flex flex-col items-center justify-center px-5 sm:px-10 pb-10 sm:pb-14 pt-6 sm:pt-8 text-center">
        <motion.p
          {...fade(0.05)}
          className="landing-display text-[0.65rem] sm:text-sm font-semibold tracking-wide text-white/70 uppercase"
        >
          {t("home.heroEyebrow")}
        </motion.p>

        <motion.h1
          {...fade(0.12)}
          className="landing-display mt-4 sm:mt-5 max-w-4xl text-[2.125rem] leading-[1.08] min-[400px]:text-[2.35rem] sm:text-5xl md:text-6xl lg:text-[4.25rem] font-semibold text-white"
        >
          {t("home.heroLine1")}
          <br />
          <span className="text-white/88">{t("home.heroLine2")}</span>
        </motion.h1>

        <motion.p
          {...fade(0.2)}
          className="mt-5 sm:mt-6 max-w-2xl text-[0.9375rem] sm:text-lg md:text-xl text-white/70 leading-relaxed font-normal px-1"
        >
          {t("home.heroSub")}
        </motion.p>

        <motion.div
          {...fade(0.28)}
          className="mt-8 sm:mt-10 flex flex-col min-[480px]:flex-row w-full max-w-md sm:max-w-none sm:w-auto items-stretch min-[480px]:items-center justify-center gap-3 sm:gap-4 px-2 sm:px-0"
        >
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
        </motion.div>

        <motion.p {...fade(0.34)} className="mt-3 sm:mt-4 text-xs sm:text-sm text-white/50">
          {t("home.ctaPrimarySub")}
        </motion.p>

        <motion.div
          {...fade(0.42)}
          className="mt-10 sm:mt-14 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2 sm:gap-3 max-w-3xl w-full px-2"
        >
          {trustItems.map((item) => (
            <span
              key={item}
              className="landing-glass-dark rounded-full px-3.5 sm:px-4 py-2 text-[0.68rem] sm:text-xs text-white/80 font-medium w-full sm:w-auto text-center"
            >
              {item}
            </span>
          ))}
        </motion.div>

        <motion.a
          href="#how-it-works"
          aria-label={t("home.scrollFeatures")}
          initial={reduceMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-10 sm:mt-12 inline-flex items-center justify-center text-white/35 hover:text-white/65 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.a>
      </div>
    </section>
  );
}
