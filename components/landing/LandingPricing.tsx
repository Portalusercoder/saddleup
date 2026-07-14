"use client";

import { useState } from "react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import LandingSectionHeader from "@/components/landing/LandingSectionHeader";
import LandingPlansComparison from "@/components/landing/LandingPlansComparison";
import LandingPricingFaq from "@/components/landing/LandingPricingFaq";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function LandingPricing() {
  const { t } = useLanguage();
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="landing-section">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 landing-section-header">
          <LandingSectionHeader
            eyebrow={t("home.pricingTitle")}
            title={t("home.pricingHeadline")}
            description={t("home.pricingSub")}
            className="!mb-0 max-w-xl"
          />
          <div className="landing-billing-toggle flex shrink-0 self-stretch sm:self-start lg:self-auto w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={`flex-1 sm:flex-none rounded-control px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-medium transition-all duration-300 min-h-[44px] su-focus-ring ${
                !annual ? "landing-toggle-active" : "landing-toggle-inactive"
              }`}
            >
              {t("home.pricingMonthly")}
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={`flex-1 sm:flex-none rounded-control px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-medium transition-all duration-300 min-h-[44px] su-focus-ring ${
                annual ? "landing-toggle-active" : "landing-toggle-inactive"
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
          <LandingPlansComparison annual={annual} t={t} />
        </ScrollReveal>

        <LandingPricingFaq />
      </div>
    </section>
  );
}
