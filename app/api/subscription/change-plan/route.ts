import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, STRIPE_PRICE_IDS } from "@/lib/stripe";
import { SUBSCRIPTION_LIMITS } from "@/lib/constants";

export async function POST(req: Request) {
  try {
    const { planId } = await req.json();

    if (!planId || !["starter", "stable"].includes(planId)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const priceId = planId === "starter" ? STRIPE_PRICE_IDS.starter : STRIPE_PRICE_IDS.stable;
    if (!priceId || !process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe not configured. Add STRIPE_* env vars." },
        { status: 500 }
      );
    }

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

    if (!profile?.stable_id || profile.role !== "owner") {
      return NextResponse.json(
        { error: "Only stable owners can change plans" },
        { status: 403 }
      );
    }

    const { data: stable } = await supabase
      .from("stables")
      .select("subscription_tier, stripe_subscription_id")
      .eq("id", profile.stable_id)
      .single();

    if (!stable) {
      return NextResponse.json({ error: "Stable not found" }, { status: 404 });
    }

    if (!stable.stripe_subscription_id) {
      return NextResponse.json(
        { error: "No active subscription. Use checkout to subscribe first." },
        { status: 400 }
      );
    }

    const currentTier = (stable.subscription_tier || "free") as string;
    if (currentTier === planId) {
      return NextResponse.json(
        { error: "You are already on this plan" },
        { status: 400 }
      );
    }

    const newLimits = SUBSCRIPTION_LIMITS[planId as keyof typeof SUBSCRIPTION_LIMITS] || SUBSCRIPTION_LIMITS.free;
    const [{ count: horseCount }, { count: riderCount }] = await Promise.all([
      supabase.from("horses").select("id", { count: "exact", head: true }).eq("stable_id", profile.stable_id),
      supabase.from("riders").select("id", { count: "exact", head: true }).eq("stable_id", profile.stable_id),
    ]);
    if ((horseCount ?? 0) > newLimits.horses || (riderCount ?? 0) > newLimits.riders) {
      return NextResponse.json(
        {
          error: `Cannot downgrade: you have ${horseCount ?? 0} horses and ${riderCount ?? 0} riders. ${planId === "starter" ? "Starter" : "Stable"} allows ${newLimits.horses} horses and ${newLimits.riders} riders. Remove some to downgrade.`,
        },
        { status: 400 }
      );
    }

    const subscription = await stripe.subscriptions.retrieve(stable.stripe_subscription_id);
    const itemId = subscription.items.data[0]?.id;
    if (!itemId) {
      return NextResponse.json(
        { error: "Subscription has no items" },
        { status: 400 }
      );
    }

    await stripe.subscriptions.update(stable.stripe_subscription_id, {
      items: [{ id: itemId, price: priceId }],
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Change plan error:", err);
    return NextResponse.json(
      { error: "Failed to change plan" },
      { status: 500 }
    );
  }
}
