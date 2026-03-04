import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    if (!webhookSecret || !sig) {
      return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as {
          customer?: string;
          subscription?: string;
          metadata?: { stable_id?: string; plan_id?: string };
        };
        const stableId = session.metadata?.stable_id;
        const customerId = session.customer as string | undefined;

        if (stableId && customerId) {
          const planId = session.metadata?.plan_id || "starter";

          await supabase
            .from("stables")
            .update({
              stripe_customer_id: customerId,
              stripe_subscription_id: session.subscription || null,
              subscription_tier: planId,
              subscription_plan_id: planId,
              subscription_status: "active",
              plan_type: planId,
              trial_ends_at: null,
              grace_period_ends_at: null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", stableId);
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as {
          id: string;
          customer: string;
          status: string;
          items?: { data?: { price?: { id?: string } }[] };
        };

        const { data: stables } = await supabase
          .from("stables")
          .select("id")
          .eq("stripe_customer_id", sub.customer)
          .limit(1);

        if (stables?.length && sub.status === "active") {
          const priceId = sub.items?.data?.[0]?.price?.id || "";
          const planId = priceId.includes("stable") ? "stable" : "starter";
          await supabase
            .from("stables")
            .update({
              stripe_subscription_id: sub.id,
              subscription_tier: planId,
              subscription_plan_id: planId,
              subscription_status: "active",
              plan_type: planId,
              updated_at: new Date().toISOString(),
            })
            .eq("id", stables[0].id);
        } else if (stables?.length && (sub.status === "canceled" || sub.status === "unpaid")) {
          await supabase
            .from("stables")
            .update({
              stripe_subscription_id: null,
              subscription_tier: "free",
              subscription_plan_id: "free",
              subscription_status: "expired",
              plan_type: "beta",
              updated_at: new Date().toISOString(),
            })
            .eq("id", stables[0].id);
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
