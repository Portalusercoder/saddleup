import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureStableCanMutate } from "@/lib/subscription";

/* ================= GET HEALTH LOGS ================= */

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const horseId = searchParams.get("horseId");

    let query = supabase
      .from("health_logs")
      .select("*")
      .order("log_date", { ascending: false });

    if (horseId) {
      query = query.eq("horse_id", horseId);
    }

    const { data: logs, error } = await query;

    if (error) {
      console.error("GET health logs error:", error);
      return NextResponse.json(
        { error: "Failed to fetch health logs" },
        { status: 500 }
      );
    }

    const mapped = (logs || []).map((l) => ({
      id: l.id,
      type: l.log_type,
      date: l.log_date,
      description: l.description,
      cost: l.cost_cents != null ? l.cost_cents / 100 : null,
      nextDue: l.next_due,
      recoveryStatus: l.recovery_status,
      horseId: l.horse_id,
    }));

    return NextResponse.json(mapped);
  } catch (err) {
    console.error("GET health logs error:", err);
    return NextResponse.json(
      { error: "Failed to fetch health logs" },
      { status: 500 }
    );
  }
}

/* ================= CREATE HEALTH LOG ================= */

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

    const body = await req.json();

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

    if (!body.horseId || !body.type) {
      return NextResponse.json(
        { error: "horseId and type are required" },
        { status: 400 }
      );
    }

    const validTypes = ["vet", "vaccination", "deworming", "farrier", "injury"];
    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        { error: "Invalid log type" },
        { status: 400 }
      );
    }

    const { data: log, error } = await supabase
      .from("health_logs")
      .insert({
        horse_id: body.horseId,
        log_type: body.type,
        log_date: body.date || new Date().toISOString().slice(0, 10),
        description: body.description?.trim() || null,
        cost_cents: body.cost ? Math.round(Number(body.cost) * 100) : null,
        next_due: body.nextDue || null,
        recovery_status: body.recoveryStatus?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      console.error("POST health log error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to create health log" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: log.id,
      type: log.log_type,
      date: log.log_date,
      description: log.description,
      cost: log.cost_cents != null ? log.cost_cents / 100 : null,
      nextDue: log.next_due,
      recoveryStatus: log.recovery_status,
      horseId: log.horse_id,
    });
  } catch (err) {
    console.error("POST health log error:", err);
    return NextResponse.json(
      { error: "Failed to create health log" },
      { status: 500 }
    );
  }
}
