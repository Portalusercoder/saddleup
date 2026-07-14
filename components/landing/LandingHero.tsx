"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function LandingHero() {
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

      <div className="landing-hero-club-shell relative z-[1] flex min-h-[100dvh] flex-col justify-end">
        <div className="landing-hero-club-content">
          <h1 className="landing-hero-in landing-hero-in-delay-1 landing-hero-brand">
            {t("home.heroTitle")}
          </h1>
          <p className="landing-hero-in landing-hero-in-delay-2 landing-hero-line">
            {t("home.heroLine1")} {t("home.heroLine2")}
          </p>
          <p className="landing-hero-in landing-hero-in-delay-3 landing-hero-club-sub">
            {t("home.heroSub")}
          </p>
          <div className="landing-hero-in landing-hero-in-delay-4 landing-hero-cta-row">
            <Link href="/signup" className="landing-hero-cta-primary">
              {t("nav.startFree")}
            </Link>
            <Link href="/login" className="landing-hero-cta-ghost">
              {t("nav.signIn")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
