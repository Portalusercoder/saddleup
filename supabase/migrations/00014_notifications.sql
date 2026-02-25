-- Notifications for booking updates and lesson reminders
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('booking_confirmed', 'booking_declined', 'lesson_reminder')),
  title TEXT NOT NULL,
  body TEXT,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_profile ON notifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(profile_id, created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "Users can update own notifications (mark read)"
  ON notifications FOR UPDATE
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- Inserts via create_notification() only (SECURITY DEFINER bypasses RLS)

CREATE OR REPLACE FUNCTION public.create_notification(
  p_profile_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_body TEXT DEFAULT NULL,
  p_booking_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
  v_actor_stable_id UUID;
  v_target_stable_id UUID;
BEGIN
  -- Actor must be in same stable as target
  SELECT stable_id INTO v_actor_stable_id FROM profiles WHERE id = auth.uid();
  SELECT stable_id INTO v_target_stable_id FROM profiles WHERE id = p_profile_id;
  IF v_actor_stable_id IS NULL OR v_target_stable_id IS NULL OR v_actor_stable_id != v_target_stable_id THEN
    RAISE EXCEPTION 'Cannot create notification for user in different stable';
  END IF;
  INSERT INTO notifications (profile_id, type, title, body, booking_id)
  VALUES (p_profile_id, p_type, p_title, p_body, p_booking_id)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
