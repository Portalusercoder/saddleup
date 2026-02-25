-- Add pending and declined status for booking approval flow
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'booking_status'::regtype AND enumlabel = 'pending') THEN
    ALTER TYPE booking_status ADD VALUE 'pending';
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'booking_status'::regtype AND enumlabel = 'declined') THEN
    ALTER TYPE booking_status ADD VALUE 'declined';
  END IF;
END $$;

-- Custom notes when owner/trainer declines a request
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS declined_notes TEXT;

-- Students create as pending; trainers/owners create as scheduled (handled in API)
