-- Parent / guardian portal (part 2)
-- Link riders to a guardian (parent) profile
ALTER TABLE riders ADD COLUMN IF NOT EXISTS guardian_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_riders_guardian ON riders(guardian_id);

-- Guardians can view riders they are guardian of
CREATE POLICY "Guardians can view own children"
  ON riders FOR SELECT
  USING (
    stable_id = public.get_user_stable_id()
    AND public.get_user_role() = 'guardian'
    AND guardian_id = auth.uid()
  );

-- Guardians can view bookings for their children (read-only)
CREATE POLICY "Guardians can view children bookings"
  ON bookings FOR SELECT
  USING (
    stable_id = public.get_user_stable_id()
    AND public.get_user_role() = 'guardian'
    AND rider_id IN (SELECT id FROM riders WHERE guardian_id = auth.uid())
  );

-- Restrict training punches: guardians only see their children's sessions
DROP POLICY IF EXISTS "Stable members can view punches" ON training_punches;
CREATE POLICY "Non-guardian stable members can view punches"
  ON training_punches FOR SELECT
  USING (
    horse_id IN (SELECT id FROM horses WHERE stable_id = public.get_user_stable_id())
    AND public.get_user_role() IN ('owner', 'trainer', 'student')
  );
CREATE POLICY "Guardians can view children punches"
  ON training_punches FOR SELECT
  USING (
    public.get_user_role() = 'guardian'
    AND rider_id IN (SELECT id FROM riders WHERE guardian_id = auth.uid())
  );
