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
    <main className="min-h-screen landing-surface bg-base text-black pt-20">
      <section className="max-w-3xl mx-auto px-6 py-16 sm:py-24 text-center">
        <ScrollReveal>
          <p className="text-xs uppercase tracking-[0.2em] text-black/45 mb-4">Saddle Up</p>
          <h1 className="font-serif text-4xl md:text-5xl font-normal">{t(titleKey)}</h1>
          <p className="mt-4 text-lg text-black/70">{t(subtitleKey)}</p>
          <p className="mt-6 text-black/60 leading-relaxed">{t(bodyKey)}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button
              type="button"
              onClick={onStartFree}
              className="px-6 py-3 bg-accent text-white font-medium hover:opacity-95 transition text-sm"
            >
              {t(ctaKey)}
            </button>
            <Link
              href="/#pricing"
              className="px-6 py-3 border border-black/20 hover:bg-black/5 transition text-sm"
            >
              {t("nav.pricing")}
            </Link>
          </div>
        </ScrollReveal>
      </section>
      <Footer onGetStarted={onStartFree} />
    </main>
  );
}
