-- 1) Scheduled account/stable deletion (30-day delay; reactivate within window)
ALTER TABLE stables
  ADD COLUMN IF NOT EXISTS scheduled_deletion_at TIMESTAMPTZ;

-- 2) Store subscription period end for "X days left" when cancelled (optional; can also read from Stripe)
ALTER TABLE stables
  ADD COLUMN IF NOT EXISTS subscription_period_end TIMESTAMPTZ;

COMMENT ON COLUMN stables.scheduled_deletion_at IS 'When set, stable and related data will be deleted after this time. User can reactivate before then.';

-- 3) Function to delete stables whose scheduled_deletion_at has passed (run daily via cron or API)
CREATE OR REPLACE FUNCTION public.run_scheduled_stable_deletions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM stables
  WHERE scheduled_deletion_at IS NOT NULL
    AND scheduled_deletion_at <= now();
END;
$$;
