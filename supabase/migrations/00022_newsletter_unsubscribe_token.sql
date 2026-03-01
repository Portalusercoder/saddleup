-- Add unsubscribe token for one-click unsubscribe links
ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS unsubscribe_token TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_unsubscribe_token ON newsletter_subscribers(unsubscribe_token) WHERE unsubscribe_token IS NOT NULL;

-- Backfill existing rows with tokens
UPDATE newsletter_subscribers
SET unsubscribe_token = gen_random_uuid()::text
WHERE unsubscribe_token IS NULL;
