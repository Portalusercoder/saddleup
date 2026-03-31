import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { auditLog } from "@/lib/audit-log";
import { ensureStableCanMutate } from "@/lib/subscription";
import {
  horseRowToApiShape,
  mapSkillLevel,
  mapSuitability,
  mapTemperament,
  mapTrainingStatus,
} from "@/lib/map-horse-payload";

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

    const shape = horseRowToApiShape(horse as unknown as Record<string, unknown>);
    const notes = (horse as { notes?: string }).notes ?? "";
    const ownerFromNotes = notes.startsWith("Owner: ") ? notes.replace(/^Owner:\s*/, "").split("\n")[0]?.trim() ?? null : null;
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
    const skillLevel = mapSkillLevel(body.skillLevel);
    const trainingStatus = mapTrainingStatus(body.trainingStatus);

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
      registered_name: body.registeredName?.trim() || null,
      passport_number: body.passportNumber?.trim() || null,
      fei_id: body.feiId?.trim() || null,
      studbook: body.studbook?.trim() || null,
      horse_category: body.horseCategory?.trim() || null,
      sire_name: body.sireName?.trim() || null,
      dam_name: body.damName?.trim() || null,
      country_of_birth: body.countryOfBirth?.trim() || null,
      temperament: temperament ?? null,
      skill_level: skillLevel,
      training_status: trainingStatus,
      suitability: suitability ?? null,
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

    const shape = horseRowToApiShape(horse as unknown as Record<string, unknown>);
    const notes = (horse as { notes?: string }).notes ?? "";
    const ownerFromNotes = notes.startsWith("Owner: ") ? notes.replace(/^Owner:\s*/, "").split("\n")[0]?.trim() ?? null : null;
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

    const { data: horse } = await supabase
      .from("horses")
      .select("stable_id, name")
      .eq("id", id)
      .single();

    const { error } = await supabase.from("horses").delete().eq("id", id);

    if (error) {
      console.error("DELETE horse error:", error);
      return NextResponse.json(
        { error: error.message || "Delete failed" },
        { status: 500 }
      );
    }

    if (horse?.stable_id) {
      await auditLog({
        actorProfileId: user.id,
        stableId: horse.stable_id,
        action: "horse_deleted",
        entityType: "horse",
        entityId: id,
        details: { name: horse.name },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE horse error:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
