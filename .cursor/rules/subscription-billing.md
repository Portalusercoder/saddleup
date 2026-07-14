---
name: subscription-billing
description: Use when turning payment state into product behavior — model plans and subscription status in the DB, enforce plan limits and feature entitlements server-side, and gate features with a single typed check.
---

# Subscription & Billing Logic

## Overview

Once `payments-stripe` syncs subscription state into your database, you need to **turn that state into behavior**: which features are unlocked, which limits apply, what happens when a plan lapses. Model plans as data, store the org's current plan + status, and expose one `entitlement(org)` check the whole app uses. Enforce limits on the **server**, where they can't be bypassed.

## When to use

- Different plans unlock different features or limits (seats, projects, API calls).
- You need paywalls, usage caps, or "upgrade to continue" gates.
- Handling trials, past-due, and cancelled states gracefully.

## Model plans as data

```ts
// src/server/billing/plans.ts
export type PlanId = "free" | "pro" | "scale";

export const PLANS = {
  free:  { name: "Free",  priceId: null,            seats: 1,  projects: 3,   apiCallsPerMonth: 1_000 },
  pro:   { name: "Pro",   priceId: "price_pro",     seats: 10, projects: 50,  apiCallsPerMonth: 100_000 },
  scale: { name: "Scale", priceId: "price_scale",   seats: 50, projects: Infinity, apiCallsPerMonth: 1_000_000 },
} as const satisfies Record<PlanId, { name: string; priceId: string | null; seats: number; projects: number; apiCallsPerMonth: number }>;
```

Store on the org (synced from Stripe): `planId`, `subscriptionStatus` (`active | trialing | past_due | canceled`), `currentPeriodEnd`.

## Enforce entitlements server-side

```ts
import { PLANS } from "@/server/billing/plans";

export function planFor(org: { planId: PlanId; subscriptionStatus: string }) {
  // lapsed subscriptions fall back to free limits
  const active = ["active", "trialing"].includes(org.subscriptionStatus);
  return active ? PLANS[org.planId] : PLANS.free;
}

export async function assertCanCreateProject(org) {
  const limit = planFor(org).projects;
  const count = await countProjects(org.id);
  if (count >= limit) {
    const e = new Error("Project limit reached for your plan");
    (e as any).status = 402; // Payment Required → show upgrade prompt
    throw e;
  }
}
```

Call `assertCanCreateProject` inside the create action — the UI may also read the limit to show a paywall (pairs with `billing-and-pricing` UI).

## Pitfalls

- **Enforcing limits only in the UI** — disable the button *and* check on the server; the endpoint is the real gate.
- **Ignoring `past_due`/`canceled`** — decide the grace policy explicitly; default to downgrading to free limits.
- **Hard-coding plan rules across the app** — centralize in `PLANS`; one edit changes every gate.
- **Counting usage without `org_id` scope** — always count within the tenant.
- **No trial handling** — treat `trialing` as active until `currentPeriodEnd`.

## Hand-off

Typed entitlements enforced server-side. The pricing/paywall UI (`billing-and-pricing` in saas-ui-skills) reads the same `PLANS`; `payments-stripe` keeps the status fresh.
