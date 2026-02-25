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
      return NextResponse.json({ error: "Only owners and trainers can edit competitions" }, { status: 403 });
    }

    const body = await req.json();
    const { eventName, eventDate, horseId, location, discipline, result, notes } = body;

    const updates: Record<string, unknown> = {};
    if (typeof eventName === "string") updates.event_name = eventName.trim();
    if (typeof eventDate === "string") updates.event_date = eventDate;
    if (typeof horseId === "string") updates.horse_id = horseId;
    if (location !== undefined) updates.location = location?.trim() || null;
    if (discipline !== undefined) updates.discipline = discipline?.trim() || null;
    if (result !== undefined) updates.result = result?.trim() || null;
    if (notes !== undefined) updates.notes = notes?.trim() || null;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid updates" }, { status: 400 });
    }

    const { data: competition, error } = await supabase
      .from("competitions")
      .update(updates)
      .eq("id", id)
      .select("id, event_name, event_date, location, discipline, result, notes, horse_id, horses(id, name)")
      .single();

    if (error) {
      console.error("PUT competition error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to update competition" },
        { status: 500 }
      );
    }

    const horse = (competition as { horses?: { id: string; name: string } | null }).horses;
    return NextResponse.json({
      id: competition.id,
      eventName: competition.event_name,
      eventDate: competition.event_date,
      location: competition.location,
      discipline: competition.discipline,
      result: competition.result,
      notes: competition.notes,
      horseId: competition.horse_id,
      horse: horse ? { id: horse.id, name: horse.name } : null,
    });
  } catch (err) {
    console.error("PUT competition error:", err);
    return NextResponse.json(
      { error: "Failed to update competition" },
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
      return NextResponse.json({ error: "Only owners and trainers can delete competitions" }, { status: 403 });
    }

    const { error } = await supabase.from("competitions").delete().eq("id", id);

    if (error) {
      console.error("DELETE competition error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to delete competition" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE competition error:", err);
    return NextResponse.json(
      { error: "Failed to delete competition" },
      { status: 500 }
    );
  }
}
