import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("stable_id, role").eq("id", user.id).single();
    if (!profile?.stable_id || profile.role !== "owner") return NextResponse.json({ error: "Only the stable owner can cancel the plan" }, { status: 403 });

    const { data: stable } = await supabase.from("stables").select("stripe_subscription_id").eq("id", profile.stable_id).single();
    if (!stable?.stripe_subscription_id) return NextResponse.json({ error: "No active subscription to cancel" }, { status: 400 });

    await stripe.subscriptions.update(stable.stripe_subscription_id, { cancel_at_period_end: true });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Cancel subscription error:", err);
    return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 });
  }
}
