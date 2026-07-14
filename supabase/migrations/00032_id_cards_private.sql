-- Make ID card storage private (auth + signed URLs only).
-- Existing objects keep their paths; app stores storage paths / uses /api/*/id-card.

UPDATE storage.buckets
SET public = false
WHERE id = 'id-cards';
