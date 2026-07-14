"use client";

import ScrollReveal from "@/components/ui/ScrollReveal";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function LandingTestimonial() {
  const { t } = useLanguage();

  return (
    <section className="landing-section bg-[#0c100e] text-white landing-section-header--on-dark">
      <ScrollReveal className="max-w-4xl mx-auto text-center">
        <p className="landing-section-eyebrow text-center w-full !mb-8">
          {t("home.testimonialLabel")}
        </p>
        <blockquote className="landing-display landing-section-title-size text-white/95 text-balance font-serif">
          &ldquo;{t("home.testimonialQuote")}&rdquo;
        </blockquote>
        <footer className="mt-10 flex flex-col items-center gap-1">
          <div
            className="h-11 w-11 rounded-full bg-[#1f4d3a]/40 flex items-center justify-center text-[#8fae98] text-sm font-medium"
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
