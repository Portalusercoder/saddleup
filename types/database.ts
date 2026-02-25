export type SubscriptionTier = "free" | "starter" | "stable" | "enterprise";
export type UserRole = "owner" | "trainer" | "student" | "guardian";
export type HorseTemperament = "calm" | "energetic" | "sensitive" | "beginner_safe";
export type SkillLevel = "beginner" | "intermediate" | "advanced";
export type TrainingStatus = "green" | "schooling" | "competition_ready";
export type PunchType = "lesson" | "training" | "competition" | "rest" | "medical";
export type Discipline = "flatwork" | "jumping" | "trail" | "dressage";
export type Intensity = "light" | "medium" | "hard";
export type HealthLogType = "vet" | "vaccination" | "deworming" | "farrier" | "injury";
export type BookingStatus = "scheduled" | "completed" | "cancelled" | "no_show";

export interface SubscriptionPlan {
  id: string;
  name: string;
  max_horses: number;
  max_riders: number;
  has_analytics: boolean;
  has_matching: boolean;
  price_monthly_cents: number | null;
}

export interface Stable {
  id: string;
  name: string;
  slug: string;
  subscription_tier: SubscriptionTier;
  subscription_plan_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  stable_id: string;
  role: UserRole;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Horse {
  id: string;
  stable_id: string;
  name: string;
  breed: string | null;
  age: number | null;
  gender: string;
  color: string | null;
  markings: string | null;
  height_cm: number | null;
  microchip: string | null;
  ueln: string | null;
  date_of_birth: string | null;
  temperament: HorseTemperament | null;
  skill_level: SkillLevel | null;
  training_status: TrainingStatus | null;
  suitability: string[] | null;
  photo_path: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Rider {
  id: string;
  stable_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  level: SkillLevel | null;
  goals: string | null;
  assigned_trainer_id: string | null;
  notes: string | null;
  instructor_feedback: string | null;
  created_at: string;
  updated_at: string;
}

export interface TrainingPunch {
  id: string;
  horse_id: string;
  rider_id: string | null;
  trainer_id: string | null;
  punch_type: PunchType;
  discipline: Discipline | null;
  intensity: Intensity | null;
  duration_minutes: number;
  notes: string | null;
  rider_name: string | null;
  trainer_name: string | null;
  punch_date: string;
  created_at: string;
}

export interface Booking {
  id: string;
  stable_id: string;
  horse_id: string;
  rider_id: string | null;
  trainer_id: string | null;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface HealthLog {
  id: string;
  horse_id: string;
  log_type: HealthLogType;
  log_date: string;
  description: string | null;
  cost_cents: number | null;
  next_due: string | null;
  recovery_status: string | null;
  created_at: string;
}

export interface Competition {
  id: string;
  stable_id: string;
  horse_id: string;
  event_name: string;
  event_date: string;
  location: string | null;
  discipline: string | null;
  result: string | null;
  notes: string | null;
  created_at: string;
}
