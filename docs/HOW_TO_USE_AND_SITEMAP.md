# How to use Saddle Up — Sitemap & site architecture

This document explains how visitors and signed-in users move through the product, lists public URLs (sitemap-oriented), and summarizes how the app is structured in code.

---

## 1. Who uses what

| Audience | Typical entry | What they do |
|----------|----------------|--------------|
| **Visitor** | Home, blog, contact | Learn about the product; subscribe to newsletter; reach out. |
| **New user** | Sign up | Choose role, verify email (8-digit code), set password, complete stable setup or join a stable. |
| **Owner** | Dashboard | Create/manage stable, team, horses, bookings, billing, notices, etc. |
| **Trainer** | Dashboard | Schedule, horses, riders, sessions, bookings (per stable permissions). |
| **Student** | Dashboard | Lessons, assigned horses, bookings, competitions, “My horses” where applicable. |
| **Guardian** | Dashboard → Parent portal | View linked children’s activity (separate guardian experience). |

Authenticated users hitting `/`, `/login`, or `/signup` are redirected to `/dashboard` by middleware when already signed in.

---

## 2. How to use the website (flows)

### 2.1 Public marketing & content

1. Open the **home page** (`/`) for the main pitch and calls to action.
2. Use **Blog** (`/blog` and individual posts) for SEO and deeper guides.
3. Use **Contact** (`/contact`) for inbound questions or partnerships.
4. **Newsletter unsubscribe** (`/newsletter/unsubscribe`) is for recipients leaving the list (linked from emails).

### 2.2 Sign up (any role)

1. Go to **`/signup`**.
2. Pick **Owner**, **Trainer**, **Student**, or **Guardian**.
3. Enter details (owners also enter **stable name** or an **enterprise invite code** when applicable).
4. Submit to receive an **8-digit code** by email (no link required for the main OTP path).
5. Enter the code, set **password**, then:
   - **Owner**: backend creates (or attaches) stable + profile.
   - **Trainer / student / guardian**: confirm the stable preview, then complete join.

Optional: **`/signup?code=...`** pre-fills an enterprise-style code and sets role to owner when you use that onboarding link.

### 2.3 Sign in & password recovery

- **`/login`** — email + password.
- **`/forgot-password`** — request reset; follow email instructions and API-backed confirmation.
- **`/confirm-email`** — email confirmation flow when Supabase sends a link-style confirmation.
- **`/auth/callback`** — OAuth / magic-link style returns (server route).

### 2.4 Dashboard (after login)

Base path: **`/dashboard`**.

- **Home dashboard** — overview, stats, care reminders, quick links; first-time **guided tour** until onboarding is marked complete.
- **Horses** (`/dashboard/horses`, `/dashboard/horses/[id]`) — list, detail, sessions, workload-related UI.
- **Bookings** (`/dashboard/bookings`) — scheduling and requests.
- **Schedule** (`/dashboard/schedule`) — calendar-oriented view.
- **Activity** (`/dashboard/activity`) — recent activity feed.
- **Analytics** (`/dashboard/analytics`) — stable-level insights.
- **Training history** (`/dashboard/training-history`) — historical training data.
- **Competitions** (`/dashboard/competitions`).
- **Matching** (`/dashboard/matching`) — horse/rider matching where enabled.
- **Incidents** (`/dashboard/incidents`) — incident reporting.
- **Notices** (`/dashboard/notices`) — stable announcements.
- **Plans** (`/dashboard/plans`) — subscription / billing UI.
- **Settings** (`/dashboard/settings`) — account and app preferences.
- **Profile** (`/dashboard/profile`) — user profile and related actions.
- **Newsletter** (`/dashboard/newsletter`) — stable newsletter tools (where permitted).
- **My horses** (`/dashboard/my-horses`) — student-oriented horse list.
- **Team** (`/dashboard/team`) — hub for stable team.
  - **Trainers** (`/dashboard/team/trainers`)
  - **Riders** (`/dashboard/team/riders`, `/dashboard/team/riders/[id]`)
  - **Workers** (`/dashboard/team/workers`) — enterprise-oriented staff list.
- **Guardian** (`/dashboard/guardian`) — parent portal when role is guardian.
- **Reactivate** (`/dashboard/reactivate`) — account reactivation after deletion-related flows.

### 2.5 Utility / edge auth pages

- **`/get-my-id`** — help users find their personal invite ID for owners/trainers to add them.
- **`/removed`** — state after account removal (with middleware exception so it can render while logged in).

### 2.6 Admin

- **`/admin`** — internal admin UI (protected by your admin layout/auth; not part of the public sitemap).

---

## 3. Sitemap (URL inventory)

### 3.1 Included in `app/sitemap.ts` (SEO sitemap)

These are the URLs emitted for search engines (see `NEXT_PUBLIC_APP_URL`, default production host in code):

| Path | Purpose |
|------|---------|
| `/` | Home |
| `/blog` | Blog index |
| `/blog/stable-management-ksa-gcc` | Article |
| `/blog/stable-operations-playbook` | Article |
| `/blog/lesson-scheduling-horse-workload` | Article |
| `/contact` | Contact |
| `/newsletter/unsubscribe` | Unsubscribe |

**Note:** Auth and dashboard routes are generally **noindex** or omitted from the marketing sitemap on purpose (private app surfaces).

