-- Incident reports for liability and insurance
-- Date, horse, rider, description, witnesses

CREATE TABLE incident_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stable_id UUID NOT NULL REFERENCES stables(id) ON DELETE CASCADE,
  incident_date DATE NOT NULL,
  horse_id UUID NOT NULL REFERENCES horses(id) ON DELETE CASCADE,
  rider_id UUID REFERENCES riders(id) ON DELETE SET NULL,
  rider_name TEXT,
  description TEXT NOT NULL,
  witnesses TEXT,
  location TEXT,
  severity TEXT CHECK (severity IN ('minor', 'moderate', 'serious')),
  reported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  follow_up_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_incident_reports_stable ON incident_reports(stable_id);
CREATE INDEX idx_incident_reports_date ON incident_reports(incident_date);
CREATE INDEX idx_incident_reports_horse ON incident_reports(horse_id);

ALTER TABLE incident_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stable members can view incident reports"
  ON incident_reports FOR SELECT
  USING (stable_id = public.get_user_stable_id());

CREATE POLICY "Trainers and owners can manage incident reports"
  ON incident_reports FOR ALL
  USING (stable_id = public.get_user_stable_id())
  WITH CHECK (
    stable_id = public.get_user_stable_id() AND
    public.get_user_role() IN ('owner', 'trainer')
  );

CREATE TRIGGER incident_reports_updated_at
  BEFORE UPDATE ON incident_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at();
