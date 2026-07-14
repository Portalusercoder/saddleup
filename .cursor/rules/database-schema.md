---
name: database-schema
description: Use when designing the Postgres schema or setting up Drizzle ORM — model users, organizations, memberships, and tenant-scoped tables with the right keys, indexes, timestamps, and migrations from day one.
---

# Database Schema

## Overview

Use **Drizzle ORM + Postgres**: schema is TypeScript, migrations are generated and version-controlled, and queries are fully typed. The single most important early decision for SaaS is the **tenancy model** — almost every table hangs off an `organization`. Model that now; retrofitting `organization_id` onto a live table is painful.

## When to use

- Setting up the database layer of a new app.
- Adding any table — especially tenant-owned data.
- Migrating from an untyped query builder or raw SQL.

## Core schema

```ts
// src/server/db/schema.ts
import { pgTable, uuid, text, timestamp, pgEnum, uniqueIndex, index } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["owner", "admin", "member"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const memberships = pgTable("memberships", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  orgId: uuid("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  role: roleEnum("role").notNull().default("member"),
}, (t) => ({
  userOrg: uniqueIndex("memberships_user_org").on(t.userId, t.orgId),
}));

// Tenant-owned table: ALWAYS carry org_id + index it.
export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  byOrg: index("projects_org_idx").on(t.orgId),
}));
```

## Rules of thumb

- **`org_id` on every tenant table**, indexed, with `onDelete: "cascade"` from organizations.
- **UUID PKs** (`defaultRandom`) avoid enumeration and merge conflicts; use `bigserial` only when you need ordered keys.
- **`timestamptz` everywhere** with `defaultNow()`. Store UTC; format in the UI.
- **Money as integer cents** (or `numeric`), never floats.
- **Index foreign keys and every column you filter/sort by.** Postgres doesn't auto-index FKs.

## Migrations

```bash
npx drizzle-kit generate   # diff schema -> SQL migration
npx drizzle-kit migrate    # apply to the database
```

Commit the generated SQL. Never hand-edit applied migrations; add a new one.

## Pitfalls

- **Forgetting `org_id`** — the table becomes a cross-tenant leak waiting to happen.
- **`push` to production** — use generated, reviewed `migrate`; `push` is for local prototyping.
- **Floats for money** — rounding errors in billing. Use cents.
- **No FK indexes** — joins and cascades get slow as data grows.
- **Naive timestamps** — `timestamp` without timezone causes off-by-hours bugs across regions.

## Hand-off

A typed, migratable schema. `data-access-layer` wraps it in tenant-scoped queries; `multi-tenancy` enforces isolation on top.
