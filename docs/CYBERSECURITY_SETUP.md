# Cybersecurity Setup — Global, UAE & Saudi Alignment

This document outlines how to align Saddle Up with **global best practices** (OWASP, etc.) and **UAE / Saudi Arabia** regulatory expectations (NESA, NCA ECC-2/CCC-2, data protection). It is a roadmap, not legal advice; consult local counsel for formal compliance.

---

## 1. What You Already Have (Baseline)

| Area | Current state |
|------|----------------|
| **Auth** | Supabase Auth (email/password), session cookies, role-based access |
| **Data isolation** | Multi-tenant via `stable_id`; RLS on Supabase tables |
| **Secrets** | Env vars for keys (Vercel/Supabase); no keys in source |
| **Payments** | Stripe (PCI scope reduced; no card storage) |
| **HTTPS** | Enforced by Vercel in production |
| **API auth** | Server-side checks (getUser, profile role) on protected routes |

---

## 2. Global Standards (OWASP & Common Practice)

### 2.1 Access control (OWASP A01)

- **Done:** Dashboard gated by auth; API routes check user/role.
- **Do:** Keep enforcing “no access without auth” for `/dashboard` and all mutating APIs. Avoid exposing internal IDs in URLs where a user could guess another tenant’s data; your RLS and `stable_id` checks mitigate this.

### 2.2 Cryptography & sensitive data

- **Done:** HTTPS (Vercel); Supabase stores auth data; Stripe handles cards.
- **Do:**
  - Never log or send passwords, API keys, or tokens to the client.
  - Ensure production env uses strong `CRON_SECRET`, Stripe live keys only in production, and Resend key only server-side.

### 2.3 Injection & XSS

- **Done:** React escapes by default; Supabase client uses parameterized queries.
- **Do:** Keep using parameterized queries and avoid `dangerouslySetInnerHTML` with user input. For newsletter HTML from owners, treat it as trusted content only from authenticated owners and consider a strict HTML sanitizer if you allow rich input later.

### 2.4 Security headers

**Done.** `next.config.ts` sends these headers on all responses:

- **Strict-Transport-Security (HSTS)** — enforce HTTPS
- **X-Content-Type-Options: nosniff** — reduce MIME sniffing
- **X-Frame-Options: DENY** — reduce clickjacking
- **Referrer-Policy** — limit referrer information
- **Permissions-Policy** — restrict camera, microphone, geolocation

---

## 3. UAE (NESA / IA Regulation)

NESA’s Information Assurance framework applies especially to **government and critical infrastructure** in the UAE. Even if not mandatory for your product, aligning helps with enterprise and public-sector customers.

- **Identity & access:** Strong authentication and role-based access (you have this; adding MFA strengthens it).
- **Network/application security:** HTTPS, secure config, no unnecessary exposure of admin or debug endpoints.
- **Incident response:** Ability to detect and respond to incidents (logging, alerts, contact point).
- **Third-party risk:** Know your vendors (Supabase, Stripe, Vercel, Resend); use contracts and subprocessor lists where required.
- **Data protection:** Know where data lives (EU/US with Supabase/Vercel); document it in a privacy notice and, if required, DPAs.

**Action:** Document “Security & subprocessors” (Section 6) and ensure privacy policy and terms mention UAE where you operate.

---

## 4. Saudi Arabia (NCA ECC-2 / CCC-2)

The NCA’s Essential Cybersecurity Controls (ECC-2:2024) and Cloud Cybersecurity Controls (CCC-2:2024) set expectations for **organizations in KSA** and **cloud usage**. Key areas:

- **Governance:** Define roles (e.g. who is responsible for security); document policies (access, incident response, data retention).
- **Defense:** Secure configuration, MFA, least privilege, secure development (no hardcoded secrets, dependency checks).
- **Resilience:** Backups (Supabase has this), incident response plan, and recovery steps.
- **Third-party / cloud:** Use providers that offer compliance-relevant terms; document where data is processed and stored.

**Action:** Enable MFA where possible (Supabase supports it); add security headers; keep dependencies updated; document subprocessors and data flows.

---

## 5. Implementation Checklist

### 5.1 Security headers (Next.js)

**Implemented** in `next.config.ts`. All responses send HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, and Permissions-Policy. No action needed unless you want to add or change headers.

### 5.2 Multi-factor authentication (MFA)

- **Supabase:** Enable MFA in Supabase Dashboard (Authentication → Providers / MFA) and, if needed, guide users to enroll in the app.
- **Stripe / Vercel / Resend:** Use strong passwords and 2FA on those accounts.

### 5.3 Secrets and environment

- Never commit `.env` or any file containing secrets.
- Use different keys for development and production.
- Rotate keys if they may have been exposed; use Vercel/Supabase secret rotation where available.

### 5.4 Logging and monitoring

- Use Vercel logs and Supabase logs for errors and auth events.
- Optionally add a dedicated logging/monitoring service (e.g. Sentry) and define what you log (no passwords, no full payment data).
- Define an “incident” (e.g. data breach, major outage) and a simple response process (who to contact, when to notify users/authorities as per UAE/KSA rules).

