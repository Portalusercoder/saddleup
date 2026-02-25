# Stripe Subscription Setup

To enable premium subscriptions in Saddle Up:

## 1. Create a Stripe account

Sign up at [stripe.com](https://stripe.com) and get your API keys from the Dashboard.

## 2. Create products and prices

1. Go to **Stripe Dashboard → Products → Add product**
2. Create two products:
   - **Starter** — $19.99/month recurring
   - **Stable** — $49.99/month recurring
3. For each product, add a **Price** (recurring, monthly)
4. Copy the **Price ID** (starts with `price_`)

## 3. Environment variables

Add to your `.env`:

```
STRIPE_SECRET_KEY=sk_test_...          # or sk_live_ for production
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_STABLE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...         # from step 4
NEXT_PUBLIC_APP_URL=https://yourdomain.com  # for redirect URLs
```

## 4. Webhook (for subscription sync)

1. Go to **Stripe Dashboard → Developers → Webhooks**
2. Add endpoint: `https://yourdomain.com/api/subscription/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the **Signing secret** (starts with `whsec_`)

For local testing, use the [Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
stripe listen --forward-to localhost:3000/api/subscription/webhook
```

Use the webhook secret it prints as `STRIPE_WEBHOOK_SECRET`.

## 5. Plan limits

| Plan     | Horses | Riders | Price    |
|----------|--------|--------|----------|
| Free     | 2      | 10     | $0       |
| Starter  | 5      | 25     | $19.99/mo|
| Stable   | 50     | 200    | $49.99/mo|
| Enterprise | Unlimited | Unlimited | Contact |

## 6. Billing portal

Stripe Customer Portal is used for managing subscriptions (cancel, update payment). It's enabled automatically when a customer subscribes. The "Manage billing" button in Settings opens it.
