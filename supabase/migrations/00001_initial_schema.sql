-- Saddle Up: Production Multi-Tenant Schema
-- Run this in Supabase SQL Editor or via supabase db push

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== ENUMS ====================

CREATE TYPE subscription_tier AS ENUM ('free', 'starter', 'stable', 'enterprise');
CREATE TYPE user_role AS ENUM ('owner', 'trainer', 'student');
CREATE TYPE horse_temperament AS ENUM ('calm', 'energetic', 'sensitive', 'beginner_safe');
CREATE TYPE skill_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE training_status AS ENUM ('green', 'schooling', 'competition_ready');
CREATE TYPE punch_type AS ENUM ('lesson', 'training', 'competition', 'rest', 'medical');
CREATE TYPE discipline AS ENUM ('flatwork', 'jumping', 'trail', 'dressage');
CREATE TYPE intensity AS ENUM ('light', 'medium', 'hard');
CREATE TYPE health_log_type AS ENUM ('vet', 'vaccination', 'deworming', 'farrier', 'injury');
CREATE TYPE booking_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');

-- ==================== SUBSCRIPTION PLANS ====================

CREATE TABLE subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  max_horses INT NOT NULL,
  max_riders INT NOT NULL,
  has_analytics BOOLEAN NOT NULL DEFAULT false,
  has_matching BOOLEAN NOT NULL DEFAULT false,
  price_monthly_cents INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO subscription_plans (id, name, max_horses, max_riders, has_analytics, has_matching, price_monthly_cents) VALUES
  ('free', 'Free', 2, 10, false, false, 0),
  ('starter', 'Starter', 5, 25, true, false, 1999),
  ('stable', 'Stable', 50, 200, true, true, 4999),
  ('enterprise', 'Enterprise', 9999, 9999, true, true, NULL);

-- ==================== STABLES ====================

CREATE TABLE stables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  subscription_tier subscription_tier NOT NULL DEFAULT 'free',
  subscription_plan_id TEXT NOT NULL REFERENCES subscription_plans(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_stables_slug ON stables(slug);
CREATE INDEX idx_stables_subscription ON stables(subscription_tier);

-- ==================== PROFILES (extends auth.users) ====================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stable_id UUID NOT NULL REFERENCES stables(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'student',
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_stable ON profiles(stable_id);
CREATE INDEX idx_profiles_role ON profiles(role);

-- ==================== HORSES ====================

CREATE TABLE horses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stable_id UUID NOT NULL REFERENCES stables(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  breed TEXT,
  age INT,
  gender TEXT NOT NULL,
  color TEXT,
  markings TEXT,
  height_cm NUMERIC(5,2),
  microchip TEXT,
  ueln TEXT,
  date_of_birth DATE,
  temperament horse_temperament,
  skill_level skill_level,
  training_status training_status,
  suitability TEXT[],
  photo_path TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_horses_stable ON horses(stable_id);
CREATE INDEX idx_horses_name ON horses(stable_id, name);

-- ==================== RIDERS ====================

CREATE TABLE riders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stable_id UUID NOT NULL REFERENCES stables(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  level skill_level,
  goals TEXT,
  assigned_trainer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes TEXT,
  instructor_feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_riders_stable ON riders(stable_id);
CREATE INDEX idx_riders_trainer ON riders(assigned_trainer_id);

-- ==================== TRAINING PUNCHES ====================

CREATE TABLE training_punches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  horse_id UUID NOT NULL REFERENCES horses(id) ON DELETE CASCADE,
  rider_id UUID REFERENCES riders(id) ON DELETE SET NULL,
  trainer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  punch_type punch_type NOT NULL,
  discipline discipline,
  intensity intensity,
  duration_minutes INT NOT NULL DEFAULT 0,
  notes TEXT,
  rider_name TEXT,
  trainer_name TEXT,
  punch_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_punches_horse ON training_punches(horse_id);
CREATE INDEX idx_punches_date ON training_punches(punch_date);
CREATE INDEX idx_punches_horse_date ON training_punches(horse_id, punch_date);

-- ==================== BOOKINGS ====================

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stable_id UUID NOT NULL REFERENCES stables(id) ON DELETE CASCADE,
  horse_id UUID NOT NULL REFERENCES horses(id) ON DELETE CASCADE,
  rider_id UUID REFERENCES riders(id) ON DELETE SET NULL,
  trainer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status booking_status NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_bookings_stable ON bookings(stable_id);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_horse ON bookings(horse_id);

-- ==================== HEALTH LOGS ====================

CREATE TABLE health_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  horse_id UUID NOT NULL REFERENCES horses(id) ON DELETE CASCADE,
  log_type health_log_type NOT NULL,
  log_date DATE NOT NULL,
  description TEXT,
  cost_cents INT,
  next_due DATE,
  recovery_status TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_health_logs_horse ON health_logs(horse_id);
CREATE INDEX idx_health_logs_date ON health_logs(log_date);
CREATE INDEX idx_health_logs_next_due ON health_logs(next_due) WHERE next_due IS NOT NULL;

-- ==================== COMPETITIONS ====================

CREATE TABLE competitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stable_id UUID NOT NULL REFERENCES stables(id) ON DELETE CASCADE,
  horse_id UUID NOT NULL REFERENCES horses(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  event_date DATE NOT NULL,
  location TEXT,
  discipline TEXT,
  result TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_competitions_stable ON competitions(stable_id);
CREATE INDEX idx_competitions_horse ON competitions(horse_id);

-- ==================== PAYMENTS ====================

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stable_id UUID NOT NULL REFERENCES stables(id) ON DELETE CASCADE,
  amount_cents INT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  stripe_payment_id TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_stable ON payments(stable_id);

-- ==================== UPDATED_AT TRIGGER ====================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER stables_updated_at
  BEFORE UPDATE ON stables FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER horses_updated_at
  BEFORE UPDATE ON horses FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER riders_updated_at
  BEFORE UPDATE ON riders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
