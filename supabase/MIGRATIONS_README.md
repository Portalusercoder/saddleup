# Supabase migrations

## Applying migrations

**Option A – Supabase Dashboard**

1. Open your project → **SQL Editor**.
2. Paste and run the contents of any migration file (e.g. `00026_audit_logs.sql`) that hasn’t been applied yet.

**Option B – Supabase CLI (linked project)**

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

## Recent migrations

- **00026_audit_logs.sql** – Creates `audit_logs` for member_removed, horse_deleted, etc. Required for the audit logging used in the app.
