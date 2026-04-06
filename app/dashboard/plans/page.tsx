"use client";

import { useEffect, useState } from "react";
import { useProfile } from "@/components/providers/ProfileProvider";
import { useRouter } from "next/navigation";
import PixelCard from "@/components/ui/PixelCard";
import PageLoader from "@/components/ui/PageLoader";
import GuidedTourOverlay, { type GuidedTourStep } from "@/components/dashboard/GuidedTourOverlay";
import { usePageTour } from "@/components/dashboard/usePageTour";
import { captureClientEvent } from "@/lib/analytics/posthog-client";

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
  const { open: showTour, complete: completeTour } = usePageTour(
    "saddleup_tour_plans_v1",
    !loading && Boolean(profile) && profile?.role === "owner" && Boolean(hasUsage)
  );

  const handleCheckout = async (planId: string) => {
    setCheckoutLoading(planId);
    setError(null);
    captureClientEvent("plan_checkout_clicked", { plan_id: planId });
    try {
      const res = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const { url } = await res.json();
      if (!res.ok) throw new Error("Failed");
      captureClientEvent("plan_checkout_redirected", { plan_id: planId });
      if (url) window.location.href = url;
    } catch {
      captureClientEvent("plan_checkout_failed", { plan_id: planId });
      setError("Failed to start checkout");
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    captureClientEvent("billing_portal_open_clicked");
    try {
      const res = await fetch("/api/subscription/portal", { method: "POST" });
      const { url } = await res.json();
      if (!res.ok) throw new Error("Failed");
      captureClientEvent("billing_portal_redirected");
      if (url) window.location.href = url;
    } finally {
      setPortalLoading(false);
    }
  };

  const handleChangePlan = async (planId: string) => {
    setError(null);
    setChangePlanLoading(planId);
    captureClientEvent("plan_change_clicked", { to_plan: planId });
    try {
      const res = await fetch("/api/subscription/change-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const j = await res.json();
      if (!res.ok) {
        captureClientEvent("plan_change_failed", { to_plan: planId });
        setError(j.error || "Failed to change plan");
        return;
      }
      captureClientEvent("plan_change_succeeded", { to_plan: planId });
      window.location.reload();
    } catch {
      captureClientEvent("plan_change_failed", { to_plan: planId });
      setError("Failed to change plan");
    } finally {
      setChangePlanLoading(null);
    }
  };

  const handleCancelPlan = async () => {
    setError(null);
    setCancelLoading(true);
    captureClientEvent("plan_cancel_clicked");
    try {
      const res = await fetch("/api/subscription/cancel", { method: "POST" });
      if (!res.ok) {
        captureClientEvent("plan_cancel_failed");
        const j = await res.json();
        setError(j.error || "Failed to cancel");
        return;
      }
      captureClientEvent("plan_cancel_succeeded");
      window.location.reload();
    } catch {
      captureClientEvent("plan_cancel_failed");
      setError("Failed to cancel plan");
    } finally {
      setCancelLoading(false);
    }
  };

  const daysLeft = data?.currentPeriodEnd && data.cancelAtPeriodEnd
    ? Math.max(0, Math.ceil((new Date(data.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  if (profileLoading || !profile) {
    return <PageLoader minHeight="min-h-[40vh]" message="Loading…" />;
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
        {loading ? (
          <PageLoader minHeight="min-h-[30vh]" message="Loading…" />
        ) : (
          <p className="text-black/50">Could not load subscription.</p>
        )}
      </div>
    );
  }

  const tourSteps: GuidedTourStep[] = [
    { id: "current", title: "Current Plan", description: "See your current tier and usage.", selector: '[data-tour="plans-current"]' },
    { id: "manage", title: "Manage Billing", description: "Upgrade, downgrade, cancel, or open billing portal.", selector: '[data-tour="plans-manage"]' },
    { id: "tiers", title: "Plan Cards", description: "Compare starter and stable plans quickly.", selector: '[data-tour="plans-tiers"]' },
  ];

  return (
    <div className="space-y-10">
      <GuidedTourOverlay
        open={showTour}
        steps={tourSteps}
        onSkip={completeTour}
        onComplete={completeTour}
      />
      <div>
        <h1 className="font-serif text-3xl md:text-4xl font-normal text-black">Plans</h1>
        <p className="text-black/60 mt-2 text-sm">Current plan, upgrade, or cancel.</p>
      </div>

      {/* Current plan */}
      <div className="border border-black/10 p-6" data-tour="plans-current">
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
        <div className="border border-black/10 p-6 space-y-4" data-tour="plans-manage">
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
      <div className="grid gap-4 sm:grid-cols-2" data-tour="plans-tiers">
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
