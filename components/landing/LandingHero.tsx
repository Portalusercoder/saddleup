"use client";

import Image from "next/image";
import { useLanguage } from "@/components/providers/LanguageProvider";

type LandingHeroProps = {
  onStartFree: () => void;
};

export default function LandingHero({ onStartFree }: LandingHeroProps) {
  const { t } = useLanguage();

  return (
    <section className="landing-hero-club relative w-full min-h-[100dvh] flex flex-col overflow-hidden">
      <div className="landing-hero-club-bg" aria-hidden>
        <Image
          src="/hero-bg.png"
          alt=""
          width={1920}
          height={1080}
          priority
          className="landing-hero-club-photo"
        />
        <div className="landing-hero-club-scrim" />
      </div>

      <div className="landing-hero-club-copy relative z-[1] flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-8 pt-20 sm:pt-24 pb-12 sm:pb-20">
        <h1 className="landing-hero-in landing-hero-in-delay-1 landing-hero-script">
          {t("home.heroTitle")}
        </h1>
        <p className="landing-hero-in landing-hero-in-delay-2 landing-hero-club-sub mt-6 sm:mt-8 max-w-xl mx-auto text-[0.9375rem] sm:text-base leading-relaxed">
          {t("home.heroSub")}
        </p>
        <button
          type="button"
          onClick={onStartFree}
          className="landing-hero-in landing-hero-in-delay-3 landing-hero-nav-cta mt-8 sm:hidden"
        >
          {t("nav.startFree")}
        </button>
      </div>
    </section>
  );
}
