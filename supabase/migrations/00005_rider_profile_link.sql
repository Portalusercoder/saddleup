-- Link riders to user profiles (for students to see "My Horses", "My Bookings")
ALTER TABLE riders ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_riders_profile ON riders(profile_id);

-- Students can only view their own rider record; trainers/owners see all in stable
-- (Existing RLS "Stable members can view riders" returns all - we'll filter in API for students)
