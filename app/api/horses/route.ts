import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkHorseLimit, ensureStableCanMutate } from "@/lib/subscription";

function mapTemperament(value: string | null): string | null {
  if (!value) return null;
  if (value === "beginner-safe") return "beginner_safe";
  return ["calm", "energetic", "sensitive", "beginner_safe"].includes(value)
    ? value
    : null;
}

function mapSuitability(value: string | null): string[] | null {
  if (!value?.trim()) return null;
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}

const VALID_SKILL_LEVELS = ["beginner", "intermediate", "advanced"];
const VALID_TRAINING_STATUSES = ["green", "schooling", "competition_ready"];

function mapSkillLevel(value: string | null): string | null {
  if (!value?.trim()) return null;
  const v = value.trim().toLowerCase();
  return VALID_SKILL_LEVELS.includes(v) ? v : null;
}

function mapTrainingStatus(value: string | null): string | null {
  if (!value?.trim()) return null;
  const v = value.trim().toLowerCase().replace(/-/g, "_");
  return VALID_TRAINING_STATUSES.includes(v) ? v : null;
}

/* ================= GET ALL HORSES ================= */

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: horses, error } = await supabase
      .from("horses")
      .select("*, training_punches(*)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("GET horses error:", error);
      return NextResponse.json(
        { error: "Failed to fetch horses" },
        { status: 500 }
      );
    }

    // Map to shape expected by frontend
    const mapped = (horses || []).map((h) => {
      const punches = (h as { training_punches?: unknown[] }).training_punches || [];
      const sessions = punches.map((p) => {
        const x = p as Record<string, unknown>;
        return {
          id: x.id,
          punchType: x.punch_type,
          duration: x.duration_minutes,
          intensity: x.intensity,
          discipline: x.discipline,
          createdAt: x.created_at,
        };
      });
      return {
        id: h.id,
        name: h.name,
        gender: h.gender,
        age: h.age,
        breed: h.breed,
        owner: null,
        color: h.color,
        markings: h.markings,
        height: h.height_cm,
        microchip: h.microchip,
        ueln: h.ueln,
        dateOfBirth: h.date_of_birth,
        temperament: h.temperament,
        skillLevel: h.skill_level,
        trainingStatus: h.training_status,
        ridingSuitability: Array.isArray(h.suitability) ? h.suitability.join(", ") : null,
        photoUrl: h.photo_path,
        notes: h.notes,
        createdAt: h.created_at,
        updatedAt: h.updated_at,
        sessions,
      };
    });

    return NextResponse.json(mapped);
  } catch (err) {
    console.error("GET horses error:", err);
    return NextResponse.json(
      { error: "Failed to fetch horses" },
      { status: 500 }
    );
  }
}

/* ================= CREATE HORSE ================= */

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await supabase
      .from("profiles")
      .select("stable_id, role")
      .eq("id", user.id)
      .single();

    if (!profile.data?.stable_id) {
      return NextResponse.json(
        { error: "No stable found. Complete your profile first." },
        { status: 403 }
      );
    }

    const guard = await ensureStableCanMutate(profile.data.stable_id);
    if (!guard.allowed) {
      return NextResponse.json(
        { error: guard.message, code: "TRIAL_EXPIRED" },
        { status: 403 }
      );
    }

    const role = profile.data.role as string;
    if (role !== "owner" && role !== "trainer") {
      return NextResponse.json(
        { error: "Only owners and trainers can add horses." },
        { status: 403 }
      );
    }

    const body = await req.json();

    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const limitCheck = await checkHorseLimit(profile.data.stable_id);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { error: limitCheck.message, code: "LIMIT_REACHED" },
        { status: 403 }
      );
    }

    const temperament = mapTemperament(body.temperament);
    const suitability = mapSuitability(body.ridingSuitability);
    const skillLevel = mapSkillLevel(body.skillLevel);
    const trainingStatus = mapTrainingStatus(body.trainingStatus);

    const insertPayload = {
      stable_id: profile.data.stable_id,
      name: body.name.trim(),
      gender: body.gender || "Gelding",
      age: body.age ? Number(body.age) : null,
      breed: body.breed?.trim() || null,
      color: body.color?.trim() || null,
      markings: body.markings?.trim() || null,
      height_cm: body.height ? Number(body.height) : null,
      microchip: body.microchip?.trim() || null,
      ueln: body.ueln?.trim() || null,
      date_of_birth: body.dateOfBirth || null,
      temperament: temperament || null,
      skill_level: skillLevel || null,
      training_status: trainingStatus || null,
      suitability: suitability || null,
      photo_path: body.photoUrl?.trim() || null,
      notes: body.owner?.trim() ? `Owner: ${body.owner.trim()}` : body.notes?.trim() || null,
    };

    const { data: horse, error } = await supabase
      .from("horses")
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error("POST horse error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to create horse" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: horse.id,
      name: horse.name,
      gender: horse.gender,
      age: horse.age,
      breed: horse.breed,
      owner: null,
      color: horse.color,
      markings: horse.markings,
      height: horse.height_cm,
      microchip: horse.microchip,
      ueln: horse.ueln,
      dateOfBirth: horse.date_of_birth,
      temperament: horse.temperament,
      skillLevel: horse.skill_level,
      trainingStatus: horse.training_status,
      ridingSuitability: Array.isArray(horse.suitability) ? horse.suitability.join(", ") : null,
      photoUrl: horse.photo_path,
      notes: horse.notes,
      createdAt: horse.created_at,
      updatedAt: horse.updated_at,
      sessions: [],
    });
  } catch (err) {
    console.error("POST horse error:", err);
    const message = err instanceof Error ? err.message : "Failed to create horse";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
