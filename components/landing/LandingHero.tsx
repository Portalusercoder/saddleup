"use client";

import Image from "next/image";
import Link from "next/link";
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
          src="/horseback.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="landing-hero-club-photo"
        />
        <div className="landing-hero-club-scrim" />
      </div>

      <div className="landing-hero-club-shell relative z-[1] flex min-h-[100dvh] flex-col justify-end md:justify-center">
        <div className="flex flex-col items-start text-left px-5 sm:px-8 md:px-12 lg:px-16 pb-16 sm:pb-20 md:pb-0 pt-28 max-w-xl md:max-w-2xl">
          <h1 className="landing-hero-in landing-hero-in-delay-1 landing-hero-brand">
            {t("home.heroTitle")}
          </h1>
          <p className="landing-hero-in landing-hero-in-delay-2 landing-hero-line mt-5 sm:mt-6">
            {t("home.heroLine1")} {t("home.heroLine2")}
          </p>
          <p className="landing-hero-in landing-hero-in-delay-3 landing-hero-club-sub mt-4 text-[0.9375rem] sm:text-base leading-relaxed">
            {t("home.heroSub")}
          </p>
          <div className="landing-hero-in landing-hero-in-delay-4 landing-hero-cta-row mt-8 sm:mt-10">
            <button type="button" onClick={onStartFree} className="landing-hero-cta-primary">
              {t("nav.startFree")}
            </button>
            <Link href="/login" className="landing-hero-cta-ghost">
              {t("nav.signIn")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
