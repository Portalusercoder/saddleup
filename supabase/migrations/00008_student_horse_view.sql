-- Students see only horses they're assigned to; trainers/owners see all
DROP POLICY IF EXISTS "Stable members can view horses" ON horses;

CREATE POLICY "Trainers and owners can view all horses"
  ON horses FOR SELECT
  USING (
    stable_id = public.get_user_stable_id()
    AND public.get_user_role() IN ('owner', 'trainer')
  );

CREATE POLICY "Students can view assigned horses"
  ON horses FOR SELECT
  USING (
    id IN (
      SELECT rha.horse_id
      FROM rider_horse_assignments rha
      JOIN riders r ON r.id = rha.rider_id AND r.profile_id = auth.uid()
    )
  );
