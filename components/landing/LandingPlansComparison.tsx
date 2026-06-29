"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { SUBSCRIPTION_LIMITS, SUBSCRIPTION_PLANS } from "@/lib/constants";

type PlanId = keyof typeof SUBSCRIPTION_LIMITS;

const PLAN_IDS: PlanId[] = ["free", "starter", "stable", "enterprise"];

type LandingPlansComparisonProps = {
  annual: boolean;
  t: (key: string, params?: Record<string, string>) => string;
  onSelectPlan: (planId?: string) => void;
};

function formatLimit(n: number, unlimitedLabel: string) {
  return n >= 9999 ? unlimitedLabel : String(n);
}

export default function LandingPlansComparison({
  annual,
  t,
  onSelectPlan,
}: LandingPlansComparisonProps) {
  const unlimited = t("dashboard.plansCompareUnlimited");

  const priceFor = (id: PlanId) => {
    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === id);
    if (!plan || plan.price == null) return t("home.priceContact");
    if (plan.price === 0) return t("home.priceFree");
    if (annual) {
      const monthly = Math.round(plan.price * 0.8 * 100) / 100;
      return `$${monthly.toFixed(2)}${t("home.pricePerMo")}`;
    }
    return `$${plan.price.toFixed(2)}${t("home.pricePerMo")}`;
  };

  const cellBool = (value: boolean) =>
    value ? (
      <span className="text-accent font-medium" aria-label={t("dashboard.plansCompareIncluded")}>
        ✓
      </span>
    ) : (
      <span className="landing-ink-dim" aria-label={t("dashboard.plansCompareNotIncluded")}>
        —
      </span>
    );

  const featureRows: {
    labelKey: string;
    render: (id: PlanId) => ReactNode;
  }[] = [
    {
      labelKey: "dashboard.plansCompareHorses",
      render: (id) => formatLimit(SUBSCRIPTION_LIMITS[id].horses, unlimited),
    },
    {
      labelKey: "dashboard.plansCompareRiders",
      render: (id) => formatLimit(SUBSCRIPTION_LIMITS[id].riders, unlimited),
    },
    {
      labelKey: "dashboard.plansCompareAnalytics",
      render: (id) => cellBool(SUBSCRIPTION_LIMITS[id].analytics),
    },
    {
      labelKey: "dashboard.plansCompareMatching",
      render: (id) => cellBool(SUBSCRIPTION_LIMITS[id].matching),
    },
    {
      labelKey: "dashboard.plansComparePriority",
      render: (id) => cellBool(id === "stable" || id === "enterprise"),
    },
    {
      labelKey: "dashboard.plansCompareDedicated",
      render: (id) => cellBool(id === "enterprise"),
    },
  ];

  return (
    <div
      className="landing-pricing-compare-scroll"
      tabIndex={0}
      role="region"
      aria-label={t("home.pricingScrollHint")}
    >
      <div className="landing-pricing-compare">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr>
            <th className="landing-pricing-compare-feature landing-ink-faint">
              {t("dashboard.plansCompareFeature")}
            </th>
            {PLAN_IDS.map((id) => {
              const isPopular = id === "starter";
              return (
                <th
                  key={id}
                  className={`landing-pricing-compare-plan ${isPopular ? "landing-pricing-compare-popular" : ""}`}
                >
                  {isPopular ? (
                    <span className="landing-pricing-compare-badge">{t("home.pricingMostPopular")}</span>
                  ) : null}
                  <div className="landing-display landing-ink text-lg font-semibold capitalize">
                    {t(`pricing.${id}.name`)}
                  </div>
                  <div className="landing-ink-muted text-sm mt-1 font-sans normal-case tracking-normal">
                    {priceFor(id)}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {featureRows.map((row) => (
            <tr key={row.labelKey}>
              <td className="landing-pricing-compare-feature landing-ink-subtle">{t(row.labelKey)}</td>
              {PLAN_IDS.map((id) => (
                <td
                  key={id}
                  className={`landing-pricing-compare-cell landing-ink ${
                    id === "starter" ? "landing-pricing-compare-popular" : ""
                  }`}
                >
                  {row.render(id)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td className="landing-pricing-compare-feature landing-ink-faint text-xs uppercase tracking-wider">
              {t("dashboard.plansCompareAction")}
            </td>
            {PLAN_IDS.map((id) => (
              <td
                key={id}
                className={`landing-pricing-compare-cell ${id === "starter" ? "landing-pricing-compare-popular" : ""}`}
              >
                {id === "enterprise" ? (
                  <Link
                    href="/contact?type=enterprise"
                    className="landing-pricing-compare-cta landing-pricing-compare-cta-outline"
                  >
                    {t("home.contactSales")}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSelectPlan(id === "free" ? undefined : id)}
                    className={`landing-pricing-compare-cta ${
                      id === "starter"
                        ? "landing-pricing-compare-cta-accent"
                        : "landing-pricing-compare-cta-solid"
                    }`}
                  >
                    {t("nav.startFree")}
                  </button>
                )}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
      </div>
    </div>
  );
}
