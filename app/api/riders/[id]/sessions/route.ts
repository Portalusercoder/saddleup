import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: riderId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: rider, error: riderError } = await supabase
      .from("riders")
      .select("id, name")
      .eq("id", riderId)
      .single();

    if (riderError || !rider) {
      return NextResponse.json({ error: "Rider not found" }, { status: 404 });
    }

    const [byIdRes, byNameRes] = await Promise.all([
      supabase
        .from("training_punches")
        .select("id, punch_type, duration_minutes, intensity, discipline, punch_date, created_at, horses(id, name)")
        .eq("rider_id", riderId)
        .order("punch_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(50),
      rider.name
        ? supabase
            .from("training_punches")
            .select("id, punch_type, duration_minutes, intensity, discipline, punch_date, created_at, horses(id, name)")
            .eq("rider_name", rider.name)
            .order("punch_date", { ascending: false })
            .order("created_at", { ascending: false })
            .limit(50)
        : { data: [] },
    ]);

    const byId = (byIdRes.data || []) as Array<Record<string, unknown>>;
    const byName = (byNameRes.data || []) as Array<Record<string, unknown>>;
    const seen = new Set<string>();
    const punches = [...byId, ...byName].filter((p) => {
      const pid = p.id as string;
      if (seen.has(pid)) return false;
      seen.add(pid);
      return true;
    });
    punches.sort((a, b) => {
      const da = new Date((a.punch_date || a.created_at) as string).getTime();
      const db = new Date((b.punch_date || b.created_at) as string).getTime();
      return db - da;
    });

    const mapped = punches.slice(0, 50).map((p) => {
      const horse = (p as { horses?: { id: string; name: string } | null }).horses;
      return {
        id: p.id,
        punchType: p.punch_type,
        duration: p.duration_minutes,
        intensity: p.intensity,
        discipline: p.discipline,
        punchDate: p.punch_date,
        createdAt: p.created_at,
        horse: horse ? { id: horse.id, name: horse.name } : null,
      };
    });

    return NextResponse.json(mapped);
  } catch (err) {
    console.error("GET rider sessions error:", err);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}
