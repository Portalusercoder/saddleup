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

      <div className="landing-hero-club-shell relative z-[1] flex min-h-[100dvh] flex-col">
        <div className="landing-hero-club-copy flex flex-col items-center text-center px-4 sm:px-8 pt-20 sm:pt-24 pb-4 sm:pb-6">
          <h1 className="landing-hero-in landing-hero-in-delay-1 landing-hero-script">
            {t("home.heroTitle")}
          </h1>
          <p className="landing-hero-in landing-hero-in-delay-2 landing-hero-club-sub mt-5 sm:mt-6 max-w-xl mx-auto text-[0.9375rem] sm:text-base leading-relaxed">
            {t("home.heroSub")}
          </p>
          <button
            type="button"
            onClick={onStartFree}
            className="landing-hero-in landing-hero-in-delay-3 landing-hero-nav-cta mt-6 sm:mt-8 sm:hidden"
          >
            {t("nav.startFree")}
          </button>
        </div>

        <div className="landing-hero-club-mockup landing-hero-in landing-hero-in-delay-4 mt-auto w-full px-3 sm:px-6 pb-2 sm:pb-6">
          <Image
            src="/hero-dashboard-mockup.png"
            alt={t("home.heroMockupAlt")}
            width={1600}
            height={1000}
            priority
            className="landing-hero-club-mockup-img"
          />
        </div>
      </div>
    </section>
  );
}
