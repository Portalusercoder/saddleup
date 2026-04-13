"use client";

import { useEffect, useState } from "react";
import PixelCard from "@/components/ui/PixelCard";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface SubscriptionData {
  tier: string;
  limits?: { horses: number; riders: number };
  usage?: { horses: number; riders: number };
  canAddHorse: boolean;
  canAddRider: boolean;
  hasStripeCustomer: boolean;
}

export default function SubscriptionBilling() {
  const { t } = useLanguage();
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [changePlanLoading, setChangePlanLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [changePlanError, setChangePlanError] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/subscription")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));

    fetch("/api/stable")
      .then((r) => r.json())
      .then((d) => setRole(d.role))
      .catch(() => setRole(null));
  }, []);

  const handleCheckout = async (planId: string) => {
    setCheckoutLoading(planId);
    try {
      const res = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const { url } = await res.json();
      if (!res.ok) throw new Error("Failed");
      if (url) window.location.href = url;
    } catch {
      setCheckoutLoading(null);
    }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/subscription/portal", {
        method: "POST",
      });
      const { url } = await res.json();
      if (!res.ok) throw new Error("Failed");
      if (url) window.location.href = url;
    } finally {
      setPortalLoading(false);
    }
  };

  const handleChangePlan = async (planId: string) => {
    setChangePlanError(null);
    setChangePlanLoading(planId);
    try {
      const res = await fetch("/api/subscription/change-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setChangePlanError(data.error || t("dashboard.billingChangePlanFailed"));
        return;
      }
      window.location.reload();
    } catch {
      setChangePlanError(t("dashboard.billingChangePlanFailed"));
    } finally {
      setChangePlanLoading(null);
    }
  };

  const isOwner = role === "owner";

  const btnPrimary = "px-4 py-2.5 bg-accent text-black font-medium text-sm uppercase tracking-wider hover:opacity-95 transition disabled:opacity-50";
  const btnSecondary = "px-4 py-2.5 border border-black/10 text-black text-sm uppercase tracking-wider hover:border-black/30 transition disabled:opacity-50";

  const hasUsage = data && data.limits && data.usage;

  if (loading || !hasUsage) {
    return (
      <div className="border border-black/10 p-6">
        <h2 className="font-serif text-lg text-black mb-4">Billing & Plan</h2>
        {loading ? (
          <div className="flex flex-col gap-3 py-6 max-w-md">
            <div className="skeleton h-3 w-2/3" />
            <div className="skeleton h-12 w-full rounded-md" />
            <div className="skeleton h-3 w-1/2" />
            <p className="text-xs uppercase tracking-[0.28em] text-black/45 pt-2">
              {t("common.loading")}
            </p>
          </div>
        ) : (
          <p className="text-black/50">{t("dashboard.billingLoadFailed")}</p>
        )}
      </div>
    );
  }

  return (
    <div className="border border-black/10 p-6">
      <h2 className="font-serif text-lg text-black mb-4">{t("dashboard.settingsTitle")}</h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-black capitalize">
              {t("dashboard.billingTierPlan", { tier: data.tier })}
            </p>
            <p className="text-sm text-black/60 mt-1">
              {t("dashboard.billingUsageLine", {
                horsesUsed: String(data.usage?.horses ?? 0),
                horsesLimit: String(data.limits?.horses ?? 0),
                ridersUsed: String(data.usage?.riders ?? 0),
                ridersLimit: String(data.limits?.riders ?? 0),
              })}
            </p>
          </div>
          {data.tier !== "free" && (
            <div className="h-2 flex-1 max-w-[120px] mx-4 border border-black/10 overflow-hidden">
              <div
                className="h-full bg-white"
                style={{
                  width: `${Math.min(
                    100,
                    (() => {
                      const u = data.usage;
                      const l = data.limits;
                      if (!u || !l) return 0;
                      const totalLimit = l.horses + l.riders;
                      if (totalLimit === 0) return 0;
                      return ((u.horses + u.riders) / totalLimit) * 100;
                    })()
                  )}%`,
                }}
              />
            </div>
          )}
        </div>

        {!data.canAddHorse && (
          <p className="text-black/80 text-sm">
            {t("dashboard.billingHorseLimitReached")}
          </p>
        )}
        {!data.canAddRider && (
          <p className="text-black/80 text-sm">
            {t("dashboard.billingRiderLimitReached")}
          </p>
        )}

        {changePlanError && (
          <p className="text-amber-400 text-sm">{changePlanError}</p>
        )}

        {isOwner && (
          <div className="flex flex-wrap gap-2 pt-2">
            {data.hasStripeCustomer && (
              <button
                onClick={handlePortal}
                disabled={portalLoading}
                className={btnSecondary}
              >
                {portalLoading ? t("dashboard.billingOpening") : t("dashboard.billingManage")}
              </button>
            )}

            {data.tier === "free" && (
              <>
                <button
                  onClick={() => handleCheckout("starter")}
                  disabled={!!checkoutLoading}
                  className={btnPrimary}
                >
                  {checkoutLoading === "starter"
                    ? t("dashboard.billingRedirecting")
                    : t("dashboard.billingUpgradeStarter")}
                </button>
                <button
                  onClick={() => handleCheckout("stable")}
                  disabled={!!checkoutLoading}
                  className={btnSecondary}
                >
                  {checkoutLoading === "stable"
                    ? t("dashboard.billingRedirecting")
                    : t("dashboard.billingUpgradeStable")}
                </button>
              </>
            )}

            {data.tier === "starter" && (
              <button
                onClick={() => handleChangePlan("stable")}
                disabled={!!changePlanLoading}
                className={btnPrimary}
              >
                {changePlanLoading === "stable"
                  ? t("dashboard.billingChanging")
                  : t("dashboard.billingChangeToStable")}
              </button>
            )}

            {data.tier === "stable" && (
              <button
                onClick={() => handleChangePlan("starter")}
                disabled={!!changePlanLoading}
                className={btnSecondary}
              >
                {changePlanLoading === "starter"
                  ? t("dashboard.billingChanging")
                  : t("dashboard.billingChangeToStarter")}
              </button>
            )}
          </div>
        )}

        {!isOwner && (
          <p className="text-sm text-black/60">
            {t("dashboard.billingOwnerOnly")}
          </p>
        )}
      </div>

      {isOwner && (
        <div className="mt-6 pt-6 border-t border-black/10">
          <h3 className="text-sm font-medium text-black mb-3 uppercase tracking-wider">
            {t("dashboard.plansTitle")}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <PixelCard
              variant="white"
              className={`!min-h-[140px] ${data.tier === "starter" ? "border-black/30" : ""}`}
            >
              <div className="absolute inset-0 p-4 z-10 flex flex-col">
                <p className="font-medium text-black">{t("dashboard.billingStarterPrice")}</p>
                <p className="text-sm text-black/60 mt-1">{t("dashboard.billingStarterFeatures")}</p>
                {data.tier === "free" && (
                  <button
                    onClick={() => handleCheckout("starter")}
                    disabled={!!checkoutLoading}
                    className="mt-3 text-sm text-black/80 hover:text-black underline disabled:opacity-50 text-left"
                  >
                    {t("dashboard.billingUpgradeStarterShort")}
                  </button>
                )}
                {data.tier === "stable" && (
                  <button
                    onClick={() => handleChangePlan("starter")}
                    disabled={!!changePlanLoading}
                    className="mt-3 text-sm text-black/80 hover:text-black underline disabled:opacity-50 text-left"
                  >
                    {t("dashboard.billingChangeToStarterShort")}
                  </button>
                )}
              </div>
            </PixelCard>
            <PixelCard
              variant="white"
              className={`!min-h-[140px] ${data.tier === "stable" ? "border-black/30" : ""}`}
            >
              <div className="absolute inset-0 p-4 z-10 flex flex-col">
                <p className="font-medium text-black">{t("dashboard.billingStablePrice")}</p>
                <p className="text-sm text-black/60 mt-1">{t("dashboard.billingStableFeatures")}</p>
                {data.tier === "free" && (
                  <button
                    onClick={() => handleCheckout("stable")}
                    disabled={!!checkoutLoading}
                    className="mt-3 text-sm text-black/80 hover:text-black underline disabled:opacity-50 text-left"
                  >
                    {t("dashboard.billingUpgradeStableShort")}
                  </button>
                )}
                {data.tier === "starter" && (
                  <button
                    onClick={() => handleChangePlan("stable")}
                    disabled={!!changePlanLoading}
                    className="mt-3 text-sm text-black/80 hover:text-black underline disabled:opacity-50 text-left"
                  >
                    {t("dashboard.billingChangeToStableShort")}
                  </button>
                )}
              </div>
            </PixelCard>
          </div>
        </div>
      )}
    </div>
  );
}
