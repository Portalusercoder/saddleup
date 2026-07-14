import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureStableCanMutate } from "@/lib/subscription";
import { parseJsonBody } from "@/lib/validation/parse-json";
import { healthPutSchema } from "@/lib/validation/schemas";

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

    const parsed = await parseJsonBody(req, healthPutSchema);
    if (!parsed.ok) return parsed.response;
    const body = parsed.data;
    const id = (await params).id;

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

    const { data: existing, error: lookupError } = await supabase
      .from("health_logs")
      .select("id, horse_id")
      .eq("id", id)
      .maybeSingle();

    if (lookupError) {
      console.error("PUT health log lookup error:", lookupError);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data: horse } = await supabase
      .from("horses")
      .select("id")
      .eq("id", existing.horse_id)
      .eq("stable_id", profile.stable_id)
      .maybeSingle();

    if (!horse) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const patch: Record<string, unknown> = {};
    if (body.type !== undefined) patch.log_type = body.type;
    if (body.date !== undefined) patch.log_date = body.date;
    if (body.description !== undefined) patch.description = body.description;
    if (body.cost !== undefined) {
      patch.cost_cents = body.cost != null ? Math.round(body.cost * 100) : null;
    }
    if (body.nextDue !== undefined) patch.next_due = body.nextDue;
    if (body.recoveryStatus !== undefined) patch.recovery_status = body.recoveryStatus;

    const { data: log, error } = await supabase
      .from("health_logs")
      .update(patch)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("PUT health log error:", error);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
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
  } catch (error) {
    console.error("PUT health log error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

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

    const id = (await params).id;

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

    const { data: existing, error: lookupError } = await supabase
      .from("health_logs")
      .select("id, horse_id")
      .eq("id", id)
      .maybeSingle();

    if (lookupError) {
      console.error("DELETE health log lookup error:", lookupError);
      return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data: horse } = await supabase
      .from("horses")
      .select("id")
      .eq("id", existing.horse_id)
      .eq("stable_id", profile.stable_id)
      .maybeSingle();

    if (!horse) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { error } = await supabase.from("health_logs").delete().eq("id", id);

    if (error) {
      console.error("DELETE health log error:", error);
      return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE health log error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
