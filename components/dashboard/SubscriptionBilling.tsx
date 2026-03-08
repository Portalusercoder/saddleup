"use client";

import { useEffect, useState } from "react";
import PixelCard from "@/components/ui/PixelCard";

interface SubscriptionData {
  tier: string;
  limits?: { horses: number; riders: number };
  usage?: { horses: number; riders: number };
  canAddHorse: boolean;
  canAddRider: boolean;
  hasStripeCustomer: boolean;
}

export default function SubscriptionBilling() {
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
        setChangePlanError(data.error || "Failed to change plan");
        return;
      }
      window.location.reload();
    } catch {
      setChangePlanError("Failed to change plan");
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
        <p className="text-black/50">
          {loading ? "Loading..." : "Could not load subscription details."}
        </p>
      </div>
    );
  }

  return (
    <div className="border border-black/10 p-6">
      <h2 className="font-serif text-lg text-black mb-4">Billing & Plan</h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-black capitalize">{data.tier} Plan</p>
            <p className="text-sm text-black/60 mt-1">
              {data.usage?.horses ?? 0} / {data.limits?.horses ?? 0} horses • {data.usage?.riders ?? 0} / {data.limits?.riders ?? 0} riders
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
            Horse limit reached. Upgrade to add more.
          </p>
        )}
        {!data.canAddRider && (
          <p className="text-black/80 text-sm">
            Rider limit reached. Upgrade to add more.
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
                {portalLoading ? "Opening..." : "Manage billing"}
              </button>
            )}

            {data.tier === "free" && (
              <>
                <button
                  onClick={() => handleCheckout("starter")}
                  disabled={!!checkoutLoading}
                  className={btnPrimary}
                >
                  {checkoutLoading === "starter" ? "Redirecting..." : "Upgrade to Starter ($19.99/mo)"}
                </button>
                <button
                  onClick={() => handleCheckout("stable")}
                  disabled={!!checkoutLoading}
                  className={btnSecondary}
                >
                  {checkoutLoading === "stable" ? "Redirecting..." : "Upgrade to Stable ($49.99/mo)"}
                </button>
              </>
            )}

            {data.tier === "starter" && (
              <button
                onClick={() => handleChangePlan("stable")}
                disabled={!!changePlanLoading}
                className={btnPrimary}
              >
                {changePlanLoading === "stable" ? "Changing..." : "Change to Stable ($49.99/mo)"}
              </button>
            )}

            {data.tier === "stable" && (
              <button
                onClick={() => handleChangePlan("starter")}
                disabled={!!changePlanLoading}
                className={btnSecondary}
              >
                {changePlanLoading === "starter" ? "Changing..." : "Change to Starter ($19.99/mo)"}
              </button>
            )}
          </div>
        )}

        {!isOwner && (
          <p className="text-sm text-black/60">
            Only the stable owner can manage billing and subscriptions.
          </p>
        )}
      </div>

      {isOwner && (
        <div className="mt-6 pt-6 border-t border-black/10">
          <h3 className="text-sm font-medium text-black mb-3 uppercase tracking-wider">Plans</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <PixelCard
              variant="white"
              className={`!min-h-[140px] ${data.tier === "starter" ? "border-black/30" : ""}`}
            >
              <div className="absolute inset-0 p-4 z-10 flex flex-col">
                <p className="font-medium text-black">Starter — $19.99/mo</p>
                <p className="text-sm text-black/60 mt-1">5 horses, 25 riders, analytics</p>
                {data.tier === "free" && (
                  <button
                    onClick={() => handleCheckout("starter")}
                    disabled={!!checkoutLoading}
                    className="mt-3 text-sm text-black/80 hover:text-black underline disabled:opacity-50 text-left"
                  >
                    Upgrade to Starter
                  </button>
                )}
                {data.tier === "stable" && (
                  <button
                    onClick={() => handleChangePlan("starter")}
                    disabled={!!changePlanLoading}
                    className="mt-3 text-sm text-black/80 hover:text-black underline disabled:opacity-50 text-left"
                  >
                    Change to Starter
                  </button>
                )}
              </div>
            </PixelCard>
            <PixelCard
              variant="white"
              className={`!min-h-[140px] ${data.tier === "stable" ? "border-black/30" : ""}`}
            >
              <div className="absolute inset-0 p-4 z-10 flex flex-col">
                <p className="font-medium text-black">Stable — $49.99/mo</p>
                <p className="text-sm text-black/60 mt-1">50 horses, 200 riders, matching</p>
                {data.tier === "free" && (
                  <button
                    onClick={() => handleCheckout("stable")}
                    disabled={!!checkoutLoading}
                    className="mt-3 text-sm text-black/80 hover:text-black underline disabled:opacity-50 text-left"
                  >
                    Upgrade to Stable
                  </button>
                )}
                {data.tier === "starter" && (
                  <button
                    onClick={() => handleChangePlan("stable")}
                    disabled={!!changePlanLoading}
                    className="mt-3 text-sm text-black/80 hover:text-black underline disabled:opacity-50 text-left"
                  >
                    Change to Stable
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
