-- 4-digit email codes for custom forgot-password flow (Resend + Supabase admin password update)
CREATE TABLE IF NOT EXISTS public.password_reset_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_codes_email_created
  ON public.password_reset_codes (email, created_at DESC);

ALTER TABLE public.password_reset_codes ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.password_reset_codes TO service_role;

-- Lookup auth user by email (server / service_role only; not granted to anon/authenticated)
CREATE OR REPLACE FUNCTION public.lookup_user_id_by_email(p_email text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = auth
AS $$
  SELECT id
  FROM auth.users
  WHERE lower(trim(email)) = lower(trim(p_email))
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.lookup_user_id_by_email(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lookup_user_id_by_email(text) TO service_role;
