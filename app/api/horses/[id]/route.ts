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
import { parseJsonBody } from "@/lib/validation/parse-json";
import { horsePatchSchema } from "@/lib/validation/schemas";
import type { z } from "zod";

function horsePatchDataToRow(
  d: z.infer<typeof horsePatchSchema>
): Record<string, unknown> {
  const updates: Record<string, unknown> = {};

  if ("name" in d) updates.name = d.name;
  if ("gender" in d) updates.gender = d.gender;
  if ("age" in d) updates.age = d.age;
  if ("breed" in d) updates.breed = d.breed;
  if ("color" in d) updates.color = d.color;
  if ("markings" in d) updates.markings = d.markings;
  if ("height" in d) updates.height_cm = d.height;
  if ("microchip" in d) updates.microchip = d.microchip;
  if ("ueln" in d) updates.ueln = d.ueln;
  if ("dateOfBirth" in d) updates.date_of_birth = d.dateOfBirth;
  if ("registeredName" in d) updates.registered_name = d.registeredName;
  if ("passportNumber" in d) updates.passport_number = d.passportNumber;
  if ("feiId" in d) updates.fei_id = d.feiId;
  if ("studbook" in d) updates.studbook = d.studbook;
  if ("horseCategory" in d) updates.horse_category = d.horseCategory;
  if ("sireName" in d) updates.sire_name = d.sireName;
  if ("damName" in d) updates.dam_name = d.damName;
  if ("countryOfBirth" in d) updates.country_of_birth = d.countryOfBirth;
  if ("temperament" in d) {
    updates.temperament = mapTemperament(d.temperament ?? null) ?? null;
  }
  if ("skillLevel" in d) {
    updates.skill_level = mapSkillLevel(d.skillLevel ?? null);
  }
  if ("trainingStatus" in d) {
    updates.training_status = mapTrainingStatus(d.trainingStatus ?? null);
  }
  if ("ridingSuitability" in d) {
    updates.suitability = mapSuitability(d.ridingSuitability ?? null) ?? null;
  }
  if ("photoUrl" in d) updates.photo_path = d.photoUrl;

  if ("owner" in d || "notes" in d) {
    const hasOwner = "owner" in d;
    const hasNotes = "notes" in d;
    if (hasOwner && hasNotes) {
      updates.notes = d.owner ? `Owner: ${d.owner}` : d.notes;
    } else if (hasOwner) {
      updates.notes = d.owner ? `Owner: ${d.owner}` : null;
    } else if (hasNotes) {
      updates.notes = d.notes;
    }
  }

  return updates;
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

    const parsed = await parseJsonBody(req, horsePatchSchema);
    if (!parsed.ok) return parsed.response;

    const { id } = await params;

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

    const updates = horsePatchDataToRow(parsed.data);

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
