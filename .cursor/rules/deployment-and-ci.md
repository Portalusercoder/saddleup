---
name: deployment-and-ci
description: Use when shipping a SaaS app to production — set up CI checks, preview deploys, environment/secret management, database migrations on release, and the health checks and rollback path that make deploys boring.
---

# Deployment & CI

## Overview

Shipping should be **boring**: every PR runs the same checks, merges get a preview, and main deploys automatically with migrations applied in order. Target **Vercel** (or Fly/Railway/containers) with secrets in the platform, a CI pipeline that gates merges, and a deterministic migration step on release. The goal is a fast, reversible path to production.

## When to use

- Setting up the deploy pipeline for a new app.
- Adding CI checks or preview environments.
- Coordinating database migrations with releases.

## CI pipeline

```yaml
# .github/workflows/ci.yml
name: CI
on: { pull_request: { branches: [main] }, push: { branches: [main] } }
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
      - run: npm run build
```

Gate merges on this workflow. Keep it fast (cache deps, run in parallel) so people actually wait for it.

## Releasing safely

- **Migrations on deploy:** run `drizzle-kit migrate` as a release step *before* the new code serves traffic; make migrations **backward-compatible** (expand-then-contract) so old and new code coexist during rollout.
- **Preview per PR:** Vercel builds a unique URL with its own env — review real behavior before merge.
- **Secrets in the platform**, scoped per environment (preview/prod). Never in the repo. Mirror `.env.example`.
- **Health check** (`/api/health`) verifying DB connectivity; wire it to uptime monitoring.
- **Rollback path:** keep the previous deploy one click away; never ship a destructive migration in the same release as the code that depends on it.

## Pitfalls

- **Destructive migration + code in one deploy** — a column drop breaks the still-running old version mid-rollout. Expand, deploy, then contract in a later release.
- **No CI gate** — broken `main` blocks everyone; require checks to pass before merge.
- **Secrets in the repo or build logs** — leak risk; use platform env and mask logs.
- **Skipping the build step in CI** — type errors and bad imports slip to production.
- **No health check or monitoring** — you learn about outages from users, not alerts.
- **Long, uncached CI** — people merge around it; keep it under a few minutes.

## Hand-off

A boring, reversible deploy pipeline. It applies `database-schema` migrations, injects `environment-and-config` secrets, and uploads source maps for `observability-and-errors`. This is the last skill in the stack — you're in production.
