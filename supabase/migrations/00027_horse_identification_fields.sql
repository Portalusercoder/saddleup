-- Extended horse passport / identification (optional fields; existing rows stay NULL)
ALTER TABLE horses
  ADD COLUMN IF NOT EXISTS registered_name TEXT,
  ADD COLUMN IF NOT EXISTS passport_number TEXT,
  ADD COLUMN IF NOT EXISTS fei_id TEXT,
  ADD COLUMN IF NOT EXISTS studbook TEXT,
  ADD COLUMN IF NOT EXISTS horse_category TEXT,
  ADD COLUMN IF NOT EXISTS sire_name TEXT,
  ADD COLUMN IF NOT EXISTS dam_name TEXT,
  ADD COLUMN IF NOT EXISTS country_of_birth TEXT;

COMMENT ON COLUMN horses.registered_name IS 'Official / passport competition name if different from barn name';
COMMENT ON COLUMN horses.passport_number IS 'National passport or breed registration number (separate from UELN when applicable)';
COMMENT ON COLUMN horses.fei_id IS 'FEI human athlete/equine registration number when applicable';
COMMENT ON COLUMN horses.studbook IS 'Breed society or studbook (e.g. KWPN, AES, Zangersheide)';
COMMENT ON COLUMN horses.horse_category IS 'Animal category: riding horse, pony, draft, etc.';
