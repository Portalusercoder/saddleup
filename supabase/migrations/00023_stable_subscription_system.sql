-- Trial and subscription lifecycle for stables

-- 1) New columns on stables
ALTER TABLE stables
  ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'trialing',
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS plan_type TEXT NOT NULL DEFAULT 'beta',
  ADD COLUMN IF NOT EXISTS grace_period_ends_at TIMESTAMPTZ;

-- 2) Backfill existing rows with a fresh 30-day trial + 7‑day grace
UPDATE stables
SET
  subscription_status = COALESCE(subscription_status, 'trialing'),
  trial_ends_at = COALESCE(trial_ends_at, now() + interval '30 days'),
  plan_type = COALESCE(plan_type, 'beta'),
  grace_period_ends_at = COALESCE(grace_period_ends_at, now() + interval '37 days');

-- 3) Defaults for new stables
ALTER TABLE stables
  ALTER COLUMN trial_ends_at SET DEFAULT (now() + interval '30 days'),
  ALTER COLUMN grace_period_ends_at SET DEFAULT (now() + interval '37 days');

-- 4) Daily job to expire trials after trial_ends_at
CREATE OR REPLACE FUNCTION public.expire_trialing_stables()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE stables
  SET subscription_status = 'expired'
  WHERE subscription_status = 'trialing'
    AND trial_ends_at IS NOT NULL
    AND trial_ends_at < now();
END;
$$;

-- Schedule the function daily at 03:00 UTC using pg_cron (if available)
DO $$
BEGIN
  -- Enable pg_cron extension if the project allows it
  BEGIN
    CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
  EXCEPTION
    WHEN insufficient_privilege THEN
      -- Ignore if we can't create the extension in this environment
      NULL;
  END;

  -- Register the cron job only if the cron schema/extension exists
  IF EXISTS (
    SELECT 1
    FROM pg_catalog.pg_extension
    WHERE extname = 'pg_cron'
  ) THEN
    PERFORM cron.schedule(
      'expire-trialing-stables-daily',
      '0 3 * * *',
      'SELECT public.expire_trialing_stables();'
    );
  END IF;
END;
$$;

