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
          src="/hero-dashboard-mockup.png"
          alt=""
          width={1024}
          height={583}
          priority
          fill
          sizes="100vw"
          className="landing-hero-club-mockup-full"
        />
        <div className="landing-hero-club-scrim" />
      </div>

      <div className="landing-hero-club-shell relative z-[1] flex min-h-[100dvh] flex-col">
        <div className="landing-hero-club-copy flex flex-col items-center md:items-start text-center md:text-left px-4 sm:px-8 md:px-12 lg:px-16 pt-20 sm:pt-24 pb-8 max-w-xl md:max-w-lg lg:max-w-xl">
          <h1 className="landing-hero-in landing-hero-in-delay-1 landing-hero-script">
            {t("home.heroTitle")}
          </h1>
          <p className="landing-hero-in landing-hero-in-delay-2 landing-hero-club-sub mt-5 sm:mt-6 max-w-xl md:max-w-none mx-auto md:mx-0 text-[0.9375rem] sm:text-base leading-relaxed">
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
      </div>
    </section>
  );
}
