-- ID card uploads: owners upload ID images for riders and trainers
ALTER TABLE riders ADD COLUMN IF NOT EXISTS id_card_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS id_card_url TEXT;

-- Storage bucket for ID cards
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'id-cards',
  'id-cards',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Path format: {stable_id}/riders/{rider_id}/id.{ext} or {stable_id}/profiles/{profile_id}/id.{ext}
CREATE POLICY "Stable members can view id cards"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'id-cards'
    AND (storage.foldername(name))[1] = (SELECT stable_id::text FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Owners can upload id cards"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'id-cards'
    AND (storage.foldername(name))[1] = (SELECT stable_id::text FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );

CREATE POLICY "Owners can update id cards"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'id-cards'
    AND (storage.foldername(name))[1] = (SELECT stable_id::text FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );

CREATE POLICY "Owners can delete id cards"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'id-cards'
    AND (storage.foldername(name))[1] = (SELECT stable_id::text FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );
