-- Stable logo URL (stores public URL after upload)
ALTER TABLE stables ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Storage bucket for stable logos (owners upload)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'stable-logos',
  'stable-logos',
  true,
  1048576,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- RLS: Anyone can view logos; only owners can upload/update/delete their stable's logo
CREATE POLICY "Anyone can view stable logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'stable-logos');

CREATE POLICY "Owners can upload stable logo"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'stable-logos'
    AND (storage.foldername(name))[1] = (SELECT stable_id::text FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );

CREATE POLICY "Owners can update stable logo"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'stable-logos'
    AND (storage.foldername(name))[1] = (SELECT stable_id::text FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );

CREATE POLICY "Owners can delete stable logo"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'stable-logos'
    AND (storage.foldername(name))[1] = (SELECT stable_id::text FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- Workers table (Enterprise only - no accounts, custom roles for tracking)
CREATE TABLE IF NOT EXISTS workers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stable_id UUID NOT NULL REFERENCES stables(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workers_stable ON workers(stable_id);

-- RLS: Only owners and trainers can manage workers (Enterprise tier checked in API)
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners and trainers can view workers"
  ON workers FOR SELECT
  USING (
    stable_id = (SELECT stable_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('owner', 'trainer')
  );

CREATE POLICY "Owners can manage workers"
  ON workers FOR ALL
  USING (
    stable_id = (SELECT stable_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'owner'
  )
  WITH CHECK (
    stable_id = (SELECT stable_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'owner'
  );
