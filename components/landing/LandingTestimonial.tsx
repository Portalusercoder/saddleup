"use client";

import ScrollReveal from "@/components/ui/ScrollReveal";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function LandingTestimonial() {
  const { t } = useLanguage();

  return (
    <section className="py-24 sm:py-32 px-6 bg-[#1d1d1f] text-white">
      <ScrollReveal className="max-w-4xl mx-auto text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-8">
          {t("home.testimonialLabel")}
        </p>
        <blockquote className="landing-display text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] font-semibold leading-snug tracking-tight text-white/95">
          &ldquo;{t("home.testimonialQuote")}&rdquo;
        </blockquote>
        <footer className="mt-10 flex flex-col items-center gap-1">
          <div
            className="h-11 w-11 rounded-full bg-white/10 flex items-center justify-center text-white/50 text-sm font-medium"
            aria-hidden
          >
            {t("home.testimonialName").charAt(0)}
          </div>
          <p className="text-sm font-medium text-white/90 mt-3">{t("home.testimonialName")}</p>
          <p className="text-xs text-white/45">{t("home.testimonialRole")}</p>
        </footer>
      </ScrollReveal>
    </section>
  );
}
