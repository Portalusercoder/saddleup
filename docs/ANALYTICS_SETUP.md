# Analytics Setup (Mixpanel + Clarity)

This project uses a lightweight, consent-aware analytics setup:

- Mixpanel for product events and funnels.
- Microsoft Clarity for session recordings and UX behavior.

Both tools load only when treats consent is set to `all`.

## Environment Variables

Add these in Vercel (Production, Preview, Development as needed):

- `NEXT_PUBLIC_MIXPANEL_TOKEN`
  - Value: your Mixpanel project token (Project Settings -> Project Token).
- `NEXT_PUBLIC_MIXPANEL_API_HOST` (optional)
  - Default in code: `/ingest` (first-party proxy to reduce tracking-blocker issues).
- `NEXT_PUBLIC_CLARITY_PROJECT_ID`
  - Value: your Clarity project ID (Clarity setup/install snippet).

## What Is Tracked

Core automatic event:

- `page_viewed`
  - Props: `path`, `url`

Auth and lifecycle events:

- `login_attempted`, `login_succeeded`, `login_failed`
- `signup_code_requested`, `signup_code_sent`, `signup_code_request_failed`
- `signup_code_resend_requested`, `signup_code_resent`, `signup_code_resend_failed`
- `signup_verify_attempted`, `signup_verify_failed`
- `signup_stable_previewed`, `signup_join_confirmed_click`, `signup_join_declined`
- `signup_complete_failed`, `signup_completed_client`
- `password_reset_code_requested`, `password_reset_code_sent`, `password_reset_code_request_failed`
- `password_reset_code_resend_requested`, `password_reset_code_resent`, `password_reset_code_resend_failed`
- `password_reset_confirm_attempted`, `password_reset_confirmed`, `password_reset_confirm_failed`

Plans and billing events:

- `plan_checkout_clicked`, `plan_checkout_redirected`, `plan_checkout_failed`
- `billing_portal_open_clicked`, `billing_portal_redirected`
- `plan_change_clicked`, `plan_change_succeeded`, `plan_change_failed`
- `plan_cancel_clicked`, `plan_cancel_succeeded`, `plan_cancel_failed`

Bookings events:

- `booking_request_attempted`, `booking_request_succeeded`, `booking_request_failed`
- `booking_approve_attempted`, `booking_approved`, `booking_approve_failed`
- `booking_decline_attempted`, `booking_declined`, `booking_decline_failed`
- `booking_cancel_attempted`, `booking_cancelled`, `booking_cancel_failed`

Horses events:

- `horse_photo_upload_attempted`, `horse_photo_uploaded`, `horse_photo_upload_failed`
- `horse_add_attempted`, `horse_add_succeeded`, `horse_add_failed`
- `horse_delete_soft`, `horse_delete_undone`, `horse_delete_committed`
- `horse_session_log_attempted`, `horse_session_logged`, `horse_session_log_failed`

## Verification Checklist

1. Accept treats on the site.
2. Open browser devtools Network tab:
   - Mixpanel requests should hit `api-js.mixpanel.com`.
   - Clarity should load `clarity.ms/tag/...`.
3. Trigger flows (login/signup/plan actions).
4. Confirm events in Mixpanel Live View.
5. Confirm sessions in Clarity dashboard.
