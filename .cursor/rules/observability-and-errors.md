---
name: observability-and-errors
description: Use when adding logging, error tracking, or product analytics — capture errors with context to Sentry, emit structured logs with a request/tenant id, and track key events without leaking PII or secrets.
---

# Observability & Errors

## Overview

You can't fix what you can't see. A production SaaS needs three signals: **error tracking** (Sentry) for exceptions with stack + context, **structured logs** (JSON with a correlation id) for tracing a request, and **product analytics** (PostHog) for what users actually do. Add a global error boundary, attach tenant/user/request context to every signal, and scrub secrets and PII before anything leaves the process.

## When to use

- Standing up a new app's logging/monitoring.
- Debugging issues you can't reproduce locally.
- You need to know which features are used or where users drop off.

## Structured logging with context

```ts
// src/server/log.ts
import "server-only";

export function logger(ctx: { requestId: string; orgId?: string; userId?: string }) {
  const base = { ...ctx, ts: new Date().toISOString() };
  return {
    info: (msg: string, data?: object) => console.log(JSON.stringify({ level: "info", msg, ...base, ...data })),
    error: (msg: string, err?: unknown) =>
      console.error(JSON.stringify({ level: "error", msg, ...base, err: serializeError(err) })),
  };
}
```

Generate a `requestId` per request and thread it (and `orgId`) through logs and into Sentry's scope — now one search reconstructs a whole request across services.

## Error tracking

```ts
import * as Sentry from "@sentry/nextjs";

Sentry.withScope((scope) => {
  scope.setTag("orgId", org.id);
  scope.setUser({ id: user.id });          // id only, not email/PII
  Sentry.captureException(err);
});
```

Use Next.js `error.tsx` / `global-error.tsx` boundaries to show a friendly fallback and report the error.

## Analytics (sparingly)

- Track **meaningful events** (`project_created`, `subscription_upgraded`), not every click.
- Identify by stable user id; set org as a group. Keep a typed event list so names don't drift.

## Pitfalls

- **Logging secrets/PII** — tokens, passwords, full request bodies, card data. Scrub before logging; send ids, not emails.
- **`console.log` soup** — unstructured strings are ungreppable. Emit JSON with a correlation id.
- **Swallowing errors** — `catch {}` hides outages. Capture with context, then handle.
- **No source maps in prod** — Sentry stack traces are useless without them; upload on build.
- **Tracking everything** — noisy analytics cost money and bury the signal. Track decisions, not clicks.

## Hand-off

Errors, logs, and events you can actually act on. `deployment-and-ci` wires source maps + env keys; `background-jobs` and `payments-stripe` report failures here.
