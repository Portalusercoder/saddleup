# Email Notifications Setup (Supabase + Resend)

Saddle Up sends email notifications when:
- **Booking confirmed** — Student receives email when a trainer approves their lesson
- **Booking declined** — Student receives email when a trainer declines their request
- **Lesson reminder** — Student receives email for lessons scheduled tomorrow

## 1. Resend (Email Provider)

1. Sign up at [resend.com](https://resend.com)
2. Create an API key at [Resend API Keys](https://resend.com/api-keys)
3. For testing: use `onboarding@resend.dev` (no domain setup needed)
4. For production: verify your domain in Resend → Domains

## 2. Deploy Edge Function

**Run all commands in Cursor's terminal** (Terminal → New Terminal) from your project folder.

### Step A: Install Supabase CLI (one-time)

```bash
npm install -g supabase
```

### Step B: Log in to Supabase (one-time)

```bash
supabase login
```

A browser window opens — sign in with your Supabase account.

### Step C: Link your project

```bash
cd /Users/omarvalki/Desktop/saddleup
supabase link --project-ref YOUR_PROJECT_REF
```

Replace `YOUR_PROJECT_REF` with your Reference ID from Supabase Dashboard → Settings → General.

### Step D: Set Resend API key as secret

```bash
supabase secrets set RESEND_API_KEY=re_your_actual_resend_key
```

Replace with your key from Resend.com → API Keys.

### Step E: Deploy the function

```bash
supabase functions deploy send-notification-email --no-verify-jwt
```

## 3. Add to your `.env` file

Open `.env` in your project and add (or update):

```
SUPABASE_SERVICE_ROLE_KEY=eyJ...your_service_role_key...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- **SUPABASE_SERVICE_ROLE_KEY**: Supabase Dashboard → Settings → API → `service_role` (click to reveal)
- **NEXT_PUBLIC_APP_URL**: `http://localhost:3000` for dev, your domain for production

## 4. Test

1. Run `npm run dev`
2. Log in as trainer/owner
3. Approve or decline a student's booking
4. Student should receive email (use `onboarding@resend.dev` → only sends to your Resend account email)

## Troubleshooting

- **"Access token not provided"**: Run `supabase login` first
- **"command not found: supabase"**: Run `npm install -g supabase`
- **No emails sent**: Check spam; ensure student profile has email; verify `RESEND_API_KEY` in Supabase secrets
- **401 on invoke**: Ensure `SUPABASE_SERVICE_ROLE_KEY` is in `.env`
- **Invalid from address**: Use `onboarding@resend.dev` for testing
