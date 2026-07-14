---
name: multi-tenancy
description: Use when an app has organizations/teams/workspaces — resolve the active tenant from the session or URL, scope every query to it, and guarantee one tenant can never read or write another's data.
---

# Multi-Tenancy

## Overview

B2B SaaS is multi-tenant: users belong to **organizations**, and all data is owned by an org. The cardinal rule is **isolation** — no request may ever touch another tenant's rows. Use the **shared-database, shared-schema** model (an `org_id` column on every tenant table) and enforce scoping in one place: resolve the active org from the session, verify membership, and pass `orgId` into the data-access layer.

## When to use

- The app has teams, workspaces, or organizations.
- A user can belong to more than one org and switch between them.
- You're writing any query against tenant-owned data.

## Resolving the active org

```ts
// src/server/auth/active-org.ts
import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { memberships, organizations } from "@/server/db/schema";
import { requireSession } from "@/server/auth/require";

export async function requireOrg(slug: string) {
  const session = await requireSession();
  const [row] = await db
    .select({ org: organizations, role: memberships.role })
    .from(memberships)
    .innerJoin(organizations, eq(memberships.orgId, organizations.id))
    .where(and(eq(memberships.userId, session.user.id), eq(organizations.slug, slug)))
    .limit(1);

  if (!row) throw new Error("Not a member of this organization"); // 404/redirect
  return { org: row.org, role: row.role, user: session.user };
}
```

Route by org in the URL — `/(app)/[org]/...` — and call `requireOrg(params.org)` in the layout so **membership is checked before anything renders**.

## Isolation strategies (defense in depth)

- **App layer (required):** every DAL query filters by `org_id` (see `data-access-layer`).
- **Database layer (strong):** Postgres **Row-Level Security** with a `current_setting('app.org_id')` policy, so even a buggy query can't cross tenants.
- **Never trust a client-supplied `orgId`.** Derive it from a verified membership, not a form field or header.

## Pitfalls

- **Resolving org from a request body/header** — a user can forge it. Resolve from session + membership.
- **A single missing `org_id` filter** — one un-scoped query is a full cross-tenant breach. Centralize in the DAL.
- **Checking membership in the UI only** — re-check on the server for every action and route.
- **Global unique constraints that should be per-tenant** — e.g. project name unique per org, not globally; use composite unique indexes.
- **Leaking tenant existence** — return 404, not 403, for orgs the user can't access.

## Hand-off

A verified `{ org, role, user }` for the request. Feed `role` into `authorization-rbac` and `org.id` into every `data-access-layer` call.
