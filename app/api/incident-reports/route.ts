import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    const { data: reports, error } = await supabase
      .from("incident_reports")
      .select(
        "id, incident_date, description, witnesses, location, severity, follow_up_notes, created_at, horse_id, rider_id, rider_name, horses(id, name), riders(id, name)"
      )
      .order("incident_date", { ascending: false });

    if (error) {
      console.error("GET incident reports error:", error);
      return NextResponse.json(
        { error: "Failed to fetch incident reports" },
        { status: 500 }
      );
    }

    const mapped = (reports || []).map((r: Record<string, unknown>) => {
      const horse = r.horses as { id: string; name: string } | null;
      const rider = r.riders as { id: string; name: string } | null;
      return {
        id: r.id,
        incidentDate: r.incident_date,
        description: r.description,
        witnesses: r.witnesses,
        location: r.location,
        severity: r.severity,
        followUpNotes: r.follow_up_notes,
        createdAt: r.created_at,
        horseId: r.horse_id,
        riderId: r.rider_id,
        riderName: r.rider_name || rider?.name || null,
        horse: horse ? { id: horse.id, name: horse.name } : null,
      };
    });

    return NextResponse.json(mapped);
  } catch (err) {
    console.error("Incident reports GET error:", err);
    return NextResponse.json(
      { error: "Failed to fetch incident reports" },
      { status: 500 }
    );
  }
}

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

    const { data: profile } = await supabase
      .from("profiles")
      .select("stable_id, role")
      .eq("id", user.id)
      .single();

    if (!profile?.stable_id) {
      return NextResponse.json({ error: "No stable found" }, { status: 404 });
    }

    if (profile.role !== "owner" && profile.role !== "trainer") {
      return NextResponse.json(
        { error: "Only owners and trainers can add incident reports" },
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

    if (!incidentDate?.trim() || !horseId || !description?.trim()) {
      return NextResponse.json(
        { error: "Date, horse, and description are required" },
        { status: 400 }
      );
    }

    const validSeverity = ["minor", "moderate", "serious"];
    if (severity && !validSeverity.includes(severity)) {
      return NextResponse.json(
        { error: "Severity must be minor, moderate, or serious" },
        { status: 400 }
      );
    }

    const { data: report, error } = await supabase
      .from("incident_reports")
      .insert({
        stable_id: profile.stable_id,
        incident_date: incidentDate,
        horse_id: horseId,
        rider_id: riderId || null,
        rider_name: riderName?.trim() || null,
        description: description.trim(),
        witnesses: witnesses?.trim() || null,
        location: location?.trim() || null,
        severity: severity || null,
        follow_up_notes: followUpNotes?.trim() || null,
        reported_by: user.id,
      })
      .select(
        "id, incident_date, description, witnesses, location, severity, follow_up_notes, created_at, horse_id, rider_id, rider_name, horses(id, name), riders(id, name)"
      )
      .single();

    if (error) {
      console.error("POST incident report error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to add incident report" },
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
    console.error("Incident reports POST error:", err);
    return NextResponse.json(
      { error: "Failed to add incident report" },
      { status: 500 }
    );
  }
}
