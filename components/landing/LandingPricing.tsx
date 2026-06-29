"use client";

import { useState } from "react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import LandingPlansComparison from "@/components/landing/LandingPlansComparison";
import { useLanguage } from "@/components/providers/LanguageProvider";

type LandingPricingProps = {
  onSelectPlan: (planId?: string) => void;
};

export default function LandingPricing({ onSelectPlan }: LandingPricingProps) {
  const { t } = useLanguage();
  const [annual, setAnnual] = useState(false);

  const faqs = [
    { q: t("home.pricingFaq1Q"), a: t("home.pricingFaq1A") },
    { q: t("home.pricingFaq2Q"), a: t("home.pricingFaq2A") },
    { q: t("home.pricingFaq3Q"), a: t("home.pricingFaq3A") },
  ];

  return (
    <section id="pricing" className="landing-section py-20 sm:py-28 px-5 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-14">
          <div className="max-w-xl">
            <p className="landing-section-label">{t("home.pricingTitle")}</p>
            <h2 className="landing-display landing-ink mt-3 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight">
              {t("home.pricingHeadline")}
            </h2>
            <p className="mt-4 landing-ink-muted text-lg">{t("home.pricingSub")}</p>
          </div>
          <div className="landing-glass rounded-full p-1 flex shrink-0 self-stretch sm:self-start lg:self-auto w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={`flex-1 sm:flex-none rounded-full px-4 sm:px-5 py-2 text-xs sm:text-sm font-medium transition-all duration-300 ${
                !annual ? "landing-toggle-active shadow-sm" : "landing-toggle-inactive"
              }`}
            >
              {t("home.pricingMonthly")}
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={`flex-1 sm:flex-none rounded-full px-4 sm:px-5 py-2 text-xs sm:text-sm font-medium transition-all duration-300 ${
                annual ? "landing-toggle-active shadow-sm" : "landing-toggle-inactive"
              }`}
            >
              {t("home.pricingAnnual")}{" "}
              <span className="opacity-70">({t("home.pricingAnnualSave")})</span>
            </button>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.06}>
          <p className="landing-ink-faint text-xs uppercase tracking-widest mb-4">
            {t("dashboard.plansCompareHeading")}
          </p>
          <LandingPlansComparison annual={annual} t={t} onSelectPlan={onSelectPlan} />
        </ScrollReveal>

        <ScrollReveal delay={0.1} className="mt-20">
          <h3 className="landing-display landing-ink text-2xl font-semibold mb-6">{t("home.pricingFaqTitle")}</h3>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <details key={faq.q} className="landing-card group overflow-hidden">
                <summary className="landing-ink cursor-pointer px-6 py-4 text-sm font-medium list-none flex justify-between items-center">
                  {faq.q}
                  <span className="landing-ink-dim group-open:rotate-45 transition-transform duration-300 text-xl leading-none">
                    +
                  </span>
                </summary>
                <p className="px-6 pb-5 text-sm landing-ink-muted leading-relaxed -mt-1">{faq.a}</p>
              </details>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
