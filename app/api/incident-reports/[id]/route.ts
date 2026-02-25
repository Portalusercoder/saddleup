import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "owner" && profile?.role !== "trainer") {
      return NextResponse.json(
        { error: "Only owners and trainers can edit incident reports" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      incidentDate,
      horseId,
      riderId,
      riderName,
      description,
      witnesses,
      location,
      severity,
      followUpNotes,
    } = body;

    const updates: Record<string, unknown> = {};
    if (typeof incidentDate === "string") updates.incident_date = incidentDate;
    if (typeof horseId === "string") updates.horse_id = horseId;
    if (riderId !== undefined) updates.rider_id = riderId || null;
    if (riderName !== undefined) updates.rider_name = riderName?.trim() || null;
    if (typeof description === "string") updates.description = description.trim();
    if (witnesses !== undefined) updates.witnesses = witnesses?.trim() || null;
    if (location !== undefined) updates.location = location?.trim() || null;
    if (severity !== undefined)
      updates.severity = ["minor", "moderate", "serious"].includes(severity)
        ? severity
        : null;
    if (followUpNotes !== undefined)
      updates.follow_up_notes = followUpNotes?.trim() || null;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid updates" }, { status: 400 });
    }

    const { data: report, error } = await supabase
      .from("incident_reports")
      .update(updates)
      .eq("id", id)
      .select(
        "id, incident_date, description, witnesses, location, severity, follow_up_notes, created_at, horse_id, rider_id, rider_name, horses(id, name), riders(id, name)"
      )
      .single();

    if (error) {
      console.error("PUT incident report error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to update incident report" },
        { status: 500 }
      );
    }

    const horse = (report as { horses?: { id: string; name: string } | null }).horses;
    const rider = (report as { riders?: { id: string; name: string } | null }).riders;

    return NextResponse.json({
      id: report.id,
      incidentDate: report.incident_date,
      description: report.description,
      witnesses: report.witnesses,
      location: report.location,
      severity: report.severity,
      followUpNotes: report.follow_up_notes,
      createdAt: report.created_at,
      horseId: report.horse_id,
      riderId: report.rider_id,
      riderName: report.rider_name || rider?.name || null,
      horse: horse ? { id: horse.id, name: horse.name } : null,
    });
  } catch (err) {
    console.error("PUT incident report error:", err);
    return NextResponse.json(
      { error: "Failed to update incident report" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "owner" && profile?.role !== "trainer") {
      return NextResponse.json(
        { error: "Only owners and trainers can delete incident reports" },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from("incident_reports")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("DELETE incident report error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to delete incident report" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE incident report error:", err);
    return NextResponse.json(
      { error: "Failed to delete incident report" },
      { status: 500 }
    );
  }
}
