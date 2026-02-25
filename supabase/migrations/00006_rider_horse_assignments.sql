-- Rider-horse assignments: trainers assign horses to riders (students see "My Horses")
CREATE TABLE IF NOT EXISTS rider_horse_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stable_id UUID NOT NULL REFERENCES stables(id) ON DELETE CASCADE,
  rider_id UUID NOT NULL REFERENCES riders(id) ON DELETE CASCADE,
  horse_id UUID NOT NULL REFERENCES horses(id) ON DELETE CASCADE,
  suitability_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(rider_id, horse_id)
);

CREATE INDEX IF NOT EXISTS idx_rider_horse_rider ON rider_horse_assignments(rider_id);
CREATE INDEX IF NOT EXISTS idx_rider_horse_horse ON rider_horse_assignments(horse_id);
CREATE INDEX IF NOT EXISTS idx_rider_horse_stable ON rider_horse_assignments(stable_id);

-- RLS for rider_horse_assignments
ALTER TABLE rider_horse_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stable members can view assignments"
  ON rider_horse_assignments FOR SELECT
  USING (stable_id = public.get_user_stable_id());

CREATE POLICY "Trainers and owners can manage assignments"
  ON rider_horse_assignments FOR ALL
  USING (stable_id = public.get_user_stable_id())
  WITH CHECK (public.get_user_role() IN ('owner', 'trainer'));
