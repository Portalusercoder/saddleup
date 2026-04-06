import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkHorseLimit, ensureStableCanMutate } from "@/lib/subscription";
import {
  horseRowToApiShape,
  mapSkillLevel,
  mapSuitability,
  mapTemperament,
  mapTrainingStatus,
} from "@/lib/map-horse-payload";
import { parseJsonBody } from "@/lib/validation/parse-json";
import { horsePostSchema } from "@/lib/validation/schemas";

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
      const base = horseRowToApiShape(h as unknown as Record<string, unknown>);
      return { ...base, sessions };
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

    const parsed = await parseJsonBody(req, horsePostSchema);
    if (!parsed.ok) return parsed.response;
    const body = parsed.data;

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
      name: body.name,
      gender: body.gender,
      age: body.age,
      breed: body.breed,
      color: body.color,
      markings: body.markings,
      height_cm: body.height,
      microchip: body.microchip,
      ueln: body.ueln,
      date_of_birth: body.dateOfBirth,
      registered_name: body.registeredName,
      passport_number: body.passportNumber,
      fei_id: body.feiId,
      studbook: body.studbook,
      horse_category: body.horseCategory,
      sire_name: body.sireName,
      dam_name: body.damName,
      country_of_birth: body.countryOfBirth,
      temperament: temperament || null,
      skill_level: skillLevel || null,
      training_status: trainingStatus || null,
      suitability: suitability || null,
      photo_path: body.photoUrl,
      notes: body.owner ? `Owner: ${body.owner}` : body.notes,
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

    const base = horseRowToApiShape(horse as unknown as Record<string, unknown>);
    return NextResponse.json({ ...base, sessions: [] });
  } catch (err) {
    console.error("POST horse error:", err);
    const message = err instanceof Error ? err.message : "Failed to create horse";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
