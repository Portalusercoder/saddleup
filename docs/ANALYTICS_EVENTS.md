# Analytics Events (PostHog)

This is the source of truth for event names and key properties used in Saddle Up.

## Conventions

- Event names are `snake_case`.
- Prefer boolean/string/number primitives in properties.
- Do not send raw secrets, tokens, or payment details.
- Client events include `source: "client"` automatically.
- Server events include `source: "server"` automatically.
- Client capture is gated by treats consent (`all`).

## Core Identity

- Distinct ID: authenticated `user.id` where available.
- Identified person properties:
  - `role`
  - `full_name`

## Server Events

- `signup_completed`
  - `role`
  - `has_join_code`
  - `has_stable_name`

- `booking_created`
  - `stable_id`
  - `horse_id`
  - `rider_id`
  - `status`

- `horse_created`
  - `stable_id`
  - `horse_id`
  - `horse_name`

- `rider_created`
  - `stable_id`
  - `rider_id`

- `session_logged`
  - `horse_id`
  - `punch_type`
  - `duration_minutes`

- `checkout_started`
  - `plan_id`
  - `stable_id`
  - `checkout_session_id`

- `plan_changed`
  - `stable_id`
  - `from_plan`
  - `to_plan`

## Client Events

### Auth: Login

- `login_attempted`
  - `has_redirect`
- `login_succeeded`
- `login_failed`

### Auth: Signup

- `signup_code_requested`
  - `role`
- `signup_code_sent`
  - `role`
- `signup_code_request_failed`
  - `reason`
- `signup_code_resend_requested`
  - `role`
- `signup_code_resent`
- `signup_code_resend_failed`
- `signup_verify_attempted`
  - `role`
- `signup_verify_failed`
  - `reason`
- `signup_stable_previewed`
  - `role`
- `signup_join_confirmed_click`
- `signup_join_declined`
- `signup_complete_failed`
  - `role`
  - `reason` (optional)
- `signup_completed_client`
  - `role`

### Auth: Forgot Password

- `password_reset_code_requested`
- `password_reset_code_sent`
- `password_reset_code_request_failed`
- `password_reset_code_resend_requested`
- `password_reset_code_resent`
- `password_reset_code_resend_failed`
- `password_reset_confirm_attempted`
- `password_reset_confirmed`
- `password_reset_confirm_failed`

### Contact

- `contact_type_selected`
  - `type` (`enterprise` | `general`)
  - `source` (optional, e.g. `query`)
- `contact_submit_attempted`
  - `type`
- `contact_submit_succeeded`
  - `type`
- `contact_submit_failed`
  - `type`

### Billing / Plans

- `plan_checkout_clicked`
  - `plan_id`
- `plan_checkout_redirected`
  - `plan_id`
- `plan_checkout_failed`
  - `plan_id`
- `billing_portal_open_clicked`
- `billing_portal_redirected`
- `plan_change_clicked`
  - `to_plan`
- `plan_change_succeeded`
  - `to_plan`
- `plan_change_failed`
  - `to_plan`
- `plan_cancel_clicked`
- `plan_cancel_succeeded`
- `plan_cancel_failed`

### Bookings

- `booking_request_attempted`
- `booking_request_succeeded`
  - `status`
- `booking_request_failed`
- `booking_approve_attempted`
- `booking_approved`
- `booking_approve_failed`
- `booking_decline_attempted`
- `booking_declined`
- `booking_decline_failed`
- `booking_cancel_attempted`
- `booking_cancelled`
- `booking_cancel_failed`

### Horses / Sessions

- `horse_photo_upload_attempted`
- `horse_photo_uploaded`
- `horse_photo_upload_failed`
- `horse_add_attempted`
- `horse_add_succeeded`
- `horse_add_failed`
- `horse_delete_soft`
  - `horse_id`
- `horse_delete_undone`
- `horse_delete_committed`
  - `horse_id`
- `horse_session_log_attempted`
  - `punch_type`
- `horse_session_logged`
  - `punch_type`
- `horse_session_log_failed`

## Suggested Dashboards

- Signup conversion:
  - `signup_code_requested` -> `signup_completed_client`
- Booking funnel:
  - `booking_request_attempted` -> `booking_request_succeeded`
- Revenue funnel:
  - `plan_checkout_clicked` -> `checkout_started`
- Operations:
  - `horse_add_succeeded`, `rider_created`, `session_logged`
