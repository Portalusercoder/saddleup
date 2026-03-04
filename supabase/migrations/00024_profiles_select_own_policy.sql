-- Allow users to always read their own profile (fixes "removed" right after owner signup).
-- The existing policy "Users can view profiles in same stable" uses get_user_stable_id(),
-- which reads the current user's profile; in edge cases (e.g. right after signup) this
-- can fail. This policy guarantees you can read the row where id = auth.uid().
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());
