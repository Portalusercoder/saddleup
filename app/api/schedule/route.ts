import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Combined schedule API - fetches horses, sessions, bookings, blocked slots in one request.
 * Reduces 4 round trips + 4 auth checks to 1.
 */
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

    const profile = await supabase
      .from("profiles")
      .select("stable_id, role")
      .eq("id", user.id)
      .single();

    if (!profile.data?.stable_id) {
      return NextResponse.json({ error: "No stable found" }, { status: 403 });
    }

    const role = profile.data.role as string;
    if (role === "student") {
      return NextResponse.json(
        { error: "Students cannot access schedule" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const fromDate = searchParams.get("from");
    const toDate = searchParams.get("to");

    const stableId = profile.data.stable_id;

    let bookingsQuery = supabase
      .from("bookings")
      .select(
        `
        id, booking_date, start_time, end_time, status, notes, declined_notes,
        horse_id, rider_id, trainer_id,
        horses(id, name, photo_path),
        riders(id, name),
        trainer:profiles!trainer_id(id, full_name)
      `
      )
      .order("booking_date", { ascending: true })
      .order("start_time", { ascending: true });
    if (fromDate) bookingsQuery = bookingsQuery.gte("booking_date", fromDate);
    if (toDate) bookingsQuery = bookingsQuery.lte("booking_date", toDate);

    let blockedQuery = supabase
      .from("blocked_slots")
      .select("id, blocked_date, start_time, end_time, reason")
      .eq("stable_id", stableId)
      .order("blocked_date", { ascending: true })
      .order("start_time", { ascending: true });
    if (fromDate) blockedQuery = blockedQuery.gte("blocked_date", fromDate);
    if (toDate) blockedQuery = blockedQuery.lte("blocked_date", toDate);

    const [horsesRes, bookingsRes, blockedRes] = await Promise.all([
      supabase
        .from("horses")
        .select("*, training_punches(*)")
        .order("created_at", { ascending: false }),
      bookingsQuery,
      blockedQuery,
    ]);

    if (horsesRes.error) {
      console.error("Schedule horses error:", horsesRes.error);
      return NextResponse.json(
        { error: "Failed to fetch horses" },
        { status: 500 }
      );
    }
    if (bookingsRes.error) {
      console.error("Schedule bookings error:", bookingsRes.error);
      return NextResponse.json(
        { error: "Failed to fetch bookings" },
        { status: 500 }
      );
    }
    if (blockedRes.error) {
      console.error("Schedule blocked slots error:", blockedRes.error);
      return NextResponse.json(
        { error: "Failed to fetch blocked slots" },
        { status: 500 }
      );
    }

    const horses = (horsesRes.data || []).map((h) => {
      const punches = (h as { training_punches?: unknown[] }).training_punches || [];
      const sessions = punches.map((p) => {
        const x = p as Record<string, unknown>;
        return {
          id: x.id,
          punchType: x.punch_type,
          duration: x.duration_minutes,
          intensity: x.intensity,
          discipline: x.discipline,
          rider: x.rider_name,
          createdAt: x.created_at,
        };
      });
      return {
        id: h.id,
        name: h.name,
        photoUrl: h.photo_path,
        sessions,
      };
    });

    const sessions = horses.flatMap((h) =>
      (h.sessions || []).map((s) => ({
        ...s,
        horse: { name: h.name, photoUrl: h.photoUrl },
      }))
    );

    const bookings = (bookingsRes.data || []).map((b: Record<string, unknown>) => {
      const horse = b.horses as { id: string; name: string; photo_path: string | null } | null;
      const rider = b.riders as { id: string; name: string } | null;
      const trainer = b.trainer as { id: string; full_name: string | null } | null;
      return {
        id: b.id,
        bookingDate: b.booking_date,
        startTime: b.start_time,
        endTime: b.end_time,
        status: b.status,
        notes: b.notes,
        declinedNotes: b.declined_notes,
        horseId: b.horse_id,
        riderId: b.rider_id,
        trainerId: b.trainer_id,
        horse: horse ? { id: horse.id, name: horse.name, photoUrl: horse.photo_path } : null,
        rider: rider ? { id: rider.id, name: rider.name } : null,
        trainer: trainer ? { id: trainer.id, fullName: trainer.full_name } : null,
      };
    });

    const blockedSlots = (blockedRes.data || []).map((b: Record<string, unknown>) => ({
      id: b.id,
      blockedDate: b.blocked_date,
      startTime: b.start_time,
      endTime: b.end_time,
      reason: b.reason,
    }));

    return NextResponse.json({
      horses,
      sessions,
      bookings,
      blockedSlots,
    });
  } catch (err) {
    console.error("Schedule API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch schedule" },
      { status: 500 }
    );
  }
}
