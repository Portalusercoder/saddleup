"use client";

import { useEffect, useState } from "react";
import { useProfile } from "@/components/providers/ProfileProvider";
import PlansComparisonTable from "@/components/dashboard/PlansComparisonTable";
import PageLoader from "@/components/ui/PageLoader";
import GuidedTourOverlay, { type GuidedTourStep } from "@/components/dashboard/GuidedTourOverlay";
import { usePageTour } from "@/components/dashboard/usePageTour";
import { trackEvent } from "@/lib/analytics/mixpanel-client";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { SUBSCRIPTION_PLANS } from "@/lib/constants";

interface SubscriptionData {
  tier: string;
  status?: string;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
  limits?: { horses: number; riders: number };
  usage?: { horses: number; riders: number };
  canAddHorse: boolean;
  canAddRider: boolean;
  hasStripeCustomer: boolean;
}

export default function PlansPage() {
  const { profile, loading: profileLoading } = useProfile();
  const { t } = useLanguage();
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [changePlanLoading, setChangePlanLoading] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/subscription")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const isOwner = profile?.role === "owner";
  const hasUsage = data && data.limits && data.usage;
  const { open: showTour, complete: completeTour } = usePageTour(
    "saddleup_tour_plans_v1",
    !loading && Boolean(profile) && profile?.role === "owner" && Boolean(hasUsage)
  );

  const handleCheckout = async (planId: string) => {
    setCheckoutLoading(planId);
    setError(null);
    trackEvent("plan_checkout_clicked", { plan_id: planId });
    try {
      const res = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const { url } = await res.json();
      if (!res.ok) throw new Error("Failed");
      trackEvent("plan_checkout_redirected", { plan_id: planId });
      if (url) window.location.href = url;
    } catch {
      trackEvent("plan_checkout_failed", { plan_id: planId });
      setError(t("dashboard.plansCheckoutFailed"));
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    trackEvent("billing_portal_open_clicked");
    try {
      const res = await fetch("/api/subscription/portal", { method: "POST" });
      const { url } = await res.json();
      if (!res.ok) throw new Error("Failed");
      trackEvent("billing_portal_redirected");
      if (url) window.location.href = url;
    } finally {
      setPortalLoading(false);
    }
  };

  const handleChangePlan = async (planId: string) => {
    setError(null);
    setChangePlanLoading(planId);
    trackEvent("plan_change_clicked", { to_plan: planId });
    try {
      const res = await fetch("/api/subscription/change-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const j = await res.json();
      if (!res.ok) {
        trackEvent("plan_change_failed", { to_plan: planId });
        setError(j.error || t("dashboard.plansChangeFailed"));
        return;
      }
      trackEvent("plan_change_succeeded", { to_plan: planId });
      window.location.reload();
    } catch {
      trackEvent("plan_change_failed", { to_plan: planId });
      setError(t("dashboard.plansChangeFailed"));
    } finally {
      setChangePlanLoading(null);
    }
  };

  const handleCancelPlan = async () => {
    setError(null);
    setCancelLoading(true);
    trackEvent("plan_cancel_clicked");
    try {
      const res = await fetch("/api/subscription/cancel", { method: "POST" });
      if (!res.ok) {
        const j = await res.json();
        trackEvent("plan_cancel_failed");
        setError(j.error || t("dashboard.plansCancelFailed"));
        return;
      }
      trackEvent("plan_cancel_succeeded");
      window.location.reload();
    } catch {
      trackEvent("plan_cancel_failed");
      setError(t("dashboard.plansCancelFailed"));
    } finally {
      setCancelLoading(false);
    }
  };

  const daysLeft = data?.currentPeriodEnd && data.cancelAtPeriodEnd
    ? Math.max(0, Math.ceil((new Date(data.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  if (profileLoading || !profile) {
    return <PageLoader minHeight="min-h-[40vh]" message={t("common.loading")} />;
  }

  if (!isOwner) {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-3xl md:text-4xl font-normal text-black">{t("dashboard.plansTitle")}</h1>
        <p className="text-black/60">{t("dashboard.plansOwnerOnly")}</p>
      </div>
    );
  }

  if (loading || !hasUsage) {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-3xl md:text-4xl font-normal text-black">{t("dashboard.plansTitle")}</h1>
        {loading ? (
          <PageLoader minHeight="min-h-[30vh]" message={t("common.loading")} />
        ) : (
          <p className="text-black/50">{t("dashboard.plansLoadFailed")}</p>
        )}
      </div>
    );
  }

  const tourSteps: GuidedTourStep[] = [
    {
      id: "current",
      title: t("dashboard.plansTourCurrentTitle"),
      description: t("dashboard.plansTourCurrentDesc"),
      selector: '[data-tour="plans-current"]',
    },
    {
      id: "manage",
      title: t("dashboard.plansTourManageTitle"),
      description: t("dashboard.plansTourManageDesc"),
      selector: '[data-tour="plans-manage"]',
    },
    {
      id: "tiers",
      title: t("dashboard.plansTourTiersTitle"),
      description: t("dashboard.plansTourTiersDesc"),
      selector: '[data-tour="plans-tiers"]',
    },
  ];

  const planMeta = SUBSCRIPTION_PLANS.find((p) => p.id === data.tier);
  const billingDate =
    data.currentPeriodEnd && data.tier !== "free"
      ? new Date(data.currentPeriodEnd).toLocaleDateString(undefined, {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : null;

  return (
    <div className="space-y-10">
      <GuidedTourOverlay
        open={showTour}
        steps={tourSteps}
        onSkip={completeTour}
        onComplete={completeTour}
      />
      <div>
        <h1 className="font-serif text-3xl md:text-4xl font-normal text-black">{t("dashboard.plansTitle")}</h1>
        <p className="text-black/60 mt-2 text-sm">{t("dashboard.plansSubtitle")}</p>
      </div>

      {/* Current plan */}
      <div className="border border-black/10 p-6" data-tour="plans-current">
        <h2 className="font-serif text-lg text-black mb-4">{t("dashboard.plansCurrentHeading")}</h2>
        <p className="font-medium text-black capitalize">
          {data.tier} {t("dashboard.plansTierSuffix")}
        </p>
        <p className="text-sm text-black/60 mt-1 dark:text-white/60">
          {t("dashboard.plansUsageLine", {
            horsesUsed: String(data.usage?.horses ?? 0),
            horsesLimit: String(data.limits?.horses ?? 0),
            ridersUsed: String(data.usage?.riders ?? 0),
            ridersLimit: String(data.limits?.riders ?? 0),
          })}
        </p>
        {planMeta && planMeta.price != null && planMeta.price > 0 && (
          <p className="text-sm text-black/60 mt-2 dark:text-white/60">
            {t("dashboard.plansBillingAmount", { amount: planMeta.price.toFixed(2) })}
          </p>
        )}
        {billingDate && (
          <p className="text-sm text-black/60 mt-1 dark:text-white/60">
            {data.cancelAtPeriodEnd
              ? t("dashboard.plansBillingEnds", { date: billingDate })
              : t("dashboard.plansBillingRenews", { date: billingDate })}
          </p>
        )}
        {data.cancelAtPeriodEnd && daysLeft !== null && (
          <p className="mt-3 text-amber-800 text-sm">
            {daysLeft === 1
              ? t("dashboard.plansCancelledOne", { days: String(daysLeft) })
              : t("dashboard.plansCancelledMany", { days: String(daysLeft) })}
          </p>
        )}
        {error && <p className="mt-2 text-amber-700 text-sm">{error}</p>}
      </div>

      {/* Upgrade & Cancel */}
      {isOwner && (
        <div className="border border-black/10 p-6 space-y-4 dark:border-white/10" data-tour="plans-manage">
          <h2 className="font-serif text-lg text-black dark:text-white mb-2">
            {t("dashboard.plansUpgradeHeading")}
          </h2>
          <p className="text-sm text-black/55 dark:text-white/55">
            {t("dashboard.plansManageLead")}
          </p>
          {data.hasStripeCustomer && (
            <button
              type="button"
              onClick={handlePortal}
              disabled={portalLoading}
              className="px-4 py-2.5 border border-black/10 text-black text-sm uppercase tracking-wider hover:bg-black/5 transition disabled:opacity-50 dark:border-white/15 dark:text-white dark:hover:bg-white/5"
            >
              {portalLoading ? t("dashboard.plansPortalOpening") : t("dashboard.plansPortalCta")}
            </button>
          )}
          {(data.tier === "starter" || data.tier === "stable") && !data.cancelAtPeriodEnd && (
            <button
              type="button"
              onClick={handleCancelPlan}
              disabled={cancelLoading}
              className="px-4 py-2.5 border border-black/30 text-black text-sm uppercase tracking-wider hover:bg-black/5 transition disabled:opacity-50 dark:border-white/25 dark:text-white"
            >
              {cancelLoading ? t("dashboard.plansCancelling") : t("dashboard.plansCancelCta")}
            </button>
          )}
        </div>
      )}

      <div>
        <h2 className="font-serif text-lg text-black dark:text-white mb-4">
          {t("dashboard.plansCompareHeading")}
        </h2>
        <PlansComparisonTable
          currentTier={data.tier}
          t={t}
          onCheckout={handleCheckout}
          onChangePlan={handleChangePlan}
          checkoutLoading={checkoutLoading}
          changePlanLoading={changePlanLoading}
        />
      </div>
    </div>
  );
}
