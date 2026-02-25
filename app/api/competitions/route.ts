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

    const { data: competitions, error } = await supabase
      .from("competitions")
      .select("id, event_name, event_date, location, discipline, result, notes, horse_id, horses(id, name)")
      .order("event_date", { ascending: false });

    if (error) {
      console.error("GET competitions error:", error);
      return NextResponse.json(
        { error: "Failed to fetch competitions" },
        { status: 500 }
      );
    }

    const mapped = (competitions || []).map((c: Record<string, unknown>) => {
      const horse = c.horses as { id: string; name: string } | null;
      return {
        id: c.id,
        eventName: c.event_name,
        eventDate: c.event_date,
        location: c.location,
        discipline: c.discipline,
        result: c.result,
        notes: c.notes,
        horseId: c.horse_id,
        horse: horse ? { id: horse.id, name: horse.name } : null,
      };
    });

    return NextResponse.json(mapped);
  } catch (err) {
    console.error("GET competitions error:", err);
    return NextResponse.json(
      { error: "Failed to fetch competitions" },
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
      return NextResponse.json({ error: "Only owners and trainers can add competitions" }, { status: 403 });
    }

    const body = await req.json();
    const { eventName, eventDate, horseId, location, discipline, result, notes } = body;

    if (!eventName?.trim() || !eventDate || !horseId) {
      return NextResponse.json(
        { error: "Event name, date, and horse are required" },
        { status: 400 }
      );
    }

    const { data: competition, error } = await supabase
      .from("competitions")
      .insert({
        stable_id: profile.stable_id,
        horse_id: horseId,
        event_name: eventName.trim(),
        event_date: eventDate,
        location: location?.trim() || null,
        discipline: discipline?.trim() || null,
        result: result?.trim() || null,
        notes: notes?.trim() || null,
      })
      .select("id, event_name, event_date, location, discipline, result, notes, horse_id, horses(id, name)")
      .single();

    if (error) {
      console.error("POST competition error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to add competition" },
        { status: 500 }
      );
    }

    const horses = (competition as { horses?: { id: string; name: string } | { id: string; name: string }[] | null }).horses;
    const horse = Array.isArray(horses) ? horses[0] : horses;
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
    console.error("POST competition error:", err);
    return NextResponse.json(
      { error: "Failed to add competition" },
      { status: 500 }
    );
  }
}
