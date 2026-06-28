"use client";

import { useState } from "react";
import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { SUBSCRIPTION_LIMITS, SUBSCRIPTION_PLANS } from "@/lib/constants";

type PlanId = keyof typeof SUBSCRIPTION_LIMITS;

const PLAN_IDS: PlanId[] = ["free", "starter", "stable", "enterprise"];

type LandingPricingProps = {
  onSelectPlan: (planId?: string) => void;
};

export default function LandingPricing({ onSelectPlan }: LandingPricingProps) {
  const { t } = useLanguage();
  const [annual, setAnnual] = useState(false);

  const priceFor = (id: PlanId) => {
    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === id);
    if (!plan || plan.price == null) return t("home.priceContact");
    if (plan.price === 0) return t("home.priceFree");
    if (annual) {
      const yearly = Math.round(plan.price * 12 * 0.8 * 100) / 100;
      return `$${yearly.toFixed(0)}${t("home.pricePerYr")}`;
    }
    return `$${plan.price.toFixed(2)}${t("home.pricePerMo")}`;
  };

  const formatLimit = (n: number) => (n >= 9999 ? t("dashboard.plansCompareUnlimited") : String(n));

  const highlights = (id: PlanId): string[] => {
    const limits = SUBSCRIPTION_LIMITS[id];
    const items = [
      `${formatLimit(limits.horses)} ${t("dashboard.plansCompareHorses").toLowerCase()}`,
      `${formatLimit(limits.riders)} ${t("dashboard.plansCompareRiders").toLowerCase()}`,
    ];
    if (limits.analytics) items.push(t("dashboard.plansCompareAnalytics"));
    if (limits.matching) items.push(t("dashboard.plansCompareMatching"));
    if (id === "stable" || id === "enterprise") items.push(t("dashboard.plansComparePriority"));
    if (id === "enterprise") items.push(t("dashboard.plansCompareDedicated"));
    return items;
  };

  const faqs = [
    { q: t("home.pricingFaq1Q"), a: t("home.pricingFaq1A") },
    { q: t("home.pricingFaq2Q"), a: t("home.pricingFaq2A") },
    { q: t("home.pricingFaq3Q"), a: t("home.pricingFaq3A") },
  ];

  return (
    <section id="pricing" className="py-24 sm:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-14">
          <div className="max-w-xl">
            <p className="landing-section-label">{t("home.pricingTitle")}</p>
            <h2 className="landing-display mt-3 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#1d1d1f]">
              {t("home.pricingHeadline")}
            </h2>
            <p className="mt-4 text-[#1d1d1f]/55 text-lg">{t("home.pricingSub")}</p>
          </div>
          <div className="landing-glass rounded-full p-1 flex shrink-0 self-stretch sm:self-start lg:self-auto w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={`flex-1 sm:flex-none rounded-full px-4 sm:px-5 py-2 text-xs sm:text-sm font-medium transition-all duration-300 ${
                !annual ? "bg-[#1d1d1f] text-white shadow-sm" : "text-[#1d1d1f]/55 hover:text-[#1d1d1f]"
              }`}
            >
              {t("home.pricingMonthly")}
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={`flex-1 sm:flex-none rounded-full px-4 sm:px-5 py-2 text-xs sm:text-sm font-medium transition-all duration-300 ${
                annual ? "bg-[#1d1d1f] text-white shadow-sm" : "text-[#1d1d1f]/55 hover:text-[#1d1d1f]"
              }`}
            >
              {t("home.pricingAnnual")}{" "}
              <span className="opacity-70">({t("home.pricingAnnualSave")})</span>
            </button>
          </div>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {PLAN_IDS.map((id, i) => {
            const isPopular = id === "starter";
            return (
              <ScrollReveal key={id} delay={0.05 + i * 0.06}>
                <div
                  className={`landing-card p-6 sm:p-7 h-full flex flex-col relative ${
                    isPopular ? "ring-2 ring-accent/25 shadow-lg" : ""
                  }`}
                >
                  {isPopular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-[0.65rem] font-semibold uppercase tracking-wider px-3 py-1 rounded-full">
                      {t("home.pricingMostPopular")}
                    </span>
                  )}
                  <p className="text-sm font-medium text-[#1d1d1f]/50">{t(`pricing.${id}.name`)}</p>
                  <p className="landing-display mt-2 text-3xl font-semibold text-[#1d1d1f]">{priceFor(id)}</p>
                  <ul className="mt-6 space-y-2.5 flex-1">
                    {highlights(id).map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-[#1d1d1f]/65">
                        <span className="text-accent mt-0.5 shrink-0" aria-hidden>
                          ✓
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  {id === "enterprise" ? (
                    <Link
                      href="/contact?type=enterprise"
                      className="mt-6 block w-full py-3 text-center rounded-full border border-[#1d1d1f]/15 text-sm font-medium text-[#1d1d1f] hover:bg-[#1d1d1f]/5 transition"
                    >
                      {t("home.contactSales")}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSelectPlan(id === "free" ? undefined : id)}
                      className={`mt-6 w-full py-3 rounded-full text-sm font-medium transition ${
                        isPopular
                          ? "bg-accent text-white hover:opacity-95"
                          : "bg-[#1d1d1f] text-white hover:bg-[#1d1d1f]/90"
                      }`}
                    >
                      {t("nav.startFree")}
                    </button>
                  )}
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal delay={0.1} className="mt-20">
          <h3 className="landing-display text-2xl font-semibold text-[#1d1d1f] mb-6">{t("home.pricingFaqTitle")}</h3>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <details key={faq.q} className="landing-card group overflow-hidden">
                <summary className="cursor-pointer px-6 py-4 text-sm font-medium text-[#1d1d1f] list-none flex justify-between items-center">
                  {faq.q}
                  <span className="text-[#1d1d1f]/30 group-open:rotate-45 transition-transform duration-300 text-xl leading-none">
                    +
                  </span>
                </summary>
                <p className="px-6 pb-5 text-sm text-[#1d1d1f]/55 leading-relaxed -mt-1">{faq.a}</p>
              </details>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
