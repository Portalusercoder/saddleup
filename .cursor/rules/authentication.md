---
name: authentication
description: Use when adding sign-in/sign-up or session handling to a SaaS app — set up Auth.js (NextAuth) or a hosted provider with secure sessions, OAuth + email, and server-side session checks that protect routes and actions.
---

# Authentication

## Overview

Authentication is the gate to everything else, so don't hand-roll it. Use **Auth.js (NextAuth)** with the Drizzle adapter, or a hosted provider (Clerk/Supabase/WorkOS) if you want MFA and user management out of the box. The non-negotiables: httpOnly session cookies, server-side session resolution, and a single `requireSession()` helper used by every protected route and action.

## When to use

- Adding login, signup, OAuth, or magic-link auth.
- Protecting routes, server actions, or route handlers.
- Resolving "who is the current user/org" on the server.

## The pattern (Auth.js)

```ts
// src/server/auth/index.ts
import "server-only";
import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Google from "next-auth/providers/google";
import { db } from "@/server/db/client";
import { env } from "@/env";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  session: { strategy: "database" },
  secret: env.AUTH_SECRET,
  providers: [Google],
});
```

```ts
// src/server/auth/require.ts
import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";

export async function requireSession() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");
  return session;
}
```

Use it in a layout to protect a whole route group:

```ts
// src/app/(app)/layout.tsx
export default async function AppLayout({ children }) {
  await requireSession();            // server-side, runs before render
  return <>{children}</>;
}
```

## Security essentials

- **Sessions in httpOnly, Secure, SameSite=Lax cookies.** Never store tokens in `localStorage`.
- **Resolve sessions on the server** (`auth()` in components/actions), not from a client fetch you trust.
- **Rotate + expire.** Set sensible session max-age; support sign-out everywhere.
- **Hash passwords with argon2/bcrypt** only if you truly own credentials — prefer OAuth/magic-link.

## Pitfalls

- **Trusting client-side auth state for authorization** — it's a UX hint only; always re-check on the server.
- **JWT sessions when you need instant revocation** — use the database strategy if "log out all devices" matters.
- **Leaking whether an email exists** — keep sign-in errors generic (pair with `auth-screens` UX).
- **No CSRF protection on credential posts** — Auth.js handles this; don't bypass it with custom forms.
- **Protecting only the UI** — a route handler without a session check is wide open.

## Hand-off

A trustworthy `requireSession()`. `multi-tenancy` turns the user into an active org; `authorization-rbac` checks what that user may do.
