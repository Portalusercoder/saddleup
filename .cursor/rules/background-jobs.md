---
name: background-jobs
description: Use when work shouldn't run in the request path — offload emails, webhooks, exports, and scheduled tasks to a queue or job runner with retries, idempotency, and dead-letter handling instead of blocking the user.
---

# Background Jobs

## Overview

Anything slow, flaky, or scheduled belongs **off the request path**: sending email, processing uploads, calling third-party APIs, nightly rollups. Use a job system — **Inngest** or **Trigger.dev** (serverless-friendly), or **BullMQ + Redis** (self-hosted) — that gives you retries, backoff, and observability. The request just **enqueues** and returns; the worker does the work with idempotency so retries are safe.

## When to use

- A task takes more than ~1s or calls an external API that can fail.
- Scheduled/recurring work (digests, cleanup, syncing).
- Fan-out work (notify every member of an org).

## The pattern (Inngest-style)

```ts
// src/server/jobs/send-invite.ts
import { inngest } from "@/server/jobs/client";
import { sendInvite } from "@/server/email/send";

export const sendInviteJob = inngest.createFunction(
  { id: "send-invite", retries: 4 },                 // automatic backoff
  { event: "org/member.invited" },
  async ({ event, step }) => {
    await step.run("send-email", () =>
      sendInvite(event.data.email, event.data.org, event.data.url),
    );
  },
);
```

```ts
// in your action — return fast, do work later
await inngest.send({ name: "org/member.invited", data: { email, org, url } });
```

## Reliability rules

- **Idempotent handlers.** Key on a stable id so a retry doesn't double-send or double-charge.
- **Retries with backoff**, then a **dead-letter** path for poison jobs you can inspect and replay.
- **Scope every job to its tenant** — pass `orgId` in the payload and re-resolve, never assume.
- **Schedule with cron triggers** for recurring work instead of a hand-rolled timer.
- **Keep payloads small** — pass ids, fetch fresh data in the worker (avoids stale/oversized events).

## Pitfalls

- **`await`-ing slow work in the action** — blocks the user and couples success to a third party being up.
- **Non-idempotent workers** — retries duplicate emails/charges. Always key the side effect.
- **Fire-and-forget with no retries** — transient failures silently drop work; use a real queue.
- **Putting secrets/large blobs in the event** — reference them; fetch in the worker.
- **No visibility** — without job logs/metrics you can't tell a stuck queue from an empty one.

## Hand-off

Durable async work with retries. `transactional-email` and `file-uploads-and-storage` run here; `observability-and-errors` watches failures and dead-letters.
