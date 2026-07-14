---
name: transactional-email
description: Use when sending product email — wire up Resend (or Postmark/SES) with typed React Email templates, send from background jobs not the request path, and cover deliverability basics like SPF/DKIM and unsubscribe.
---

# Transactional Email

## Overview

SaaS apps send email constantly: verification, invites, receipts, password resets, alerts. Use a provider built for it (**Resend**, Postmark, or SES) with **React Email** for typed, previewable templates. Treat sending as a side effect: trigger it from a **background job**, not inline in the request, so a slow mail API never blocks the user or fails their action.

## When to use

- Sending verification, invite, receipt, reset, or notification emails.
- Building reusable, branded email templates.
- Email sends are slowing requests or failing them.

## Template + send

```tsx
// src/server/email/templates/Invite.tsx
import { Button, Html, Text } from "@react-email/components";

export function InviteEmail({ org, url }: { org: string; url: string }) {
  return (
    <Html>
      <Text>You've been invited to join {org}.</Text>
      <Button href={url}>Accept invite</Button>
    </Html>
  );
}
```

```ts
// src/server/email/send.ts
import "server-only";
import { Resend } from "resend";
import { env } from "@/env";
import { InviteEmail } from "./templates/Invite";

const resend = new Resend(env.RESEND_API_KEY);

export async function sendInvite(to: string, org: string, url: string) {
  const { error } = await resend.emails.send({
    from: "Acme <noreply@acme.com>",
    to,
    subject: `Join ${org} on Acme`,
    react: InviteEmail({ org, url }),
  });
  if (error) throw new Error(`Email failed: ${error.message}`);
}
```

Call `sendInvite` from a **job/queue** (see `background-jobs`), and the action just enqueues it.

## Deliverability essentials

- **Verify your domain** and set **SPF + DKIM + DMARC** records — without them you land in spam.
- **Send from a real domain** (`noreply@yourapp.com`), not a free inbox.
- **Include unsubscribe** for anything non-essential; keep transactional and marketing streams separate.
- **Idempotency keys** on critical sends (receipts) so retries don't double-send.

## Pitfalls

- **Sending inline in the request** — a 3s mail API call becomes a 3s user wait, and a mail outage fails signups. Enqueue it.
- **Skipping DKIM/SPF** — great templates still hit spam without authenticated domains.
- **Hard-coded HTML strings** — unmaintainable; use React Email components and preview them.
- **Leaking data across tenants** — render with explicit, validated recipient + org; never reuse a cached template with stale props.
- **No failure handling** — log and retry via the job system; surface nothing scary to the user.

## Hand-off

Reliable, typed email behind a service. `background-jobs` runs the actual send off the request path; `observability-and-errors` tracks failures.
