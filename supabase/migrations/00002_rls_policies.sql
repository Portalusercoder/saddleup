-- Row Level Security: Multi-tenant isolation
-- All policies enforce stable_id match via user's profile

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read subscription plans"
  ON subscription_plans FOR SELECT USING (true);

ALTER TABLE stables ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE horses ENABLE ROW LEVEL SECURITY;
ALTER TABLE riders ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_punches ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Helper: get current user's stable_id
CREATE OR REPLACE FUNCTION public.get_user_stable_id()
RETURNS UUID AS $$
  SELECT stable_id FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ==================== STABLES ====================

CREATE POLICY "Users can view own stable"
  ON stables FOR SELECT
  USING (id = public.get_user_stable_id());

CREATE POLICY "Owners can update own stable"
  ON stables FOR UPDATE
  USING (id = public.get_user_stable_id())
  WITH CHECK (public.get_user_role() = 'owner');

-- ==================== PROFILES ====================

CREATE POLICY "Users can view profiles in same stable"
  ON profiles FOR SELECT
  USING (stable_id = public.get_user_stable_id());

CREATE POLICY "Owners can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (stable_id = public.get_user_stable_id() AND public.get_user_role() = 'owner');

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ==================== HORSES ====================

CREATE POLICY "Stable members can view horses"
  ON horses FOR SELECT
  USING (stable_id = public.get_user_stable_id());

CREATE POLICY "Trainers and owners can insert horses"
  ON horses FOR INSERT
  WITH CHECK (stable_id = public.get_user_stable_id() AND public.get_user_role() IN ('owner', 'trainer'));

CREATE POLICY "Trainers and owners can update horses"
  ON horses FOR UPDATE
  USING (stable_id = public.get_user_stable_id())
  WITH CHECK (public.get_user_role() IN ('owner', 'trainer'));

CREATE POLICY "Owners can delete horses"
  ON horses FOR DELETE
  USING (stable_id = public.get_user_stable_id() AND public.get_user_role() = 'owner');

-- ==================== RIDERS ====================

CREATE POLICY "Stable members can view riders"
  ON riders FOR SELECT
  USING (stable_id = public.get_user_stable_id());

CREATE POLICY "Trainers and owners can manage riders"
  ON riders FOR ALL
  USING (stable_id = public.get_user_stable_id())
  WITH CHECK (public.get_user_role() IN ('owner', 'trainer'));

-- ==================== TRAINING PUNCHES ====================

CREATE POLICY "Stable members can view punches"
  ON training_punches FOR SELECT
  USING (
    horse_id IN (SELECT id FROM horses WHERE stable_id = public.get_user_stable_id())
  );

CREATE POLICY "Trainers and owners can insert punches"
  ON training_punches FOR INSERT
  WITH CHECK (
    horse_id IN (SELECT id FROM horses WHERE stable_id = public.get_user_stable_id())
    AND public.get_user_role() IN ('owner', 'trainer')
  );

CREATE POLICY "Trainers and owners can update punches"
  ON training_punches FOR UPDATE
  USING (
    horse_id IN (SELECT id FROM horses WHERE stable_id = public.get_user_stable_id())
    AND public.get_user_role() IN ('owner', 'trainer')
  );

CREATE POLICY "Trainers and owners can delete punches"
  ON training_punches FOR DELETE
  USING (
    horse_id IN (SELECT id FROM horses WHERE stable_id = public.get_user_stable_id())
    AND public.get_user_role() IN ('owner', 'trainer')
  );

-- ==================== BOOKINGS ====================

CREATE POLICY "Stable members can view bookings"
  ON bookings FOR SELECT
  USING (stable_id = public.get_user_stable_id());

CREATE POLICY "Trainers and owners can manage bookings"
  ON bookings FOR ALL
  USING (stable_id = public.get_user_stable_id())
  WITH CHECK (public.get_user_role() IN ('owner', 'trainer'));

-- ==================== HEALTH LOGS ====================

CREATE POLICY "Stable members can view health logs"
  ON health_logs FOR SELECT
  USING (
    horse_id IN (SELECT id FROM horses WHERE stable_id = public.get_user_stable_id())
  );

CREATE POLICY "Trainers and owners can manage health logs"
  ON health_logs FOR ALL
  USING (
    horse_id IN (SELECT id FROM horses WHERE stable_id = public.get_user_stable_id())
  )
  WITH CHECK (public.get_user_role() IN ('owner', 'trainer'));

-- ==================== COMPETITIONS ====================

CREATE POLICY "Stable members can view competitions"
  ON competitions FOR SELECT
  USING (stable_id = public.get_user_stable_id());

CREATE POLICY "Trainers and owners can manage competitions"
  ON competitions FOR ALL
  USING (stable_id = public.get_user_stable_id())
  WITH CHECK (public.get_user_role() IN ('owner', 'trainer'));

-- ==================== PAYMENTS ====================

CREATE POLICY "Owners can view payments"
  ON payments FOR SELECT
  USING (stable_id = public.get_user_stable_id() AND public.get_user_role() = 'owner');

CREATE POLICY "System can insert payments"
  ON payments FOR INSERT
  WITH CHECK (stable_id = public.get_user_stable_id());
