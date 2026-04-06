<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog event tracking into Saddle Up. PostHog was already initialized (via `PostHogProvider`, reverse proxy rewrites in `next.config.ts`, and helper utilities in `lib/analytics/`). This session added **15 new business events** across 9 files — covering the full product lifecycle from onboarding and team growth through horse management, schedule operations, and critical churn signals.

Environment variables `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` were confirmed and updated in `.env.local`.

## Events instrumented (this session)

| Event name | Description | File |
|---|---|---|
| `horse_health_record_added` | Fired when a trainer or owner successfully adds a health log entry (vet, vaccination, farrier, etc.) to a horse. | `app/dashboard/horses/[id]/page.tsx` |
| `horse_updated` | Fired when horse profile details are saved successfully via the edit modal. | `app/dashboard/horses/[id]/page.tsx` |
| `horse_passport_downloaded` | Fired when a user downloads the horse passport PDF. Top of conversion funnel for the health records feature. | `app/dashboard/horses/[id]/page.tsx` |
| `ai_workload_suggestions_requested` | Fired when a trainer or owner requests AI-generated workload suggestions for a horse. | `app/dashboard/horses/[id]/page.tsx` |
| `competition_added` | Fired when a trainer or owner adds a new competition entry. | `app/dashboard/competitions/page.tsx` |
| `competition_updated` | Fired when a trainer or owner edits an existing competition. | `app/dashboard/competitions/page.tsx` |
| `competition_deleted` | Fired when a trainer or owner deletes a competition record. | `app/dashboard/competitions/page.tsx` |
| `incident_reported` | Fired when a new incident report is submitted. Critical safety event. | `app/dashboard/incidents/page.tsx` |
| `schedule_slot_blocked` | Fired when a stable slot is blocked by an owner or trainer. | `app/dashboard/schedule/page.tsx` |
| `booking_rescheduled` | Fired when a booking is rescheduled to a new date/time. | `app/dashboard/schedule/page.tsx` |
| `onboarding_completed` | Fired when a new user completes the guided tour/tutorial on their first dashboard visit. | `app/dashboard/page.tsx` |
| `subscription_portal_accessed` | Server-side. Fired when a stable owner accesses the Stripe billing portal. Key monetization signal. | `app/api/subscription/portal/route.ts` |
| `member_added_by_id` | Server-side. Fired when a trainer or owner successfully adds a new member to the stable by ID. Growth/viral event. | `app/api/members/add-by-id/route.ts` |
| `account_deletion_requested` | Server-side. Fired when a stable owner schedules account deletion. Critical churn signal. | `app/api/account/request-deletion/route.ts` |
| `newsletter_subscriber_added` | Server-side. Fired when a new newsletter subscriber is added to a stable's list. | `app/api/newsletter/subscribers/route.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

**Dashboard:** [Analytics basics](https://us.posthog.com/project/371065/dashboard/1435261)

**Insights:**
- [Monetization & Churn Signals](https://us.posthog.com/project/371065/insights/RQ5tHWeM) — billing portal access vs. account deletion requests over 90 days
- [Team Growth – Members Added by ID](https://us.posthog.com/project/371065/insights/GXJ2lII2) — new team members added + onboarding completions, daily over 30 days
- [Horse Management Activity](https://us.posthog.com/project/371065/insights/eygBv7cg) — health records, competitions, and incidents logged daily over 30 days
- [Horse Passport & AI Feature Usage](https://us.posthog.com/project/371065/insights/NyaxhQNi) — passport downloads, AI suggestions, and profile updates daily over 30 days
- [Onboarding → Team Build Funnel](https://us.posthog.com/project/371065/insights/xvSGuUoV) — conversion from completing onboarding to adding a first team member

---

## Previous session events (still active)

| Event | Description | File |
|---|---|---|
| `booking_created` | A lesson booking was created (by student or staff) | `app/api/bookings/route.ts` |
| `booking_approved` | An owner or trainer approved a pending lesson booking | `app/api/bookings/[id]/route.ts` |
| `booking_declined` | An owner or trainer declined a lesson booking request | `app/api/bookings/[id]/route.ts` |
| `subscription_activated` | A stable completed checkout and activated a paid subscription | `app/api/subscription/webhook/route.ts` |
| `subscription_expired` | A stable's subscription was cancelled or became unpaid via Stripe | `app/api/subscription/webhook/route.ts` |
| `subscription_cancelled` | A stable owner requested subscription cancellation at period end | `app/api/subscription/cancel/route.ts` |
| `session_logged` | A training session was logged for a horse | `app/api/horses/sessions/route.ts` |
| `incident_reported` | An incident report was filed for a horse or rider (server-side) | `app/api/incident-reports/route.ts` |
| `newsletter_subscribed` | A user subscribed to the newsletter | `app/api/newsletter/subscribe/route.ts` |
| `account_reactivated` | A stable owner cancelled a pending account deletion | `app/api/account/reactivate/route.ts` |
| `matching_viewed` | A user successfully loaded the horse-rider matching feature | `app/dashboard/matching/page.tsx` |
| `matching_upgrade_prompted` | A user hit the matching paywall (plan doesn't include it) | `app/dashboard/matching/page.tsx` |

**Previous session dashboard:** https://us.posthog.com/project/371065/dashboard/1435134

---

## LLM Analytics

PostHog LLM analytics is integrated for the OpenAI workload suggestions feature via `@posthog/ai`. Every call to `gpt-4o-mini` in `app/api/horses/[id]/workload-suggestions/route.ts` automatically captures a `$ai_generation` event.

You can view captured LLM generations at: https://us.posthog.com/project/371065/llm-analytics/generations

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
