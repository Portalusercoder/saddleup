"use client";

import ScrollReveal from "@/components/ui/ScrollReveal";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function LandingTestimonial() {
  const { t } = useLanguage();

  return (
    <section className="landing-section landing-testimonial-v2">
      <ScrollReveal className="max-w-4xl mx-auto">
        <p className="landing-section-eyebrow !mb-8">{t("home.testimonialLabel")}</p>
        <blockquote className="landing-testimonial-quote">
          &ldquo;{t("home.testimonialQuote")}&rdquo;
        </blockquote>
        <footer className="mt-10 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
          <p className="font-medium text-[var(--landing-ink)]">{t("home.testimonialName")}</p>
          <p className="text-sm text-[var(--landing-ink-muted)]">{t("home.testimonialRole")}</p>
        </footer>
      </ScrollReveal>
    </section>
  );
}
