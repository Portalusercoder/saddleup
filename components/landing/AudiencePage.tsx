"use client";

import Link from "next/link";
import Image from "next/image";
import ScrollReveal from "@/components/ui/ScrollReveal";
import Footer from "@/components/landing/Footer";
import { useLanguage } from "@/components/providers/LanguageProvider";

type AudiencePageProps = {
  titleKey: "forSchools.title" | "forTrainers.title";
  subtitleKey: "forSchools.subtitle" | "forTrainers.subtitle";
  bodyKey: "forSchools.body" | "forTrainers.body";
  ctaKey: "forSchools.cta" | "forTrainers.cta";
  onStartFree: () => void;
};

export default function AudiencePage({
  titleKey,
  subtitleKey,
  bodyKey,
  ctaKey,
  onStartFree,
}: AudiencePageProps) {
  const { t } = useLanguage();

  return (
    <main className="landing-page min-h-screen">
      <section className="relative min-h-[70dvh] flex items-end overflow-hidden">
        <div className="absolute inset-0" aria-hidden>
          <Image
            src="/hero-bg.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(105deg, rgba(12,16,14,0.82) 0%, rgba(12,16,14,0.5) 55%, rgba(12,16,14,0.25) 100%)",
            }}
          />
        </div>
        <div className="relative z-[1] max-w-3xl px-6 sm:px-10 lg:px-16 pb-16 sm:pb-24 pt-32">
          <ScrollReveal>
            <p className="text-xs uppercase tracking-[0.22em] text-white/55 mb-4">Saddle Up</p>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-white text-balance">
              {t(titleKey)}
            </h1>
            <p className="mt-5 text-lg text-white/75 max-w-xl">{t(subtitleKey)}</p>
          </ScrollReveal>
        </div>
      </section>

      <section className="landing-premium max-w-3xl mx-auto px-6 py-16 sm:py-20">
        <ScrollReveal>
          <p className="landing-ink-muted leading-relaxed text-lg">{t(bodyKey)}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <button type="button" onClick={onStartFree} className="landing-cta-pill landing-solid-btn">
              {t(ctaKey)}
            </button>
            <Link href="/#pricing" className="landing-cta-pill landing-outline-btn">
              {t("nav.pricing")}
            </Link>
          </div>
        </ScrollReveal>
      </section>
      <Footer />
    </main>
  );
}
