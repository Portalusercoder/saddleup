import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SUBSCRIPTION_LIMITS } from "@/lib/constants";
import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("stable_id, role")
      .eq("id", user.id)
      .single();

    if (!profile?.stable_id) {
      return NextResponse.json({ error: "No stable found" }, { status: 404 });
    }

    const { data: stable } = await supabase
      .from("stables")
      .select(
        "id, name, subscription_tier, subscription_plan_id, stripe_customer_id, stripe_subscription_id, subscription_status, trial_ends_at, plan_type, grace_period_ends_at"
      )
      .eq("id", profile.stable_id)
      .single();

    if (!stable) {
      return NextResponse.json({ error: "Stable not found" }, { status: 404 });
    }

    const tier = (stable.subscription_tier || "free") as keyof typeof SUBSCRIPTION_LIMITS;
    const limits = SUBSCRIPTION_LIMITS[tier] || SUBSCRIPTION_LIMITS.free;

    const [{ count: horseCount }, { count: riderCount }] = await Promise.all([
      supabase.from("horses").select("id", { count: "exact", head: true }).eq("stable_id", stable.id),
      supabase.from("riders").select("id", { count: "exact", head: true }).eq("stable_id", stable.id),
    ]);

    const status = (stable.subscription_status as string) || "trialing";

    let currentPeriodEnd: string | null = null;
    let cancelAtPeriodEnd = false;
    if (stable.stripe_subscription_id && process.env.STRIPE_SECRET_KEY) {
      try {
        const sub = (await stripe.subscriptions.retrieve(
          stable.stripe_subscription_id
        )) as unknown as Stripe.Subscription;
        currentPeriodEnd = sub.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null;
        cancelAtPeriodEnd = !!sub.cancel_at_period_end;
      } catch {
        // ignore
      }
    }

    return NextResponse.json({
      tier,
      planId: stable.subscription_plan_id,
      status,
      planType: stable.plan_type,
      trialEndsAt: stable.trial_ends_at,
      gracePeriodEndsAt: stable.grace_period_ends_at,
      currentPeriodEnd,
      cancelAtPeriodEnd,
      readOnly: status === "expired" || status === "suspended",
      limits: {
        horses: limits.horses,
        riders: limits.riders,
        analytics: limits.analytics,
        matching: limits.matching,
      },
      usage: {
        horses: horseCount ?? 0,
        riders: riderCount ?? 0,
      },
      canAddHorse: (horseCount ?? 0) < limits.horses,
      canAddRider: (riderCount ?? 0) < limits.riders,
      hasStripeCustomer: !!stable.stripe_customer_id,
    });
  } catch (err) {
    console.error("GET subscription error:", err);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}
