-- Create stable-logos bucket and logo_url column
-- Run this in Supabase Dashboard → SQL Editor if you get "bucket not found" or "failed to update stable"

-- Add logo_url column to stables (if missing)
ALTER TABLE stables ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Create stable-logos bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'stable-logos',
  'stable-logos',
  true,
  1048576,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for stable logos
DROP POLICY IF EXISTS "Anyone can view stable logos" ON storage.objects;
CREATE POLICY "Anyone can view stable logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'stable-logos');

DROP POLICY IF EXISTS "Owners can upload stable logo" ON storage.objects;
CREATE POLICY "Owners can upload stable logo"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'stable-logos'
    AND (storage.foldername(name))[1] = (SELECT stable_id::text FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );

DROP POLICY IF EXISTS "Owners can update stable logo" ON storage.objects;
CREATE POLICY "Owners can update stable logo"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'stable-logos'
    AND (storage.foldername(name))[1] = (SELECT stable_id::text FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );

DROP POLICY IF EXISTS "Owners can delete stable logo" ON storage.objects;
CREATE POLICY "Owners can delete stable logo"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'stable-logos'
    AND (storage.foldername(name))[1] = (SELECT stable_id::text FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );
