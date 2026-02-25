-- Unique invite code per stable (owner) - 8-char alphanumeric, not derived from name
ALTER TABLE stables ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE;

-- Generate codes for existing stables
DO $$
DECLARE
  r RECORD;
  new_code TEXT;
  done BOOLEAN;
BEGIN
  FOR r IN SELECT id FROM stables WHERE invite_code IS NULL
  LOOP
    done := false;
    WHILE NOT done LOOP
      new_code := upper(substring(md5(random()::text || r.id::text) from 1 for 8));
      BEGIN
        UPDATE stables SET invite_code = new_code WHERE id = r.id;
        done := true;
      EXCEPTION WHEN unique_violation THEN
        NULL; -- retry with new random
      END;
    END LOOP;
  END LOOP;
END $$;

-- Ensure all stables have invite_code
ALTER TABLE stables ALTER COLUMN invite_code SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_stables_invite_code ON stables(invite_code);
