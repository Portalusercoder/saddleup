"use client";

import Link from "next/link";
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
    <main className="landing-page min-h-screen landing-premium pt-20">
      <section className="max-w-3xl mx-auto px-6 py-20 sm:py-28 text-center">
        <ScrollReveal>
          <p className="landing-section-label mb-4">Saddle Up</p>
          <h1 className="landing-display landing-ink text-4xl md:text-5xl font-semibold tracking-tight">
            {t(titleKey)}
          </h1>
          <p className="mt-5 text-lg landing-ink-subtle">{t(subtitleKey)}</p>
          <p className="mt-6 landing-ink-muted leading-relaxed max-w-2xl mx-auto">{t(bodyKey)}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
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
