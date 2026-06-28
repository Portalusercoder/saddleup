"use client";

import ScrollReveal from "@/components/ui/ScrollReveal";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function LandingTestimonial() {
  const { t } = useLanguage();

  return (
    <section className="bg-base text-black py-16 sm:py-24 px-4 sm:px-6 border-t border-black/10">
      <ScrollReveal className="max-w-3xl mx-auto text-center">
        <blockquote className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal leading-snug text-black/90">
          &ldquo;{t("home.testimonialQuote")}&rdquo;
        </blockquote>
        <footer className="mt-8 flex flex-col items-center gap-1">
          <div className="h-12 w-12 rounded-full bg-black/[0.06] border border-black/10 flex items-center justify-center text-black/40 font-serif text-lg" aria-hidden>
            {t("home.testimonialName").charAt(0)}
          </div>
          <p className="text-sm font-medium text-black mt-2">{t("home.testimonialName")}</p>
          <p className="text-xs text-black/50">{t("home.testimonialRole")}</p>
        </footer>
      </ScrollReveal>
    </section>
  );
}
