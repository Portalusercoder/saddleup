# Release Checklist

Use this before every production release.

## 1) Scope
- [ ] I wrote down what this release changes (1-3 bullets).
- [ ] I confirmed no secrets are in code or env commits.
- [ ] I know whether a database migration is needed.

## 2) Local Quality
- [ ] App runs locally.
- [ ] Critical flows tested: signup, login, dashboard load, add horse, bookings.
- [ ] Mobile quick check done: menu, notifications, padding, core pages.
- [ ] Lint and type checks pass.

## 3) Database Safety (If Applicable)
- [ ] Migration file created in `supabase/migrations`.
- [ ] Migration tested on staging database first.
- [ ] Change is backward-compatible (or rollout plan is defined).
- [ ] Rollback SQL or recovery plan prepared.

## 4) Staging Verification
- [ ] Feature branch deployed to staging.
- [ ] Tested with real-like data.
- [ ] No blocking console or server errors.
- [ ] API response times acceptable for key pages.

## 5) Pre-Production Guardrails
- [ ] Feature flags set correctly (if used).
- [ ] Error monitoring enabled (Vercel logs + Supabase logs).
- [ ] Backup/export snapshot done before risky schema changes.
- [ ] Release time chosen (low-traffic window).

## 6) Deployment
- [ ] Merge PR to `main`.
- [ ] Confirm production deployment succeeded.
- [ ] Run post-deploy smoke test:
  - [ ] Landing page loads.
  - [ ] Login/signup works.
  - [ ] Dashboard data loads.
  - [ ] One write action works (for example add horse or log session).

## 7) Post-Deploy (First 30 Minutes)
- [ ] Monitor errors/logs for spikes.
- [ ] Monitor slow endpoints.
- [ ] Confirm no auth/session regressions.
- [ ] Share release notes (internal or users if needed).

## 8) Rollback Plan
- [ ] Previous stable commit hash is noted.
- [ ] I know how to redeploy the previous stable build quickly.
- [ ] If DB changes cause breakage, run prepared recovery steps.

---

## Fast Command Routine
- [ ] `git checkout -b feature/<name>`
- [ ] Implement changes.
- [ ] Run checks locally.
- [ ] `git add . && git commit -m "..." && git push`
- [ ] Open PR and test staging.
- [ ] Merge to `main` and verify auto-deploy.
- [ ] Smoke test production immediately.
