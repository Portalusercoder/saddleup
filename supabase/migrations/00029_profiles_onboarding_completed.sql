ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false;

UPDATE profiles
SET onboarding_completed = false
WHERE onboarding_completed IS NULL;
