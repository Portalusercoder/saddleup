-- Students see only their own rider record; trainers/owners see all
DROP POLICY IF EXISTS "Stable members can view riders" ON riders;

CREATE POLICY "Trainers and owners can view all riders"
  ON riders FOR SELECT
  USING (
    stable_id = public.get_user_stable_id()
    AND public.get_user_role() IN ('owner', 'trainer')
  );

CREATE POLICY "Students can view own rider"
  ON riders FOR SELECT
  USING (profile_id = auth.uid());
