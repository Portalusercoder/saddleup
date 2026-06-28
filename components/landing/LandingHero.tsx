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
    <section className="relative min-h-[100dvh] w-screen left-1/2 -ml-[50vw] flex flex-col overflow-hidden -mt-20 pt-20">
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

      <div className="relative flex-1 flex flex-col items-center justify-center px-6 sm:px-10 pb-16 pt-8 text-center">
        <motion.p
          {...fade(0.05)}
          className="landing-display text-xs sm:text-sm font-semibold tracking-wide text-white/60 uppercase"
        >
          {t("home.heroEyebrow")}
        </motion.p>

        <motion.h1
          {...fade(0.12)}
          className="landing-display mt-5 max-w-4xl text-[2.75rem] sm:text-5xl md:text-6xl lg:text-[4.25rem] font-semibold leading-[1.05] text-white"
        >
          {t("home.heroLine1")}
          <br />
          <span className="text-white/85">{t("home.heroLine2")}</span>
        </motion.h1>

        <motion.p
          {...fade(0.2)}
          className="mt-6 max-w-2xl text-base sm:text-lg md:text-xl text-white/65 leading-relaxed font-normal"
        >
          {t("home.heroSub")}
        </motion.p>

        <motion.div
          {...fade(0.28)}
          className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
        >
          <button type="button" onClick={onStartFree} className="landing-cta-pill landing-cta-primary">
            {t("home.ctaPrimary")}
          </button>
          <Link href="#how-it-works" className="landing-cta-pill landing-cta-secondary">
            {t("home.ctaSecondary")}
          </Link>
        </motion.div>

        <motion.p {...fade(0.34)} className="mt-4 text-sm text-white/45">
          {t("home.ctaPrimarySub")}
        </motion.p>

        <motion.div
          {...fade(0.42)}
          className="mt-14 flex flex-wrap items-center justify-center gap-2 sm:gap-3 max-w-3xl"
        >
          {trustItems.map((item) => (
            <span
              key={item}
              className="landing-glass-dark rounded-full px-4 py-2 text-[0.7rem] sm:text-xs text-white/75 font-medium"
            >
              {item}
            </span>
          ))}
        </motion.div>
      </div>

      <motion.a
        href="#how-it-works"
        aria-label={t("home.scrollFeatures")}
        initial={reduceMotion ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="relative pb-8 flex justify-center text-white/30 hover:text-white/60 transition-colors"
      >
        <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </motion.a>
    </section>
  );
}
