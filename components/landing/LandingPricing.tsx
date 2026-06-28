"use client";

import { useState, type ReactNode } from "react";
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

  const rows: { label: string; render: (id: PlanId) => ReactNode }[] = [
    { label: t("dashboard.plansCompareHorses"), render: (id) => formatLimit(SUBSCRIPTION_LIMITS[id].horses) },
    { label: t("dashboard.plansCompareRiders"), render: (id) => formatLimit(SUBSCRIPTION_LIMITS[id].riders) },
    {
      label: t("dashboard.plansCompareAnalytics"),
      render: (id) => (SUBSCRIPTION_LIMITS[id].analytics ? "✓" : "—"),
    },
    {
      label: t("dashboard.plansCompareMatching"),
      render: (id) => (SUBSCRIPTION_LIMITS[id].matching ? "✓" : "—"),
    },
    {
      label: t("dashboard.plansComparePriority"),
      render: (id) => (id === "stable" || id === "enterprise" ? "✓" : "—"),
    },
    {
      label: t("dashboard.plansCompareDedicated"),
      render: (id) => (id === "enterprise" ? "✓" : "—"),
    },
  ];

  const faqs = [
    { q: t("home.pricingFaq1Q"), a: t("home.pricingFaq1A") },
    { q: t("home.pricingFaq2Q"), a: t("home.pricingFaq2A") },
    { q: t("home.pricingFaq3Q"), a: t("home.pricingFaq3A") },
  ];

  return (
    <section id="pricing" className="bg-base text-black py-12 sm:py-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-normal mb-2">{t("home.pricingTitle")}</h2>
              <p className="text-black/60 max-w-xl">{t("home.pricingSub")}</p>
            </div>
            <div className="flex items-center gap-2 border border-black/15 p-1 shrink-0">
              <button
                type="button"
                onClick={() => setAnnual(false)}
                className={`px-3 py-1.5 text-xs uppercase tracking-wider transition ${
                  !annual ? "bg-accent text-white" : "text-black/60 hover:text-black"
                }`}
              >
                {t("home.pricingMonthly")}
              </button>
              <button
                type="button"
                onClick={() => setAnnual(true)}
                className={`px-3 py-1.5 text-xs uppercase tracking-wider transition ${
                  annual ? "bg-accent text-white" : "text-black/60 hover:text-black"
                }`}
              >
                {t("home.pricingAnnual")}{" "}
                <span className="opacity-80">({t("home.pricingAnnualSave")})</span>
              </button>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.05}>
          <div className="overflow-x-auto border border-black/10">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-black/10">
                  <th className="text-start p-4 font-normal text-black/50 text-xs uppercase tracking-widest">
                    {t("dashboard.plansCompareFeature")}
                  </th>
                  {PLAN_IDS.map((id) => (
                    <th
                      key={id}
                      className={`p-4 text-start font-serif text-base relative ${
                        id === "starter" ? "bg-accent/[0.06] ring-1 ring-inset ring-accent/20" : ""
                      }`}
                    >
                      {id === "starter" && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-accent text-white text-[0.6rem] uppercase tracking-wider px-2 py-0.5 whitespace-nowrap">
                          {t("home.pricingMostPopular")}
                        </span>
                      )}
                      <div>{t(`pricing.${id}.name`)}</div>
                      <div className="text-xs font-sans text-black/55 mt-1">{priceFor(id)}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-b border-black/5">
                    <td className="p-4 text-black/70">{row.label}</td>
                    {PLAN_IDS.map((id) => (
                      <td
                        key={id}
                        className={`p-4 ${id === "starter" ? "bg-accent/[0.03]" : ""}`}
                      >
                        {row.render(id)}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="p-4" />
                  {PLAN_IDS.map((id) => (
                    <td key={id} className={`p-4 ${id === "starter" ? "bg-accent/[0.03]" : ""}`}>
                      {id === "enterprise" ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-black/[0.06] border border-black/10 shrink-0" aria-hidden />
                            <div>
                              <p className="text-sm font-medium text-black">{t("home.enterpriseContactName")}</p>
                              <p className="text-xs text-black/50">{t("home.enterpriseContactRole")}</p>
                            </div>
                          </div>
                          <Link
                            href="/contact?type=enterprise"
                            className="block w-full py-2 text-center border border-black/20 hover:bg-black/5 text-sm transition"
                          >
                            {t("home.contactSales")}
                          </Link>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onSelectPlan(id === "free" ? undefined : id)}
                          className={`w-full py-2.5 text-sm font-medium transition ${
                            id === "starter"
                              ? "bg-accent text-white hover:opacity-95"
                              : id === "free"
                                ? "border border-black/20 hover:bg-black/5 text-black"
                                : "border border-black/20 hover:bg-black/5 text-black"
                          }`}
                        >
                          {t("nav.startFree")}
                        </button>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1} className="mt-14">
          <h3 className="font-serif text-xl mb-6">{t("home.pricingFaqTitle")}</h3>
          <div className="space-y-4 max-w-2xl">
            {faqs.map((faq) => (
              <details key={faq.q} className="border border-black/10 group">
                <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-black list-none flex justify-between items-center">
                  {faq.q}
                  <span className="text-black/40 group-open:rotate-45 transition-transform text-lg leading-none">+</span>
                </summary>
                <p className="px-4 pb-4 text-sm text-black/60 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
