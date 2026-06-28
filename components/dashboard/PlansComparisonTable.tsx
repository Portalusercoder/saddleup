"use client";

import Link from "next/link";
import { SUBSCRIPTION_LIMITS, SUBSCRIPTION_PLANS } from "@/lib/constants";

type PlanId = keyof typeof SUBSCRIPTION_LIMITS;

type PlansComparisonTableProps = {
  currentTier: string;
  t: (key: string, params?: Record<string, string>) => string;
  onCheckout: (planId: string) => void;
  onChangePlan: (planId: string) => void;
  checkoutLoading: string | null;
  changePlanLoading: string | null;
};

const PLAN_IDS: PlanId[] = ["free", "starter", "stable", "enterprise"];

const TIER_RANK: Record<PlanId, number> = {
  free: 0,
  starter: 1,
  stable: 2,
  enterprise: 3,
};

function formatLimit(n: number, unlimitedLabel: string) {
  return n >= 9999 ? unlimitedLabel : String(n);
}

export default function PlansComparisonTable({
  currentTier,
  t,
  onCheckout,
  onChangePlan,
  checkoutLoading,
  changePlanLoading,
}: PlansComparisonTableProps) {
  const current = (currentTier in SUBSCRIPTION_LIMITS ? currentTier : "free") as PlanId;
  const unlimited = t("dashboard.plansCompareUnlimited");

  const priceFor = (id: PlanId) => {
    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === id);
    if (!plan || plan.price == null) return t("dashboard.plansCompareCustom");
    if (plan.price === 0) return t("dashboard.plansCompareFree");
    return t("dashboard.plansComparePrice", { amount: plan.price.toFixed(2) });
  };

  const cellBool = (value: boolean) =>
    value ? (
      <span className="text-accent font-medium" aria-label={t("dashboard.plansCompareIncluded")}>
        ✓
      </span>
    ) : (
      <span className="text-black/25 dark:text-white/25" aria-label={t("dashboard.plansCompareNotIncluded")}>
        —
      </span>
    );

  const actionFor = (id: PlanId) => {
    if (id === current) {
      return (
        <span className="text-xs uppercase tracking-wider text-accent font-medium">
          {t("dashboard.plansCompareCurrent")}
        </span>
      );
    }
    if (id === "enterprise") {
      return (
        <Link
          href="/contact?type=enterprise"
          className="text-xs uppercase tracking-wider text-black/70 hover:text-black underline dark:text-white/70 dark:hover:text-white"
        >
          {t("dashboard.plansCompareContact")}
        </Link>
      );
    }
    if (current === "free") {
      return (
        <button
          type="button"
          onClick={() => onCheckout(id)}
          disabled={!!checkoutLoading}
          className="text-xs uppercase tracking-wider text-black/70 hover:text-black underline disabled:opacity-50 dark:text-white/70 dark:hover:text-white"
        >
          {checkoutLoading === id ? t("dashboard.plansRedirecting") : t("dashboard.plansCompareUpgrade")}
        </button>
      );
    }
    if (TIER_RANK[id] > TIER_RANK[current]) {
      return (
        <button
          type="button"
          onClick={() => onChangePlan(id)}
          disabled={!!changePlanLoading}
          className="text-xs uppercase tracking-wider text-black/70 hover:text-black underline disabled:opacity-50 dark:text-white/70 dark:hover:text-white"
        >
          {changePlanLoading === id ? t("dashboard.plansChanging") : t("dashboard.plansCompareUpgrade")}
        </button>
      );
    }
    if (TIER_RANK[id] < TIER_RANK[current]) {
      return (
        <button
          type="button"
          onClick={() => onChangePlan(id)}
          disabled={!!changePlanLoading}
          className="text-xs uppercase tracking-wider text-black/50 hover:text-black underline disabled:opacity-50 dark:text-white/50 dark:hover:text-white"
        >
          {changePlanLoading === id ? t("dashboard.plansChanging") : t("dashboard.plansCompareDowngrade")}
        </button>
      );
    }
    return null;
  };

  const featureRows: {
    labelKey: string;
    render: (id: PlanId) => React.ReactNode;
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
    <div className="overflow-x-auto border border-black/10 dark:border-white/10" data-tour="plans-tiers">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-black/10 dark:border-white/10">
            <th className="text-left p-4 font-normal text-black/50 uppercase tracking-widest text-xs dark:text-white/50">
              {t("dashboard.plansCompareFeature")}
            </th>
            {PLAN_IDS.map((id) => (
              <th
                key={id}
                className={`p-4 text-left font-serif text-base capitalize ${
                  id === current
                    ? "bg-accent/10 text-black dark:text-white ring-1 ring-inset ring-accent/30"
                    : "text-black dark:text-white"
                }`}
              >
                <div>{t(`pricing.${id}.name`)}</div>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <div className="text-xs font-sans text-black/55 mt-1 normal-case tracking-normal dark:text-white/55">
                  {priceFor(id)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {featureRows.map((row) => (
            <tr key={row.labelKey} className="border-b border-black/5 dark:border-white/5">
              <td className="p-4 text-black/70 dark:text-white/70">{t(row.labelKey)}</td>
              {PLAN_IDS.map((id) => (
                <td
                  key={id}
                  className={`p-4 text-black dark:text-white ${
                    id === current ? "bg-accent/5" : ""
                  }`}
                >
                  {row.render(id)}
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <td className="p-4 text-black/50 text-xs uppercase tracking-wider dark:text-white/50">
              {t("dashboard.plansCompareAction")}
            </td>
            {PLAN_IDS.map((id) => (
              <td
                key={id}
                className={`p-4 ${id === current ? "bg-accent/5" : ""}`}
              >
                {actionFor(id)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
