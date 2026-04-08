# Saddle Up Security Review v1

Use this checklist before launch and then monthly.

## How to Run

- Record date, reviewer, environment, and commit SHA.
- For each item, mark: `Pass`, `Fail`, or `N/A`.
- Add links to proof (screenshots, logs, Sentry issue URLs, request/response samples).
- Any `Fail` becomes a high-priority Linear issue.

## Review Metadata

- Date:
- Reviewer:
- Environment: `production` / `preview`
- Release / commit:

## 1) External Security Posture

- [ ] Run [securityheaders.com](https://securityheaders.com) scan and save results.
- [ ] Run [SSL Labs](https://www.ssllabs.com/ssltest/) and confirm no critical TLS issues.
- [ ] Confirm no mixed content warnings in browser console on main pages.

Evidence:

## 2) Auth & Authorization

- [ ] Unauthenticated request to protected API routes returns 401/403.
- [ ] User with wrong role cannot access owner/admin actions.
- [ ] Admin-only routes enforce admin check consistently.
- [ ] Session expiration / invalid token paths fail safely.

Evidence:

## 3) Input Validation & Sanitization

- [ ] Send malformed JSON to writable endpoints; API returns safe validation errors.
- [ ] Send oversized request body; API rejects safely.
- [ ] Send invalid types (string for number, bad UUID, etc.); API rejects.
- [ ] Confirm no raw DB/internal stack traces leak in responses.

Evidence:

## 4) Rate Limiting & Abuse Resistance

- [ ] Trigger repeated requests on login/forgot-password/contact and verify 429 behavior.
- [ ] Confirm `Retry-After` is returned when applicable.
- [ ] Confirm high-risk send endpoints (notices/newsletter) are throttled.

Evidence:

## 5) CORS & Browser Security

- [ ] Allowed origins succeed from expected frontend domains.
- [ ] Unknown origin gets blocked for API routes.
- [ ] `Access-Control-Allow-Credentials` behavior matches intended auth flow.

Evidence:

## 6) Data Access Control (IDOR checks)

- [ ] Try accessing another stable's resource IDs; access is denied.
- [ ] Try updating/deleting resources not owned by user; access is denied.
- [ ] Verify list endpoints are scoped to current user/stable.

Evidence:

## 7) File Upload & Content Safety

- [ ] Upload invalid mime type; request is rejected.
- [ ] Upload over-size file; request is rejected.
- [ ] Uploaded URL/content cannot execute script payloads.

Evidence:

## 8) Secrets & Configuration Hygiene

- [ ] No live secrets in git-tracked files.
- [ ] Exposed API keys have been rotated (if any leak happened).
- [ ] Production secrets exist in Vercel env vars and are not duplicated in code.

Evidence:

## 9) Dependencies & Supply Chain

- [ ] Run `npm audit`; triage high/critical vulnerabilities.
- [ ] Review Dependabot/security alerts and create fixes for actionable items.
- [ ] Confirm lockfile changes are intentional.

Evidence:

## 10) Monitoring & Incident Readiness

- [ ] Sentry captures client and server test errors.
- [ ] Sentry alert rules are configured (new issue, regression, error spike).
- [ ] On-call destination (email/Slack) receives test alert.
- [ ] Runbook/rollback doc is available and current.

Evidence:

## Exit Criteria

- [ ] No unresolved critical/high security findings.
- [ ] Launch blockers converted to tracked Linear issues with owners.
- [ ] Final sign-off by owner/reviewer.
