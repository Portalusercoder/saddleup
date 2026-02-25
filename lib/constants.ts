export const SUBSCRIPTION_LIMITS = {
  free: { horses: 2, riders: 10, analytics: false, matching: false },
  starter: { horses: 5, riders: 25, analytics: true, matching: false },
  stable: { horses: 50, riders: 200, analytics: true, matching: true },
  enterprise: { horses: 9999, riders: 9999, analytics: true, matching: true },
} as const;

export const SUBSCRIPTION_PLANS = [
  {
    id: "free",
    name: "Free",
    horses: 2,
    riders: 10,
    price: 0,
    features: ["2 horses", "10 riders", "Basic management"],
  },
  {
    id: "starter",
    name: "Starter",
    horses: 5,
    riders: 25,
    price: 19.99,
    features: ["5 horses", "25 riders", "Workload analytics", "Session logging"],
  },
  {
    id: "stable",
    name: "Stable",
    horses: 50,
    riders: 200,
    price: 49.99,
    features: ["50 horses", "200 riders", "Analytics", "Horse–rider matching", "Priority support"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    horses: 9999,
    riders: 9999,
    price: null,
    features: ["Unlimited horses & riders", "Custom integrations", "Dedicated support"],
  },
] as const;

export const STORAGE_BUCKETS = {
  HORSE_PHOTOS: "horse-photos",
  PROFILE_AVATARS: "profile-avatars",
  STABLE_LOGOS: "stable-logos",
  ID_CARDS: "id-cards",
} as const;
