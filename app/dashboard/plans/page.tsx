"use client";

import { useEffect, useState } from "react";
import { useProfile } from "@/components/providers/ProfileProvider";
import { useRouter } from "next/navigation";
import PixelCard from "@/components/ui/PixelCard";

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
  const router = useRouter();
  const { profile, loading: profileLoading } = useProfile();
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

  const handleCheckout = async (planId: string) => {
    setCheckoutLoading(planId);
    setError(null);
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
      setError("Failed to start checkout");
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/subscription/portal", { method: "POST" });
      const { url } = await res.json();
      if (!res.ok) throw new Error("Failed");
      if (url) window.location.href = url;
    } finally {
      setPortalLoading(false);
    }
  };

  const handleChangePlan = async (planId: string) => {
    setError(null);
    setChangePlanLoading(planId);
    try {
      const res = await fetch("/api/subscription/change-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const j = await res.json();
      if (!res.ok) {
        setError(j.error || "Failed to change plan");
        return;
      }
      window.location.reload();
    } catch {
      setError("Failed to change plan");
    } finally {
      setChangePlanLoading(null);
    }
  };

  const handleCancelPlan = async () => {
    setError(null);
    setCancelLoading(true);
    try {
      const res = await fetch("/api/subscription/cancel", { method: "POST" });
      if (!res.ok) {
        const j = await res.json();
        setError(j.error || "Failed to cancel");
        return;
      }
      window.location.reload();
    } catch {
      setError("Failed to cancel plan");
    } finally {
      setCancelLoading(false);
    }
  };

  const daysLeft = data?.currentPeriodEnd && data.cancelAtPeriodEnd
    ? Math.max(0, Math.ceil((new Date(data.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  if (profileLoading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-black/50">Loading...</p>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-3xl md:text-4xl font-normal text-black">Plans</h1>
        <p className="text-black/60">Only the stable owner can view and manage plans.</p>
      </div>
    );
  }

  if (loading || !hasUsage) {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-3xl md:text-4xl font-normal text-black">Plans</h1>
        <p className="text-black/50">{loading ? "Loading..." : "Could not load subscription."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-3xl md:text-4xl font-normal text-black">Plans</h1>
        <p className="text-black/60 mt-2 text-sm">Current plan, upgrade, or cancel.</p>
      </div>

      {/* Current plan */}
      <div className="border border-black/10 p-6">
        <h2 className="font-serif text-lg text-black mb-4">Current plan</h2>
        <p className="font-medium text-black capitalize">{data.tier} Plan</p>
        <p className="text-sm text-black/60 mt-1">
          {data.usage?.horses ?? 0} / {data.limits?.horses ?? 0} horses • {data.usage?.riders ?? 0} / {data.limits?.riders ?? 0} riders
        </p>
        {data.cancelAtPeriodEnd && daysLeft !== null && (
          <p className="mt-3 text-amber-800 text-sm">
            Your plan is cancelled. You still have <strong>{daysLeft} day{daysLeft === 1 ? "" : "s"}</strong> left to use premium.
          </p>
        )}
        {error && <p className="mt-2 text-amber-700 text-sm">{error}</p>}
      </div>

      {/* Upgrade & Cancel */}
      {isOwner && (
        <div className="border border-black/10 p-6 space-y-4">
          <h2 className="font-serif text-lg text-black mb-4">Upgrade or cancel</h2>
          {data.hasStripeCustomer && (
            <button
              type="button"
              onClick={handlePortal}
              disabled={portalLoading}
              className="px-4 py-2.5 border border-black/10 text-black text-sm uppercase tracking-wider hover:bg-black/5 transition disabled:opacity-50"
            >
              {portalLoading ? "Opening..." : "Manage billing (Stripe)"}
            </button>
          )}
          {data.tier === "free" && (
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleCheckout("starter")}
                disabled={!!checkoutLoading}
                className="px-4 py-2.5 bg-accent text-white font-medium text-sm uppercase tracking-wider hover:opacity-95 transition disabled:opacity-50"
              >
                {checkoutLoading === "starter" ? "Redirecting..." : "Upgrade to Starter ($19.99/mo)"}
              </button>
              <button
                onClick={() => handleCheckout("stable")}
                disabled={!!checkoutLoading}
                className="px-4 py-2.5 border border-black/20 text-black text-sm uppercase tracking-wider hover:bg-black/5 transition disabled:opacity-50"
              >
                {checkoutLoading === "stable" ? "Redirecting..." : "Upgrade to Stable ($49.99/mo)"}
              </button>
            </div>
          )}
          {(data.tier === "starter" || data.tier === "stable") && !data.cancelAtPeriodEnd && (
            <button
              type="button"
              onClick={handleCancelPlan}
              disabled={cancelLoading}
              className="px-4 py-2.5 border border-black/30 text-black text-sm uppercase tracking-wider hover:bg-black/5 transition disabled:opacity-50"
            >
              {cancelLoading ? "Cancelling..." : "Cancel plan"}
            </button>
          )}
          {data.tier === "starter" && (
            <button
              onClick={() => handleChangePlan("stable")}
              disabled={!!changePlanLoading}
              className="block px-4 py-2.5 bg-accent text-white font-medium text-sm uppercase tracking-wider hover:opacity-95 transition disabled:opacity-50"
            >
              {changePlanLoading === "stable" ? "Changing..." : "Change to Stable ($49.99/mo)"}
            </button>
          )}
          {data.tier === "stable" && (
            <button
              onClick={() => handleChangePlan("starter")}
              disabled={!!changePlanLoading}
              className="block px-4 py-2.5 border border-black/20 text-black text-sm uppercase tracking-wider hover:bg-black/5 transition disabled:opacity-50"
            >
              {changePlanLoading === "starter" ? "Changing..." : "Change to Starter ($19.99/mo)"}
            </button>
          )}
        </div>
      )}

      {/* Plan cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <PixelCard variant="white" className={`!min-h-[120px] ${data.tier === "starter" ? "border-black/30" : ""}`}>
          <div className="absolute inset-0 p-4 z-10 flex flex-col">
            <p className="font-medium text-black">Starter — $19.99/mo</p>
            <p className="text-sm text-black/60 mt-1">5 horses, 25 riders, analytics</p>
            {data.tier === "free" && (
              <button onClick={() => handleCheckout("starter")} disabled={!!checkoutLoading} className="mt-3 text-sm text-black/80 hover:text-black underline disabled:opacity-50 text-left">
                Upgrade to Starter
              </button>
            )}
            {data.tier === "stable" && (
              <button onClick={() => handleChangePlan("starter")} disabled={!!changePlanLoading} className="mt-3 text-sm text-black/80 hover:text-black underline disabled:opacity-50 text-left">
                Change to Starter
              </button>
            )}
          </div>
        </PixelCard>
        <PixelCard variant="white" className={`!min-h-[120px] ${data.tier === "stable" ? "border-black/30" : ""}`}>
          <div className="absolute inset-0 p-4 z-10 flex flex-col">
            <p className="font-medium text-black">Stable — $49.99/mo</p>
            <p className="text-sm text-black/60 mt-1">50 horses, 200 riders, matching</p>
            {data.tier === "free" && (
              <button onClick={() => handleCheckout("stable")} disabled={!!checkoutLoading} className="mt-3 text-sm text-black/80 hover:text-black underline disabled:opacity-50 text-left">
                Upgrade to Stable
              </button>
            )}
            {data.tier === "starter" && (
              <button onClick={() => handleChangePlan("stable")} disabled={!!changePlanLoading} className="mt-3 text-sm text-black/80 hover:text-black underline disabled:opacity-50 text-left">
                Change to Stable
              </button>
            )}
          </div>
        </PixelCard>
      </div>
    </div>
  );
}
