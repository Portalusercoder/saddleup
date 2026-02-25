# SaddleUp — Complete Features & Functions Reference

**Version:** 1.0  
**Last Updated:** February 2025

---

## Table of Contents

1. [Overview](#1-overview)
2. [User Roles & Permissions](#2-user-roles--permissions)
3. [Subscription Tiers & Limits](#3-subscription-tiers--limits)
4. [Authentication & Onboarding](#4-authentication--onboarding)
5. [Pages & Routes](#5-pages--routes)
6. [API Endpoints](#6-api-endpoints)
7. [Database Schema](#7-database-schema)
8. [Core Features](#8-core-features)
9. [Premium Features](#9-premium-features)
10. [Integrations](#10-integrations)

---

## 1. Overview

**SaddleUp** is a multi-tenant web application for horse and stable management. It enables stables to manage horses, riders, lessons, training sessions, health records, competitions, incident reports, and billing—all with role-based access control and subscription tiers.

### Key Characteristics

- **Multi-tenant:** Each stable is isolated; data is scoped by `stable_id`
- **Role-based:** Four roles—Owner, Trainer, Student, Guardian—each with distinct capabilities
- **Subscription-based:** Free, Starter, Stable, and Enterprise tiers with different limits and features
- **Integrations:** Supabase (auth, database, storage), Stripe (billing), Resend (email), OpenAI (AI workload suggestions)

---

## 2. User Roles & Permissions

### Role Summary

| Role | Description | Primary Capabilities |
|------|-------------|----------------------|
| **Owner** | Stable administrator | Full control: billing, workers, ID cards, stable logo, all trainer capabilities |
| **Trainer** | Instructor/staff | Horses, riders, bookings, schedule, analytics, matching, incidents, blocked slots |
| **Student** | Rider | Own rider profile, assigned horses, own bookings, training history, competitions |
| **Guardian** | Parent/guardian | Read-only Parent Portal: children's riders, lessons, training sessions |

### Detailed Permissions by Role

#### Owner
- Create and manage stable
- Manage subscription and billing (Stripe)
- Upload stable logo
- Add and manage workers (Enterprise tier)
- Upload ID cards for riders and members
- All Trainer permissions

#### Trainer
- Add, edit, delete horses
- Add, edit, delete riders
- Create and manage bookings (approve/decline student requests)
- View and manage schedule
- Block time slots
- Access analytics (Starter+)
- Access horse–rider matching (Stable+)
- Create and manage incident reports
- Add members by invite code (student, trainer, guardian)
- Link guardians to riders

#### Student
- View and update own rider profile
- View assigned horses only
- Request lessons (bookings)
- View own bookings and training history
- View competitions

#### Guardian
- View children linked to their profile
- View children's upcoming lessons
- View children's recent training sessions
- Read-only access; no editing

---

## 3. Subscription Tiers & Limits

| Tier | Horses | Riders | Analytics | Matching | Price |
|------|--------|--------|-----------|----------|-------|
| **Free** | 2 | 10 | No | No | $0 |
| **Starter** | 5 | 25 | Yes | No | $19.99/mo |
| **Stable** | 50 | 200 | Yes | Yes | $49.99/mo |
| **Enterprise** | 9999 | 9999 | Yes | Yes | Contact |

### Feature Differences by Tier

- **Analytics (Starter+):** Workload charts, session stats, cost per horse, total care cost
- **Horse–Rider Matching (Stable+):** Compatibility suggestions based on horse suitability and rider level
- **Workers (Enterprise only):** Add and manage workers (staff) for the stable

---

## 4. Authentication & Onboarding

### Auth Flow

1. **Sign up:** User signs up via Supabase Auth (email/password)
2. **Complete signup:** User selects role (owner, trainer, student, guardian) and either:
   - **Owner:** Creates a new stable
   - **Trainer/Student/Guardian:** Joins existing stable via invite code (stable code or personal ID)
3. **Profile creation:** Profile is created with `stable_id`, `role`, and optional metadata
4. **Redirect:** User is redirected to dashboard based on role

### Invite System

- **Stable invite code:** Unique code per stable; trainers/students/guardians use it to join
- **Personal ID (invite code):** Each user has a personal code; trainers/owners can add members by entering this code (Add Member by ID)

### Auth Routes

| Route | Purpose |
|-------|---------|
| `/login` | Login |
| `/signup` | Signup (owner/trainer/student/guardian) |
| `/confirm-email` | Post-signup email confirmation |
| `/get-my-id` | Look up personal invite code |
| `/removed` | Shown when profile not found (e.g., removed from stable) |

---

## 5. Pages & Routes

### Public

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, features, pricing, AuthModal |

### Dashboard (Authenticated, Role-Based)

| Route | Access | Description |
|-------|--------|-------------|
| `/dashboard` | All | Main dashboard; content varies by role |
| `/dashboard/horses` | Trainer, Owner | Horse list |
| `/dashboard/horses/[id]` | Trainer, Owner, Student (assigned) | Horse detail; AI workload suggestions |
| `/dashboard/my-horses` | Student | Assigned horses only |
| `/dashboard/bookings` | All | Bookings (create, approve, decline) |
| `/dashboard/schedule` | Trainer, Owner, Student | Schedule view |
| `/dashboard/analytics` | Trainer, Owner (Starter+) | Analytics dashboard |
| `/dashboard/matching` | Trainer, Owner (Stable+) | Horse–rider matching |
| `/dashboard/incidents` | Trainer, Owner | Incident reports |
| `/dashboard/competitions` | All | Competitions |
| `/dashboard/training-history` | Student | Own training history |
| `/dashboard/guardian` | Guardian | Parent Portal (children, lessons, sessions) |
| `/dashboard/team` | Trainer, Owner | Team overview |
| `/dashboard/team/riders` | Trainer, Owner | Riders list |
| `/dashboard/team/riders/[id]` | Trainer, Owner | Rider detail (includes guardian linking) |
| `/dashboard/team/trainers` | Trainer, Owner | Trainers list |
| `/dashboard/team/workers` | Owner (Enterprise) | Workers management |
| `/dashboard/profile` | All | User profile |
| `/dashboard/settings` | Owner | Billing & plan |

---

## 6. API Endpoints

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/complete-signup` | Finish signup (create stable or join via code) |

### Profile & Me

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile` | Get current user profile |
| PATCH | `/api/profile` | Update profile |
| POST | `/api/profile/upload-avatar` | Upload avatar |
| GET | `/api/me/rider` | Current user's rider record |
| GET | `/api/me/invite-code` | Personal invite code |

### Stable

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stable` | Stable info |
| POST | `/api/stable/upload-logo` | Stable logo upload (owner) |

### Horses

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/horses` | List horses |
| POST | `/api/horses` | Create horse |
| GET | `/api/horses/[id]` | Get horse |
| PATCH | `/api/horses/[id]` | Update horse |
| DELETE | `/api/horses/[id]` | Delete horse |
| POST | `/api/horses/upload-photo` | Horse photo upload |
| GET | `/api/horses/sessions` | Horse sessions |
| GET | `/api/horses/[id]/workload-suggestions` | AI workload suggestions (OpenAI) |

### Riders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/riders` | List riders |
| POST | `/api/riders` | Create rider |
| GET | `/api/riders/[id]` | Get rider |
| PATCH | `/api/riders/[id]` | Update rider (includes `guardian_id`) |
| DELETE | `/api/riders/[id]` | Delete rider |
| POST | `/api/riders/[id]/upload-id-card` | Rider ID card upload |
| GET | `/api/riders/[id]/sessions` | Rider sessions |

### Members (Profiles)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/members` | List members |
| POST | `/api/members/add-by-id` | Add member by invite code |
| GET | `/api/members/[id]` | Get member |
| PATCH | `/api/members/[id]` | Update member |
| POST | `/api/members/[id]/upload-id-card` | Member ID card upload |

### Workers (Enterprise)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/workers` | List workers |
| POST | `/api/workers` | Create worker |
| PATCH | `/api/workers/[id]` | Update worker |
| DELETE | `/api/workers/[id]` | Delete worker |

### Rider–Horse Assignments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rider-horse-assignments` | List assignments |
| POST | `/api/rider-horse-assignments` | Create assignment |
| DELETE | `/api/rider-horse-assignments/[id]` | Delete assignment |

### Bookings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings` | List bookings |
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings/[id]` | Get booking |
| PATCH | `/api/bookings/[id]` | Update booking (approve/decline) |
| DELETE | `/api/bookings/[id]` | Delete booking |

### Schedule & Blocked Slots

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/schedule` | Schedule data |
| GET | `/api/blocked-slots` | List blocked slots |
| POST | `/api/blocked-slots` | Create blocked slot |
| DELETE | `/api/blocked-slots/[id]` | Delete blocked slot |

### Competitions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/competitions` | List competitions |
| POST | `/api/competitions` | Create competition |
| GET | `/api/competitions/[id]` | Get competition |
| PATCH | `/api/competitions/[id]` | Update competition |
| DELETE | `/api/competitions/[id]` | Delete competition |

### Incident Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/incident-reports` | List incident reports |
| POST | `/api/incident-reports` | Create incident report |
| GET | `/api/incident-reports/[id]` | Get incident report |
| PATCH | `/api/incident-reports/[id]` | Update incident report |
| DELETE | `/api/incident-reports/[id]` | Delete incident report |

### Guardian Portal

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/guardian/children` | Children (riders) for current guardian |
| GET | `/api/guardian/profiles` | Guardian profiles for stable (trainers/owners) |

### Subscription & Billing

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/subscription` | Subscription status |
| POST | `/api/subscription/checkout` | Stripe checkout |
| POST | `/api/subscription/portal` | Stripe billing portal |
| POST | `/api/subscription/change-plan` | Change plan |
| POST | `/api/subscription/webhook` | Stripe webhook |

### Analytics & Matching

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics` | Analytics (Starter+; sessions, workload, costs) |
| GET | `/api/matching` | Horse–rider matching (Stable+) |

### Other

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | User notifications |
| GET | `/api/care-reminders` | Upcoming care (vaccinations, farrier, etc.) |
| GET | `/api/sessions` | Training sessions |
| GET | `/api/health` | Health check |
| GET | `/api/health/[id]` | Health check by ID |

---

## 7. Database Schema

### Core Tables

| Table | Purpose |
|-------|---------|
| `subscription_plans` | Plan definitions (free, starter, stable, enterprise) |
| `stables` | Multi-tenant stables (name, slug, tier, Stripe IDs) |
| `profiles` | Users (id, stable_id, role, full_name, email, avatar_url) |
| `horses` | Horses (name, breed, age, gender, temperament, health, etc.) |
| `riders` | Riders (name, email, level, goals, assigned_trainer_id, guardian_id) |
| `training_punches` | Training sessions (horse, rider, duration, type, intensity) |
| `bookings` | Lessons (horse, rider, trainer, date, time, status) |
| `health_logs` | Vet, vaccination, farrier, deworming, injury records |
| `competitions` | Competition events |
| `payments` | Stripe payment records |
| `rider_horse_assignments` | Links riders to assigned horses |
| `blocked_slots` | Unavailable time slots |
| `notifications` | Booking updates, reminders |
| `workers` | Enterprise workers |
| `incident_reports` | Incident reports (date, description, severity, horse, rider) |
| `user_invite_codes` | Personal invite codes per user |

### Enums

- `subscription_tier`: free, starter, stable, enterprise
- `user_role`: owner, trainer, student, guardian
- `horse_temperament`: calm, energetic, sensitive, beginner_safe
- `skill_level`: beginner, intermediate, advanced
- `training_status`: green, schooling, competition_ready
- `punch_type`: lesson, training, competition, rest, medical
- `discipline`: flatwork, jumping, trail, dressage
- `intensity`: light, medium, hard
- `health_log_type`: vet, vaccination, deworming, farrier, injury
- `booking_status`: scheduled, completed, cancelled, no_show, pending, declined

### Storage Buckets

- `horse-photos` — Horse photos
- `profile-avatars` — User avatars
- `stable-logos` — Stable logos
- `id-cards` — Rider and member ID cards

---

## 8. Core Features

### Horses

- **CRUD:** Add, edit, delete horses
- **Fields:** Name, breed, age, gender, color, markings, height, microchip, UELN, date of birth, temperament, skill level, training status, suitability, notes
- **Photo upload:** Horse photos stored in Supabase Storage
- **Health logs:** Vet, vaccination, farrier, deworming, injury with cost tracking
- **Sessions:** Training punches linked to horses
- **Cost per horse:** Sum of health log costs; shown on horse detail and analytics

### Riders

- **CRUD:** Add, edit, delete riders
- **Fields:** Name, email, phone, level, goals, assigned trainer, notes, instructor feedback
- **Profile link:** Riders can be linked to a profile (student)
- **Guardian link:** Riders can be linked to a guardian (parent)
- **ID card:** Optional ID card upload
- **Assignments:** Riders can be assigned to horses

### Bookings

- **Flow:** Students request lessons; trainers/owners approve or decline
- **Statuses:** scheduled, pending, declined, completed, cancelled, no_show
- **Fields:** Horse, rider, trainer, date, start time, duration, status, declined notes
- **Notifications:** Booking updates trigger notifications

### Schedule

- **View:** Calendar-style schedule of bookings
- **Blocked slots:** Trainers/owners can block unavailable times

### Training Sessions (Punches)

- **Types:** lesson, training, competition, rest, medical
- **Intensity:** light, medium, hard
- **Duration:** Minutes per session
- **RLS:** Students see own; guardians see children's; trainers/owners see all

### Health Logs

- **Types:** vet, vaccination, deworming, farrier, injury
- **Cost tracking:** Optional cost per log entry
- **Care reminders:** Upcoming vaccinations, farrier, etc. (next 30 days)

### Competitions

- **CRUD:** Add, edit, delete competitions
- **Fields:** Name, date, location, discipline, notes

### Incident Reports

- **CRUD:** Add, edit, delete incident reports (trainers/owners)
- **Fields:** Date, description, witnesses, location, severity (minor, moderate, serious), horse, rider, follow-up notes
- **Purpose:** Liability and insurance documentation

### Care Reminders

- **Source:** Health logs with due dates
- **Display:** Dashboard widget for trainers/owners
- **Overdue:** Highlighted when past due

### Workload Alerts

- **Logic:** Horses with >5 sessions in 7 days, ≥3 hard sessions, or ≥300 min in 7 days
- **Display:** Dashboard widget for trainers/owners

### Notifications

- **Types:** Booking approved/declined, reminders
- **Bell icon:** Notification count and list in navbar

---

## 9. Premium Features

### Analytics (Starter+)

- **Session stats:** Total sessions, sessions this week, average duration
- **Workload charts:** Horse workload over time
- **Cost per horse:** Bar chart of care costs per horse
- **Total care cost:** Aggregate stat
- **Locked on Free:** Upgrade prompt if tier is Free

### Horse–Rider Matching (Stable+)

- **Logic:** Compatibility based on horse suitability and rider level
- **Display:** Matching page with suggestions
- **Locked on Free/Starter:** Upgrade prompt

### AI Workload Suggestions (OpenAI)

- **Location:** Horse detail page
- **Input:** Recent sessions, health logs, horse profile
- **Output:** Suggested workload (rest, light, medium, hard)
- **Setup:** Requires `OPENAI_API_KEY`; shows "AI unavailable" if not configured or billing issue

### Workers (Enterprise)

- **CRUD:** Add, edit, delete workers
- **Purpose:** Staff management for larger stables

### Parent / Guardian Portal

- **Guardian role:** Parents sign up or are added by ID
- **Linking:** Trainers link guardian to rider on rider detail page
- **Portal:** Guardians see children list, upcoming lessons, recent sessions (read-only)
- **RLS:** Guardians only see data for riders where `guardian_id = auth.uid()`

---

## 10. Integrations

### Supabase

- **Auth:** Email/password signup and login
- **Database:** PostgreSQL with RLS
- **Storage:** Horse photos, avatars, stable logos, ID cards

### Stripe

- **Checkout:** Subscribe to Starter or Stable
- **Customer Portal:** Manage subscription, payment method
- **Webhooks:** Sync subscription status (created, updated, deleted)

### Resend

- **Email:** Booking confirmation, approval, decline (via Supabase Edge Function)
- **Setup:** See `docs/EMAIL_SETUP.md`

### OpenAI

- **Workload suggestions:** Horse detail page
- **Setup:** See `docs/AI_WORKLOAD_SETUP.md`

---

## Appendix: Migration Files

| Migration | Purpose |
|-----------|---------|
| 00001 | Initial schema (plans, stables, profiles, horses, riders, punches, bookings, health_logs, competitions, payments) |
| 00002 | RLS policies, `get_user_stable_id()`, `get_user_role()` |
| 00003 | horse-photos bucket |
| 00004 | profile-avatars bucket |
| 00005 | riders.profile_id |
| 00006 | rider_horse_assignments |
| 00007 | Student booking policies |
| 00008 | Student horse view RLS |
| 00009 | Student rider view RLS |
| 00010 | stables.invite_code |
| 00011 | user_invite_codes, generate_invite_code() |
| 00012 | booking_status: pending, declined; declined_notes |
| 00013 | blocked_slots |
| 00014 | notifications, create_notification() |
| 00015 | stables.logo_url, stable-logos bucket, workers |
| 00016 | Stable logos bucket |
| 00017 | riders.id_card_url, profiles.id_card_url, id-cards bucket |
| 00018 | incident_reports |
| 00019 | user_role: guardian enum |
| 00020 | riders.guardian_id, guardian RLS policies |

---

*End of SaddleUp Features Reference*
