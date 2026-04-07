<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into Saddle Up, a Next.js App Router application for horse stable management. The following changes were made:

- **Environment variables** set in `.env.local`: `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST`
- **Reverse proxy** added to `next.config.ts` via `/ingest` rewrites — all PostHog traffic is routed through the app domain to avoid ad-blockers and improve data quality
- **PostHogProvider** updated to use the `/ingest` proxy host with `ui_host` pointing to `https://us.posthog.com`
- **Server-side events** instrumented across 7 API routes using the existing `captureServerEvent` helper
- **Client-side events** instrumented in the matching dashboard page using the existing `captureClientEvent` helper (consent-gated)
- **One TypeScript error** fixed: `horseId` number coerced to string for `captureServerEvent` distinct ID

| Event | Description | File |
|---|---|---|
| `booking_created` | A lesson booking was created (by student or staff) | `app/api/bookings/route.ts` *(pre-existing)* |
| `booking_approved` | An owner or trainer approved a pending lesson booking | `app/api/bookings/[id]/route.ts` |
| `booking_declined` | An owner or trainer declined a lesson booking request | `app/api/bookings/[id]/route.ts` |
| `subscription_activated` | A stable completed checkout and activated a paid subscription | `app/api/subscription/webhook/route.ts` |
| `subscription_expired` | A stable's subscription was cancelled or became unpaid via Stripe | `app/api/subscription/webhook/route.ts` |
| `subscription_cancelled` | A stable owner requested subscription cancellation at period end | `app/api/subscription/cancel/route.ts` |
| `session_logged` | A training session was logged for a horse | `app/api/horses/sessions/route.ts` |
| `incident_reported` | An incident report was filed for a horse or rider | `app/api/incident-reports/route.ts` |
| `newsletter_subscribed` | A user subscribed to the newsletter | `app/api/newsletter/subscribe/route.ts` |
| `account_reactivated` | A stable owner cancelled a pending account deletion | `app/api/account/reactivate/route.ts` |
| `matching_viewed` | A user successfully loaded the horse-rider matching feature | `app/dashboard/matching/page.tsx` |
| `matching_upgrade_prompted` | A user hit the matching paywall (plan doesn't include it) | `app/dashboard/matching/page.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://us.posthog.com/project/371065/dashboard/1435134
- **Booking Activity** (created / approved / declined trend): https://us.posthog.com/project/371065/insights/onELnyUS
- **Subscription Health** (activations / cancellations / expirations): https://us.posthog.com/project/371065/insights/lEUlkmUS
- **Premium Feature Adoption vs Paywall** (matching viewed vs upgrade prompted): https://us.posthog.com/project/371065/insights/AW4X6iDy
- **Training Sessions Logged** (weekly horse training volume): https://us.posthog.com/project/371065/insights/W5apNsvj
- **Premium Conversion Funnel** (matching viewed → subscription activated): https://us.posthog.com/project/371065/insights/201vK3K4

---

## LLM Analytics

PostHog LLM analytics has been integrated for the OpenAI workload suggestions feature. The following changes were made:

- **`@posthog/ai` installed** — the PostHog OpenAI wrapper package (`@posthog/ai`) was added as a dependency
- **`getPostHogClient()` exported** from `lib/analytics/posthog-server.ts` to expose the singleton PostHog Node client for the wrapper
- **`app/api/horses/[id]/workload-suggestions/route.ts` updated** — the plain `OpenAI` client is now replaced by the `@posthog/ai` wrapped client when PostHog is configured. Every call to `gpt-4o-mini` automatically captures a `$ai_generation` event in PostHog with model name, input/output tokens, latency, cost, and the authenticated user's distinct ID

| What is tracked | Detail |
|---|---|
| Event name | `$ai_generation` (automatic via `@posthog/ai`) |
| Model | `gpt-4o-mini` |
| User linkage | `posthogDistinctId: user.id` — each generation is tied to the Supabase user |
| Custom property | `horse_id` — links each generation to the specific horse being analysed |
| File | `app/api/horses/[id]/workload-suggestions/route.ts` |

You can view captured LLM generations at: https://us.posthog.com/project/371065/llm-analytics/generations

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
