# Supabase Setup for Saddle Up

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key from Settings → API

## 2. Environment Variables

Create `.env.local` with:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 3. Run Migrations

**Option A: Supabase Dashboard**

1. Go to SQL Editor in your Supabase project
2. Run each migration file in order:
   - `supabase/migrations/00001_initial_schema.sql`
   - `supabase/migrations/00002_rls_policies.sql`
   - `supabase/migrations/00003_storage.sql`
   - `supabase/migrations/00004_profile_avatars.sql`

**Option B: Supabase CLI**

```bash
# Install Supabase CLI
npm install -g supabase

# Link project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

## 4. Seed Data (Optional)

Create a stable and profile for development:

```sql
-- Create a test stable
INSERT INTO stables (id, name, slug, subscription_tier, subscription_plan_id)
VALUES (
  'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  'Demo Stable',
  'demo-stable',
  'stable',
  'stable'
);

-- After signing up a user, get their auth.uid() and run:
-- INSERT INTO profiles (id, stable_id, role, full_name, email)
-- VALUES ('your-auth-user-id', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'owner', 'Demo Owner', 'you@example.com');
```

## 5. Auth Configuration

In Supabase Dashboard → Authentication → URL Configuration:

- Site URL: `http://localhost:3000` (dev) or your production URL
- Redirect URLs: Add `http://localhost:3000/**` and your production URL

## 6. Storage

The `horse-photos` bucket is created by migration 00003. Upload paths should follow:

```
{stable_id}/{horse_id}/{filename}
```

Example: `aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee/horse-uuid/photo.jpg`

The `profile-avatars` bucket (migration 00004) stores user profile pictures. Path format: `{user_id}/avatar.{ext}`
