-- Blocked slots: trainers/owners block times when unavailable
CREATE TABLE IF NOT EXISTS blocked_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stable_id UUID NOT NULL REFERENCES stables(id) ON DELETE CASCADE,
  blocked_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blocked_slots_stable ON blocked_slots(stable_id);
CREATE INDEX IF NOT EXISTS idx_blocked_slots_date ON blocked_slots(blocked_date);

ALTER TABLE blocked_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers and owners can view blocked slots"
  ON blocked_slots FOR SELECT
  USING (
    stable_id = public.get_user_stable_id()
    AND public.get_user_role() IN ('owner', 'trainer')
  );

CREATE POLICY "Trainers and owners can manage blocked slots"
  ON blocked_slots FOR ALL
  USING (
    stable_id = public.get_user_stable_id()
    AND public.get_user_role() IN ('owner', 'trainer')
  )
  WITH CHECK (
    stable_id = public.get_user_stable_id()
    AND public.get_user_role() IN ('owner', 'trainer')
  );
