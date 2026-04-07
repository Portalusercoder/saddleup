# Error Tracking Setup (Sentry)

This project uses Sentry for frontend, API, and server error tracking.

## Environment Variables

Add these in Vercel:

- `SENTRY_DSN` (server-side SDK)
- `NEXT_PUBLIC_SENTRY_DSN` (client-side SDK)

Use the DSN from your Sentry project settings.

## Notes

- Free tier is enough to start.
- SDK is enabled only when DSN is set.
- Current defaults are conservative:
  - traces sample rate: `0.1`
  - replay session sample rate: `0.0`
  - replay on error sample rate: `1.0`

## Verify

1. Deploy after adding env vars.
2. Open app and trigger a test error from browser console:
   - `setTimeout(() => { throw new Error("Sentry test error"); }, 0)`
3. Confirm event appears in Sentry Issues.
