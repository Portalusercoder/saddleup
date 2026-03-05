import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, STRIPE_PRICE_IDS } from "@/lib/stripe";

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
        { error: "Only stable owners can manage billing" },
        { status: 403 }
      );
    }

    const { data: stable } = await supabase
      .from("stables")
      .select("id, stripe_customer_id")
      .eq("id", profile.stable_id)
      .single();

    if (!stable) {
      return NextResponse.json({ error: "Stable not found" }, { status: 404 });
    }

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard/plans?subscription=success`,
      cancel_url: `${origin}/dashboard/plans?subscription=cancelled`,
      metadata: { stable_id: stable.id, plan_id: planId },
      ...(stable.stripe_customer_id
        ? { customer: stable.stripe_customer_id }
        : { customer_email: user.email || undefined }),
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
