import Stripe from "stripe";

// Use placeholder for build when STRIPE_SECRET_KEY is not set (API calls will fail at runtime)
const key = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder";
export const stripe = new Stripe(key, { typescript: true });

export const STRIPE_PRICE_IDS = {
  starter: process.env.STRIPE_STARTER_PRICE_ID || "",
  stable: process.env.STRIPE_STABLE_PRICE_ID || "",
} as const;