### 5.5 Backups and resilience

- Rely on Supabase backups; confirm retention and recovery process.
- Document how to restore from backup and who can do it.

### 5.6 Dependency and vulnerability scanning

- Run `npm audit` regularly and fix high/critical issues.
- Consider Dependabot or similar for automated dependency updates and CVEs.

### 5.7 Data handling (UAE / Saudi alignment)

- **Privacy policy:** Publish a clear policy (what you collect, why, where it’s stored, retention, and rights).
- **Data location:** Document that data is stored in Supabase (and where Supabase hosts, e.g. region). If you later need UAE or Saudi hosting, you’ll need a provider/region that supports it.
- **Subprocessors:** List Supabase, Stripe, Vercel, Resend (and any others) in a “Subprocessors” or “Data processing” page and keep it updated.

---

## 6. Optional: Subprocessors / data processing page

If you target enterprises or regulated sectors in UAE/KSA, add a short page (e.g. `/privacy#subprocessors` or `/security`) with:

| Subprocessor | Purpose | Data location / notes |
|--------------|---------|------------------------|
| Supabase | Auth, database, storage | [e.g. US/EU – see Supabase docs] |
| Stripe | Payments | Global (see Stripe privacy) |
| Vercel | Hosting, serverless | Global |
| Resend | Transactional / newsletter email | US |

Update this when you add or change providers.

---

## 7. Summary

- **Global:** You already cover basics (auth, RLS, HTTPS, no card storage). Add security headers, keep dependencies and secrets safe, and avoid injection/XSS.
- **UAE:** Align with NESA-style good practice (access control, logging, third-party list, privacy policy) even if you’re not formally in scope.
- **Saudi:** Align with NCA-style expectations (MFA, governance, resilience, third-party/cloud documentation) and document data flows and subprocessors.

Implement the checklist in Section 5 step by step; start with headers, MFA, and documentation (privacy + subprocessors), then add logging and incident process. For formal UAE or Saudi compliance, engage a local legal/compliance advisor and, if needed, a qualified auditor.

---

## 8. SIEM and security event logging

SIEM (Security Information and Event Management) centralizes logs and security events for detection, alerting, and compliance. Options for Saddle Up:

### 8.1 Vercel-native options

- **Audit logs + SIEM (Vercel Enterprise)**  
  Team Settings → Security & Privacy → Audit Log. Stream audit logs to Datadog, Splunk, AWS S3, GCS, or a **custom HTTP endpoint**. Covers who did what in the Vercel dashboard (deploys, env changes, etc.), not application-level events.

- **Log Drains (Vercel Pro/Enterprise)**  
  Forward **runtime and build logs** to an HTTP endpoint or a marketplace integration (e.g. Datadog, OpenObserve). Good for `console.log`/errors from your app and serverless functions.

### 8.2 Application-level security events (this repo)

The app can send **structured security events** to a SIEM or log aggregator that accepts HTTP:

1. Set **`SIEM_WEBHOOK_URL`** in Vercel (and optionally **`SIEM_WEBHOOK_SECRET`** for an `Authorization` header).
2. Use the **security event logger** (`lib/security-logger.ts`) from API routes and middleware to emit events such as:
   - `auth_failure` (e.g. invalid login, missing token)
   - `access_denied` (403, wrong role)
   - `cron_invoked` (e.g. newsletter digest)
   - `newsletter_sent` (owner send)
   - `error` (e.g. 5xx or critical path failure)

Events are sent as JSON POSTs to your webhook. The endpoint can be:

- A **SIEM collector** (e.g. Splunk HTTP Event Collector, Datadog intake, Elastic Agent).
- A **log platform** (e.g. Better Stack, Axiom, Grafana Cloud) that forwards to a SIEM.
- Your own **small proxy** that forwards to a SIEM or stores logs for audit.

### 8.3 What to send (and what not to)

- **Do send:** event type, timestamp, path/method, status code, user id (or “anonymous”), stable_id when relevant, IP (if available from headers), and a short message. No passwords, tokens, or full PII.
- **Do not send:** request/response bodies, cookies, API keys, or personally identifiable data beyond what you need for audit (e.g. user id, stable id).

### 8.4 Setup steps

1. Choose a SIEM or log aggregator that accepts HTTP (or use Vercel Log Drains for general logs).
2. Create an HTTP endpoint (or use the provider’s “source” / “collector” URL) and, if required, an API key or secret.
3. In Vercel, add `SIEM_WEBHOOK_URL` (and optionally `SIEM_WEBHOOK_SECRET`).
4. Call `logSecurityEvent()` (or the helpers in `lib/security-logger.ts`) from critical paths. The newsletter digest cron and invalid unsubscribe attempts already emit events when `SIEM_WEBHOOK_URL` is set.
5. **Env vars:** `SIEM_WEBHOOK_URL` (required to enable sending), `SIEM_WEBHOOK_SECRET` (optional; sent as `Authorization: Bearer <secret>`).
