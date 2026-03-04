# Beta launch checklist

Quick checklist before showing investors or opening beta.

## Email confirmation from any device

- **Done in code:** Sign-up uses `emailRedirectTo` pointing to your **public app URL** + `/auth/callback`, so the link in the email works when opened on another device (e.g. phone).
- **You must:**
  1. Set **`NEXT_PUBLIC_APP_URL`** in production (e.g. on Vercel) to your live URL, e.g. `https://yourapp.vercel.app` or `https://app.yourdomain.com`.
  2. In **Supabase Dashboard** → **Authentication** → **URL Configuration** → **Redirect URLs**, add:
     - `https://yourapp.vercel.app/auth/callback` (and your custom domain if you use one).
  Without this, Supabase may block the redirect and users will see an error when confirming.

## Sign-up delay / “wait to create a new account”

If creating a second account (or retrying) feels slow or blocked:

- **Supabase** applies rate limits per IP (e.g. sign-ups per hour). Hitting the limit can delay or block new sign-ups.
- **Email delivery** (Resend or Supabase) can add a few seconds or more.

**For beta:** In Supabase Dashboard → **Authentication** → **Rate Limits**, you can temporarily relax limits for your IP or for the project. Keep an eye on abuse and tighten again after beta.

## Optional before investor demo

- [ ] Use production URL for sign-up (not localhost) so confirmation links work.
- [ ] Add production callback URL in Supabase Redirect URLs.
- [ ] Test full flow: sign up on one device → open email on another → confirm → land on dashboard.
- [ ] Ensure `NEXT_PUBLIC_APP_URL` is set in Vercel (or your host) environment variables.
- [ ] Ensure `SUPABASE_SERVICE_ROLE_KEY` is set so complete-signup works when email confirmation is on.
