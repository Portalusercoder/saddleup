-- Newsletter: subscribers and sent campaigns
-- Supports both global (landing page) and per-stable newsletters

CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  full_name TEXT,
  stable_id UUID REFERENCES stables(id) ON DELETE CASCADE,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One email per global list, one email per stable
CREATE UNIQUE INDEX idx_newsletter_subscribers_unique_global ON newsletter_subscribers (lower(email)) WHERE stable_id IS NULL;
CREATE UNIQUE INDEX idx_newsletter_subscribers_unique_stable ON newsletter_subscribers (stable_id, lower(email)) WHERE stable_id IS NOT NULL;

CREATE INDEX idx_newsletter_subscribers_stable ON newsletter_subscribers(stable_id);
CREATE INDEX idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_subscribers_active ON newsletter_subscribers(stable_id) WHERE unsubscribed_at IS NULL;

-- Track sent newsletters (for history and automation)
CREATE TABLE newsletter_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stable_id UUID REFERENCES stables(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  recipient_count INT NOT NULL DEFAULT 0,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_newsletter_campaigns_stable ON newsletter_campaigns(stable_id);

-- RLS
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_campaigns ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe (insert) - no auth required for signup
CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers FOR INSERT
  WITH CHECK (true);

-- Owners/trainers can view and manage their stable's subscribers
CREATE POLICY "Stable owners can view their subscribers"
  ON newsletter_subscribers FOR SELECT
  USING (
    stable_id = public.get_user_stable_id()
    AND public.get_user_role() IN ('owner', 'trainer')
  );

-- Owners can update (e.g. unsubscribe) their subscribers
CREATE POLICY "Stable owners can update their subscribers"
  ON newsletter_subscribers FOR UPDATE
  USING (
    stable_id = public.get_user_stable_id()
    AND public.get_user_role() = 'owner'
  );

-- Owners can view their campaigns
CREATE POLICY "Stable owners can view their campaigns"
  ON newsletter_campaigns FOR SELECT
  USING (
    stable_id = public.get_user_stable_id()
    AND public.get_user_role() IN ('owner', 'trainer')
  );

-- Owners can insert campaigns (when sending)
CREATE POLICY "Stable owners can create campaigns"
  ON newsletter_campaigns FOR INSERT
  WITH CHECK (
    stable_id = public.get_user_stable_id()
    AND public.get_user_role() = 'owner'
  );
