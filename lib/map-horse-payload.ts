/** Shared mappers for horses API insert/update (DB enums & arrays). */

export function mapTemperament(value: string | null): string | null {
  if (!value) return null;
  if (value === "beginner-safe") return "beginner_safe";
  return ["calm", "energetic", "sensitive", "beginner_safe"].includes(value)
    ? value
    : null;
}

export function mapSuitability(value: string | null): string[] | null {
  if (!value?.trim()) return null;
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}

const VALID_SKILL_LEVELS = ["beginner", "intermediate", "advanced"];
const VALID_TRAINING_STATUSES = ["green", "schooling", "competition_ready"];

export function mapSkillLevel(value: string | null): string | null {
  if (!value?.trim()) return null;
  const v = value.trim().toLowerCase();
  return VALID_SKILL_LEVELS.includes(v) ? v : null;
}

export function mapTrainingStatus(value: string | null): string | null {
  if (!value?.trim()) return null;
  const v = value.trim().toLowerCase().replace(/-/g, "_");
  return VALID_TRAINING_STATUSES.includes(v) ? v : null;
}

export function horseRowToApiShape(h: Record<string, unknown>) {
  return {
    id: h.id,
    name: h.name,
    gender: h.gender,
    age: h.age,
    breed: h.breed,
    owner: null as string | null,
    color: h.color,
    markings: h.markings,
    height: (h as { height_cm?: number | null }).height_cm,
    microchip: h.microchip,
    ueln: h.ueln,
    dateOfBirth: (h as { date_of_birth?: string | null }).date_of_birth,
    registeredName: (h as { registered_name?: string | null }).registered_name ?? null,
    passportNumber: (h as { passport_number?: string | null }).passport_number ?? null,
    feiId: (h as { fei_id?: string | null }).fei_id ?? null,
    studbook: (h as { studbook?: string | null }).studbook ?? null,
    horseCategory: (h as { horse_category?: string | null }).horse_category ?? null,
    sireName: (h as { sire_name?: string | null }).sire_name ?? null,
    damName: (h as { dam_name?: string | null }).dam_name ?? null,
    countryOfBirth: (h as { country_of_birth?: string | null }).country_of_birth ?? null,
    temperament: h.temperament,
    skillLevel: (h as { skill_level?: string | null }).skill_level,
    trainingStatus: (h as { training_status?: string | null }).training_status,
    ridingSuitability: Array.isArray((h as { suitability?: string[] | null }).suitability)
      ? (h as { suitability: string[] }).suitability.join(", ")
      : null,
    photoUrl: (h as { photo_path?: string | null }).photo_path,
    notes: h.notes,
    createdAt: h.created_at,
    updatedAt: h.updated_at,
    sessions: [] as unknown[],
  };
}
