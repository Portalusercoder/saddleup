-- Audit log for security-sensitive and admin actions.
-- Apply: run this file in Supabase SQL Editor, or use: supabase db push (after supabase login)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  stable_id UUID REFERENCES stables(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_stable_created ON audit_logs(stable_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_created ON audit_logs(actor_profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action, created_at DESC);

COMMENT ON TABLE audit_logs IS 'Log of member removals, role changes, horse deletions, booking decisions, subscription changes for debugging and security.';

-- RLS: only service role or stable owners can read their stable's logs (optional; tighten as needed)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can do anything on audit_logs"
  ON audit_logs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Stable members can read own stable audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    stable_id IN (
      SELECT stable_id FROM profiles WHERE id = auth.uid()
    )
  );
