/**
 * Horse–rider compatibility scoring.
 * Based on rider level vs horse temperament and skill level.
 */

type RiderLevel = "beginner" | "intermediate" | "advanced" | null;
type Temperament = "calm" | "energetic" | "sensitive" | "beginner_safe" | null;
type SkillLevel = "beginner" | "intermediate" | "advanced" | null;

export interface MatchResult {
  score: number;
  label: "Good match" | "Suitable" | "Use caution" | "Not recommended";
  reason: string;
}

export function computeMatch(
  riderLevel: RiderLevel,
  horseTemperament: Temperament,
  horseSkillLevel: SkillLevel,
  suitabilityStr: string | null
): MatchResult {
  const rider = (riderLevel || "intermediate").toLowerCase() as RiderLevel;
  const temp = horseTemperament?.toLowerCase().replace("-", "_") as Temperament | null;
  const skill = horseSkillLevel?.toLowerCase() as SkillLevel | null;
  const suit = (suitabilityStr || "").toLowerCase();

  // Beginner rider
  if (rider === "beginner") {
    if (temp === "beginner_safe") {
      if (skill === "beginner") return { score: 95, label: "Good match", reason: "Beginner-safe horse, suitable for your level" };
      if (skill === "intermediate") return { score: 80, label: "Good match", reason: "Beginner-safe, may challenge you as you progress" };
      return { score: 75, label: "Suitable", reason: "Beginner-safe temperament" };
    }
    if (temp === "calm" && (skill === "beginner" || skill === "intermediate")) {
      return { score: 85, label: "Good match", reason: "Calm horse, good for learning" };
    }
    if (temp === "calm") return { score: 70, label: "Suitable", reason: "Calm temperament" };
    if (temp === "energetic") return { score: 45, label: "Use caution", reason: "Energetic horse may be too much for beginners" };
    if (temp === "sensitive") return { score: 35, label: "Use caution", reason: "Sensitive horse requires experienced rider" };
    if (suit.includes("beginner")) return { score: 75, label: "Suitable", reason: "Marked suitable for beginners" };
    return { score: 55, label: "Suitable", reason: "Check with your instructor" };
  }

  // Intermediate rider
  if (rider === "intermediate") {
    if (skill === "intermediate") {
      if (temp === "calm" || temp === "energetic") return { score: 90, label: "Good match", reason: "Well-matched level and temperament" };
      if (temp === "beginner_safe") return { score: 85, label: "Good match", reason: "May be forgiving as you progress" };
      return { score: 80, label: "Good match", reason: "Suitable skill level" };
    }
    if (skill === "advanced") return { score: 70, label: "Suitable", reason: "Challenging horse, good for growth" };
    if (skill === "beginner") return { score: 75, label: "Suitable", reason: "May be under-mounted but safe" };
    if (temp === "sensitive") return { score: 60, label: "Suitable", reason: "Sensitive—requires steady aids" };
    return { score: 75, label: "Suitable", reason: "Generally compatible" };
  }

  // Advanced rider
  if (rider === "advanced") {
    if (skill === "advanced") return { score: 95, label: "Good match", reason: "Challenging horse for experienced rider" };
    return { score: 85, label: "Good match", reason: "You can handle most horses" };
  }

  // Unknown level
  return { score: 65, label: "Suitable", reason: "Level not set—verify compatibility with instructor" };
}
