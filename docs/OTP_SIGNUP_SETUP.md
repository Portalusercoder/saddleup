# OTP signup verification

Sign-up uses a **code sent by email** (e.g. 8 digits; length depends on your Supabase project) instead of a confirmation link. Users enter the code on the signup page, so it works from any device (e.g. open email on phone, enter code on laptop).

## Supabase setup

1. **Email template (required)**  
   In **Supabase Dashboard** → **Authentication** → **Email Templates**, edit the **Magic Link** template (used when we send the OTP):
   - Add the code to the body so users can copy it (Supabase may send 6 or 8 digits depending on config), for example:
     ```html
     <h2>Your verification code</h2>
     <p>Enter this code on the signup page:</p>
     <p><strong>{{ .Token }}</strong></p>
     <p>Code is valid for 1 hour. If you didn't request this, you can ignore this email.</p>
     ```
   - You can keep or remove the link (`{{ .ConfirmationURL }}`); the app only needs `{{ .Token }}` for the code step.

2. **Confirm email (optional)**  
   Under **Authentication** → **Providers** → **Email**, you can leave **Confirm email** on or off. Sign-up no longer uses the confirmation link; it uses OTP only. Turning **Confirm email** off avoids confusion if old links are still in emails.

3. **Rate limits**  
   Under **Authentication** → **Rate Limits**, you can relax “Email” limits for beta if users hit “too many requests” when requesting a code.

## Flow

1. User fills the signup form and clicks **Send verification code**.
2. Supabase sends an email with the 6-digit code (Magic Link template).
3. User enters the full code (e.g. 8 digits) on the same page (or another device) and clicks **Verify and create account**.
4. App creates their profile and logs them in.

No redirect URL or “open on same device” is required; the code works everywhere.
