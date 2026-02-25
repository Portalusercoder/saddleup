-- Allow students to create and cancel their own bookings (rider_id = their rider)
-- Students cannot confirm or manage other bookings
-- Drop broad policy so students only see own bookings (trainers/owners use "manage" for SELECT)
DROP POLICY IF EXISTS "Stable members can view bookings" ON bookings;

CREATE POLICY "Students can view own bookings"
  ON bookings FOR SELECT
  USING (
    stable_id = public.get_user_stable_id()
    AND public.get_user_role() = 'student'
    AND rider_id IN (SELECT id FROM riders WHERE profile_id = auth.uid())
  );

CREATE POLICY "Students can insert own bookings"
  ON bookings FOR INSERT
  WITH CHECK (
    stable_id = public.get_user_stable_id()
    AND public.get_user_role() = 'student'
    AND rider_id IN (SELECT id FROM riders WHERE profile_id = auth.uid())
  );

CREATE POLICY "Students can update own bookings"
  ON bookings FOR UPDATE
  USING (
    stable_id = public.get_user_stable_id()
    AND public.get_user_role() = 'student'
    AND rider_id IN (SELECT id FROM riders WHERE profile_id = auth.uid())
  )
  WITH CHECK (
    rider_id IN (SELECT id FROM riders WHERE profile_id = auth.uid())
  );
