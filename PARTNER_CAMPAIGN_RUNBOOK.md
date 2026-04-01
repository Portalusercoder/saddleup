# Partner Campaign Runbook

This is the exact workflow for time-based partner access + kill switch.

## What was implemented
- DB table: `partner_campaigns`
- Public status API: `GET /api/partners/:slug`
- Admin management API: `GET/PATCH /api/admin/partners/:slug` (admin email only)
- Landing partner block (`Ouma Horse`) that only renders when campaign is active

## Activation rules
A campaign is active only if:
1) `enabled = true`
2) `starts_at` is empty or current time is after `starts_at`
3) `ends_at` is empty or current time is before `ends_at`

If any rule fails, campaign is hidden from the site.

## One-time setup
1. Run the migration:
   - `supabase/migrations/00030_partner_campaigns.sql`
2. Confirm row exists for `slug = 'ouma'`.

## Turn campaign ON (time-based)
Use API (while logged in as admin email):

```bash
curl -X PATCH "https://YOUR_DOMAIN/api/admin/partners/ouma" \
  -H "Content-Type: application/json" \
  -b "YOUR_SESSION_COOKIE" \
  --data '{
    "enabled": true,
    "startsAt": "2026-04-10T00:00:00Z",
    "endsAt": "2026-06-10T23:59:59Z",
    "destinationUrl": "https://www.oumahorse.com",
    "promoCode": "SADDLEUP10",
    "ctaText": "Shop Ouma Horse"
  }'
```

## Instant kill switch (disable immediately)

```bash
curl -X PATCH "https://YOUR_DOMAIN/api/admin/partners/ouma" \
  -H "Content-Type: application/json" \
  -b "YOUR_SESSION_COOKIE" \
  --data '{"enabled": false}'
```

This hides the partner block immediately on next page load.

## End-of-pilot options
- **Renew**: update `endsAt` to future date.
- **Pause**: set `enabled` to `false`.
- **Terminate**: set `enabled` false and clear promo code.

## Maintenance checklist
- Weekly: validate destination URL and promo code still work.
- Weekly: review click/conversion metrics.
- Before renewals: update `startsAt/endsAt` and creative text.
- Keep at least one fallback generic partner section if desired.
