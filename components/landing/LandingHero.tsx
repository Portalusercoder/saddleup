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
      <div className="landing-hero-club-copy relative z-[1] flex-1 flex flex-col items-center justify-center text-center px-5 sm:px-8 pt-24 sm:pt-28 pb-4">
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

      <div className="landing-hero-club-visual relative z-0 w-full shrink-0 pointer-events-none" aria-hidden>
        <div className="landing-hero-club-visual-fade" />
        <Image
          src="/hero-bg.png"
          alt=""
          width={1920}
          height={1080}
          priority
          className="landing-hero-club-photo"
        />
      </div>
    </section>
  );
}
