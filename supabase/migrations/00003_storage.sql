-- Storage bucket for horse photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'horse-photos',
  'horse-photos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- RLS for horse-photos: path = {stable_id}/{horse_id}/{filename}
CREATE POLICY "Stable members can view horse photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'horse-photos'
    AND (storage.foldername(name))[1] = (SELECT stable_id::text FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Trainers and owners can upload horse photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'horse-photos'
    AND (storage.foldername(name))[1] = (SELECT stable_id::text FROM profiles WHERE id = auth.uid())
    AND public.get_user_role() IN ('owner', 'trainer')
  );

CREATE POLICY "Trainers and owners can update horse photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'horse-photos'
    AND (storage.foldername(name))[1] = (SELECT stable_id::text FROM profiles WHERE id = auth.uid())
    AND public.get_user_role() IN ('owner', 'trainer')
  );

CREATE POLICY "Owners can delete horse photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'horse-photos'
    AND (storage.foldername(name))[1] = (SELECT stable_id::text FROM profiles WHERE id = auth.uid())
    AND public.get_user_role() = 'owner'
  );
