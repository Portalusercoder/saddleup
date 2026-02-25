import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function mapPunchType(value: string): string {
  const m: Record<string, string> = {
    training: "training",
    lesson: "lesson",
    free_ride: "training",
    competition: "competition",
    rest: "rest",
    medical_rest: "medical",
  };
  return m[value] || "training";
}

function mapDiscipline(value: string): string | null {
  const d = (value || "flatwork").toLowerCase();
  if (["rest", "flatwork", "jumping", "trail", "dressage"].includes(d)) {
    return d === "rest" ? null : d;
  }
  return "flatwork";
}

function mapIntensity(value: string): string {
  const i = (value || "medium").toLowerCase();
  return ["light", "medium", "hard"].includes(i) ? i : "medium";
}

/* ================= GET ALL SESSIONS ================= */

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

    const { data: punches, error } = await supabase
      .from("training_punches")
      .select("*, horses(id, name, photo_path)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("GET sessions error:", error);
      return NextResponse.json(
        { error: "Failed to fetch sessions" },
        { status: 500 }
      );
    }

    const mapped = (punches || []).map((p) => {
      const horses = (p as { horses?: { id: string; name: string; photo_path: string | null } | { id: string; name: string; photo_path: string | null }[] | null }).horses;
      const horse = Array.isArray(horses) ? horses[0] : horses;
      return {
        id: p.id,
        punchType: p.punch_type,
        duration: p.duration_minutes,
        intensity: p.intensity,
        discipline: p.discipline,
        rider: p.rider_name,
        notes: p.notes,
        horseId: p.horse_id,
        createdAt: p.created_at,
        horse: horse ? { name: horse.name, photoUrl: horse.photo_path } : null,
      };
    });

    return NextResponse.json(mapped);
  } catch (err) {
    console.error("GET sessions error:", err);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

/* ================= CREATE SESSION ================= */

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.horseId) {
      return NextResponse.json(
        { error: "horseId is required" },
        { status: 400 }
      );
    }

    const horseId = String(body.horseId);
    if (!UUID_REGEX.test(horseId)) {
      return NextResponse.json(
        { error: "Invalid horse ID. Horses must be from your stable." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isRest =
      body.punchType === "rest" || body.punchType === "medical_rest";

    const { data: punch, error } = await supabase
      .from("training_punches")
      .insert({
        horse_id: horseId,
        punch_type: mapPunchType(body.punchType || "training"),
        duration_minutes: isRest ? 0 : Number(body.duration ?? 0),
        intensity: mapIntensity(body.intensity),
        discipline: mapDiscipline(body.discipline),
        rider_name: body.rider || null,
        notes: body.notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error("POST session error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to create session" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: punch.id,
      punchType: punch.punch_type,
      duration: punch.duration_minutes,
      intensity: punch.intensity,
      discipline: punch.discipline,
      rider: punch.rider_name,
      notes: punch.notes,
      horseId: punch.horse_id,
      createdAt: punch.created_at,
    });
  } catch (err) {
    console.error("POST session error:", err);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
