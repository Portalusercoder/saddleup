"use client";

import Image from "next/image";
import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import LandingSectionHeader from "@/components/landing/LandingSectionHeader";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function LandingCtaBand() {
  const { t } = useLanguage();

  return (
    <section className="landing-cta-band relative overflow-hidden bg-base text-white">
      <div className="landing-cta-band-bg" aria-hidden>
        <Image
          src="/horseback.jpg"
          alt=""
          width={1920}
          height={1280}
          className="landing-cta-band-photo"
        />
        <div className="landing-cta-band-scrim" />
      </div>

      <div className="relative max-w-6xl mx-auto landing-cta-band-inner">
        <ScrollReveal className="landing-cta-band-copy">
          <LandingSectionHeader
            title={t("footer.ctaTitle")}
            description={t("home.ctaBandSub")}
            onDark
            className="mb-0"
          />
          <Link href="/signup" className="mt-8 su-btn-primary !bg-mist !text-forest inline-flex">
            {t("footer.getStarted")}
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
