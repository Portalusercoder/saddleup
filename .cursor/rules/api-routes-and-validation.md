---
name: api-routes-and-validation
description: Use when building API endpoints or server actions — validate every input with zod, return consistent typed JSON errors, set correct status codes, and authenticate/authorize before touching data.
---

# API Routes & Validation

## Overview

Every endpoint is an attack surface. The rule: **never trust input**. Validate the body, query, and params with **zod** at the boundary, parse into typed data, then run auth → authorization → data access. Return a **consistent error shape** with correct HTTP status codes so clients can handle failures predictably. This applies equally to App Router route handlers and Server Actions.

## When to use

- Building a route handler (`app/api/.../route.ts`) or a Server Action.
- Accepting any user/client input.
- You need predictable, typed error responses.

## Validated route handler

```ts
// src/app/api/projects/route.ts
import { z } from "zod";
import { requireOrg } from "@/server/auth/active-org";
import { authorize } from "@/server/auth/permissions";
import { createProject } from "@/server/services/projects";

const Body = z.object({ name: z.string().min(1).max(100) });

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return Response.json(
      { error: { code: "invalid_input", fields: parsed.error.flatten().fieldErrors } },
      { status: 422 },
    );
  }

  const slug = new URL(req.url).searchParams.get("org")!;
  const { org, role } = await requireOrg(slug);   // 401/404 inside
  authorize(role, "project:create");              // 403 inside

  const project = await createProject(org.id, parsed.data);
  return Response.json({ data: project }, { status: 201 });
}
```

## Consistent contract

- **Success:** `{ data }`. **Error:** `{ error: { code, message?, fields? } }`. Pick one shape and keep it everywhere.
- **Status codes:** 400/422 invalid input, 401 unauthenticated, 403 forbidden, 404 not found, 402 needs upgrade, 409 conflict, 429 rate-limited, 500 unexpected.
- **Server Actions:** validate with the same zod schema and return typed `{ ok: false, error }` for the form to render.

## Pitfalls

- **`as` casting instead of parsing** — `body as CreateInput` trusts the client; use `schema.parse`/`safeParse`.
- **Validating on the client only** — re-validate server-side; the client check is UX.
- **Leaking internals in errors** — return a code/message, log the stack server-side; never echo SQL or stack traces.
- **Wrong status codes** — returning 200 with an error body breaks client handling and retries.
- **Auth after the work** — check session/permission/limits *before* mutating, not after.
- **Reusing the same zod schema you forgot to bound** — cap string lengths and array sizes to prevent abuse.

## Hand-off

Typed, validated, authorized endpoints. They call `data-access-layer` for persistence and `subscription-billing` for limits; long work hands off to `background-jobs`.
