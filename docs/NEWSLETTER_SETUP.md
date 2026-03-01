# Newsletter Setup

Saddle Up supports automated newsletters for stable owners. Subscribers can sign up from the landing page footer (global list) or be added by owners in the dashboard (per-stable list).

## Features

- **Landing page signup** — Footer form adds subscribers to the global Saddle Up list
- **Welcome email** — Automatically sent when someone subscribes
- **Per-stable newsletters** — Owners add subscribers and send from Dashboard → Newsletter
- **Campaign history** — Track sent newsletters and recipient counts
- **Weekly digest** — Vercel Cron sends a digest to global subscribers every Monday 9:00 UTC
- **Resend integration** — Uses the same Resend setup as booking emails (see `EMAIL_SETUP.md`)

## Database

Run the migration:

```bash
supabase db push
# or apply 00021_newsletter.sql in Supabase SQL Editor
```

Tables:
- `newsletter_subscribers` — email, full_name, stable_id (null = global), subscribed_at, unsubscribed_at
- `newsletter_campaigns` — subject, body_html, recipient_count, sent_at (per stable)

## Automated Emails

| Trigger | Email |
|---------|-------|
| **Subscribe** (landing page or dashboard) | Welcome email confirming subscription |
| **Weekly** (Monday 9:00 UTC) | Digest to global subscribers |

## Dashboard

1. Go to **Dashboard → Newsletter**
2. **Add subscribers** — Enter email (and optional name), click Add
3. **Send newsletter** — Enter subject and HTML content, click Send

## API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/newsletter/subscribe` | POST | Public | Subscribe (email, fullName, optional stableId) |
| `/api/newsletter/subscribers` | GET | Owner/Trainer | List subscribers for your stable |
| `/api/newsletter/subscribers` | POST | Owner | Add subscriber to your stable |
| `/api/newsletter/send` | POST | Owner | Send newsletter to your subscribers |
| `/api/newsletter/campaigns` | GET | Owner/Trainer | List sent campaigns |

## Automated Scheduled Newsletter (Weekly Digest)

The weekly digest runs automatically via Vercel Cron every **Monday at 9:00 UTC**. It sends to the global subscriber list (landing page signups).

### Setup

1. **Add `CRON_SECRET` to Vercel** — Project → Settings → Environment Variables
   - Generate: `openssl rand -hex 32`
   - Vercel sends this as `Authorization: Bearer $CRON_SECRET` when invoking the cron

2. **Cron config** — Already in `vercel.json`:
   ```json
   {
     "crons": [{ "path": "/api/cron/newsletter-digest", "schedule": "0 9 * * 1" }]
   }
   ```

3. **Customize** — Edit the subject/HTML in `app/api/cron/newsletter-digest/route.ts`

### Manual trigger (testing)

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-app.vercel.app/api/cron/newsletter-digest
```
