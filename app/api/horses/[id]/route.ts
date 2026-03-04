import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureStableCanMutate } from "@/lib/subscription";

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

function toHorseShape(h: Record<string, unknown>) {
  return {
    id: h.id,
    name: h.name,
    gender: h.gender,
    age: h.age,
    breed: h.breed,
    owner: null,
    color: h.color,
    markings: h.markings,
    height: (h as { height_cm?: number }).height_cm,
    microchip: h.microchip,
    ueln: h.ueln,
    dateOfBirth: (h as { date_of_birth?: string }).date_of_birth,
    temperament: h.temperament,
    skillLevel: (h as { skill_level?: string }).skill_level,
    trainingStatus: (h as { training_status?: string }).training_status,
    ridingSuitability: Array.isArray((h as { suitability?: string[] }).suitability)
      ? (h as { suitability: string[] }).suitability.join(", ")
      : null,
    photoUrl: (h as { photo_path?: string }).photo_path,
    notes: h.notes,
    createdAt: h.created_at,
    updatedAt: h.updated_at,
    sessions: [],
  };
}

/* ================= GET SINGLE HORSE ================= */

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { data: horse, error } = await supabase
      .from("horses")
      .select("*, training_punches(*), health_logs(*)")
      .eq("id", id)
      .single();

    if (error || !horse) {
      return NextResponse.json({ error: "Horse not found" }, { status: 404 });
    }

    const punches = (horse as { training_punches?: unknown[] }).training_punches || [];
    const healthLogsRaw = (horse as { health_logs?: unknown[] }).health_logs || [];
    const sessions = punches.map((p) => {
      const x = p as Record<string, unknown>;
      return {
        id: x.id,
        punchType: x.punch_type,
        duration: x.duration_minutes,
        intensity: x.intensity,
        discipline: x.discipline,
        rider: (x as { rider_name?: string }).rider_name,
        notes: x.notes,
        createdAt: x.created_at,
      };
    });
    const healthLogs = healthLogsRaw.map((l) => {
      const y = l as Record<string, unknown>;
      return {
        id: y.id,
        type: y.log_type,
        date: y.log_date,
        description: y.description,
        cost: (y as { cost_cents?: number }).cost_cents != null
          ? (y as { cost_cents: number }).cost_cents / 100
          : null,
        nextDue: (y as { next_due?: string }).next_due,
        recoveryStatus: (y as { recovery_status?: string }).recovery_status,
      };
    });

    const shape = toHorseShape(horse);
    const notes = (horse as { notes?: string }).notes ?? "";
    const ownerFromNotes = notes.startsWith("Owner: ") ? notes.replace(/^Owner:\s*/, "").trim() : null;
    return NextResponse.json({
      ...shape,
      owner: ownerFromNotes ?? shape.owner,
      notes,
      sessions,
      healthLogs,
    });
  } catch (err) {
    console.error("GET horse error:", err);
    return NextResponse.json(
      { error: "Failed to fetch horse" },
      { status: 500 }
    );
  }
}

/* ================= UPDATE HORSE ================= */

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id } = await params;

    const temperament = mapTemperament(body.temperament);
    const suitability = mapSuitability(body.ridingSuitability);

    const { data: profile } = await supabase
      .from("profiles")
      .select("stable_id")
      .eq("id", user.id)
      .single();

    if (!profile?.stable_id) {
      return NextResponse.json({ error: "No stable found" }, { status: 403 });
    }

    const guard = await ensureStableCanMutate(profile.stable_id);
    if (!guard.allowed) {
      return NextResponse.json(
        { error: guard.message, code: "TRIAL_EXPIRED" },
        { status: 403 }
      );
    }

    const updates: Record<string, unknown> = {
      name: body.name?.trim(),
      gender: body.gender,
      age: body.age ? Number(body.age) : null,
      breed: body.breed?.trim() || null,
      color: body.color?.trim() || null,
      markings: body.markings?.trim() || null,
      height_cm: body.height ? Number(body.height) : null,
      microchip: body.microchip?.trim() || null,
      ueln: body.ueln?.trim() || null,
      date_of_birth: body.dateOfBirth || null,
      temperament: temperament ?? undefined,
      skill_level: body.skillLevel || null,
      training_status: body.trainingStatus || null,
      suitability: suitability ?? undefined,
      photo_path: body.photoUrl?.trim() || null,
      notes: body.owner?.trim() ? `Owner: ${body.owner.trim()}` : body.notes?.trim() || null,
    };

    const { data: horse, error } = await supabase
      .from("horses")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("PUT horse error:", error);
      return NextResponse.json(
        { error: error.message || "Update failed" },
        { status: 500 }
      );
    }

    const shape = toHorseShape(horse);
    const notes = (horse as { notes?: string }).notes ?? "";
    const ownerFromNotes = notes.startsWith("Owner: ") ? notes.replace(/^Owner:\s*/, "").trim() : null;
    return NextResponse.json({
      ...shape,
      owner: ownerFromNotes ?? shape.owner,
      notes,
    });
  } catch (err) {
    console.error("PUT horse error:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

/* ================= DELETE HORSE ================= */

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { error } = await supabase.from("horses").delete().eq("id", id);

    if (error) {
      console.error("DELETE horse error:", error);
      return NextResponse.json(
        { error: error.message || "Delete failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE horse error:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