### 3.2 All first-party page routes (App Router)

Public / marketing:

- `/`
- `/blog`, `/blog/stable-management-ksa-gcc`, `/blog/stable-operations-playbook`, `/blog/lesson-scheduling-horse-workload`
- `/contact`
- `/newsletter/unsubscribe`

Auth:

- `/login`, `/signup`, `/forgot-password`, `/confirm-email`, `/removed`, `/get-my-id`

Dashboard (requires session; middleware sends unauthenticated users to `/login`):

- `/dashboard`
- `/dashboard/horses`, `/dashboard/horses/[id]`
- `/dashboard/bookings`
- `/dashboard/schedule`
- `/dashboard/activity`
- `/dashboard/analytics`
- `/dashboard/training-history`
- `/dashboard/competitions`
- `/dashboard/matching`
- `/dashboard/incidents`
- `/dashboard/notices`
- `/dashboard/plans`
- `/dashboard/settings`
- `/dashboard/profile`
- `/dashboard/newsletter`
- `/dashboard/my-horses`
- `/dashboard/guardian`
- `/dashboard/reactivate`
- `/dashboard/team`, `/dashboard/team/trainers`, `/dashboard/team/riders`, `/dashboard/team/riders/[id]`, `/dashboard/team/workers`

Admin:

- `/admin`

Auth handler (not a marketing “page” but a URL):

- `/auth/callback` (route handler)

---

## 4. Site architecture (technical)

### 4.1 Stack (high level)

- **Framework:** Next.js (App Router) — `app/`
- **UI:** React client components where needed; server components elsewhere
- **Auth & database:** Supabase (Auth + Postgres + RLS); server client in API routes and middleware
- **Payments:** Subscription APIs under `app/api/subscription/*` (e.g. checkout, portal, webhooks)

### 4.2 Route groups (filesystem)

| Group | Role |
|-------|------|
| `app/(auth)/` | Login, signup, password flows, shared auth layout |
| `app/dashboard/` | Authenticated product shell (`layout.tsx`), nav, and feature pages |
| `app/blog/` | Content + blog layout |
| `app/admin/` | Admin console layout |
| `app/api/` | REST-style route handlers (JSON), cron, webhooks |

### 4.3 Middleware

- File: `middleware.ts` → `lib/supabase/middleware.ts` (`updateSession`)
- Refreshes session on navigations; protects `/dashboard` (redirect to login); redirects signed-in users away from marketing auth pages to `/dashboard`
- **Auth API routes** under `/api/auth/*` are matched so session cookies stay consistent with the browser client after OTP/password steps.

### 4.4 API surface (by domain)

Grouped for mental model (not every path listed exhaustively—see `app/api/` for the full tree):

| Domain | Examples |
|--------|----------|
| **Auth / onboarding** | `complete-signup`, `check-signup-email`, `cleanup-incomplete-signup`, `resume-signup`, forgot-password |
| **Profile & account** | `profile`, `profile/upload-avatar`, `account/request-deletion`, `account/reactivate` |
| **Stable & members** | `stable`, `stables/preview-by-code`, `members`, `members/add-by-id`, `members/[id]`, `stable/upload-logo` |
| **Horses & media** | `horses`, `horses/[id]`, `horses/upload-photo`, `horses/sessions`, workload suggestions |
| **Riders & assignments** | `riders`, `riders/[id]`, sessions, `rider-horse-assignments`, ID card uploads |
| **Sessions & schedule** | `sessions`, `schedule`, `blocked-slots` |
| **Bookings** | `bookings`, `bookings/[id]` |
| **Care & health** | `care-reminders`, `health`, `health/[id]` |
| **Competitions** | `competitions`, `competitions/[id]` |
| **Notifications & notices** | `notifications`, `notices/send`, `notices/recipients` |
| **Incidents** | `incident-reports`, `incident-reports/[id]` |
| **Analytics & reports** | `analytics`, `reports/monthly` |
| **Matching** | `matching` |
| **Guardian** | `guardian/profiles`, `guardian/children` |
| **Newsletter** | `newsletter/subscribe`, `unsubscribe`, `subscribers`, `campaigns`, `send` |
| **Subscription** | `subscription`, `checkout`, `portal`, `webhook`, `cancel`, `change-plan` |
| **Workers (enterprise)** | `workers`, `workers/[id]` |
| **Partner / admin** | `partners/[slug]`, `admin/*` |
| **Cron** | `cron/newsletter-digest`, `cron/run-scheduled-deletions` |
| **Misc** | `contact`, `activity`, `news/horse-headlines`, `health` (ping) |

### 4.5 Data & auth boundaries

- **Browser:** `lib/supabase/client.ts` — `createBrowserClient` for interactive auth.
- **Server (RSC / route handlers):** `lib/supabase/server.ts` — cookies via `createServerClient`.
- **Privileged operations:** `lib/supabase/admin.ts` — service role only on the server (never exposed to the client).

---

## 5. Keeping this document accurate

When you add a new **`page.tsx`** under `app/` or a new public SEO URL, update:

1. This file (`docs/HOW_TO_USE_AND_SITEMAP.md`) — user-facing path and purpose.
2. `app/sitemap.ts` — if the URL should be indexed.

---

*Generated from the repository structure; adjust copy if product positioning changes.*
