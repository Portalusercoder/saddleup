import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
    const fromDate = searchParams.get("from");
    const toDate = searchParams.get("to");

    let query = supabase
      .from("bookings")
      .select(
        `
        id,
        booking_date,
        start_time,
        end_time,
        status,
        notes,
        declined_notes,
        horse_id,
        rider_id,
        trainer_id,
        horses(id, name, photo_path),
        riders(id, name),
        trainer:profiles!trainer_id(id, full_name)
      `
      )
      .order("booking_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (fromDate) query = query.gte("booking_date", fromDate);
    if (toDate) query = query.lte("booking_date", toDate);

    const { data: bookings, error } = await query;

    if (error) {
      console.error("GET bookings error:", error);
      return NextResponse.json(
        { error: "Failed to fetch bookings" },
        { status: 500 }
      );
    }

    const mapped = (bookings || []).map((b: Record<string, unknown>) => {
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

    return NextResponse.json(mapped);
  } catch (err) {
    console.error("GET bookings error:", err);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
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

    const profile = await supabase
      .from("profiles")
      .select("stable_id, role")
      .eq("id", user.id)
      .single();

    if (!profile.data?.stable_id) {
      return NextResponse.json({ error: "No stable found" }, { status: 403 });
    }

    const body = await req.json();
    const { horseId, riderId, bookingDate, startTime, endTime, notes } = body;

    if (!horseId || !bookingDate || !startTime || !endTime) {
      return NextResponse.json(
        { error: "horseId, bookingDate, startTime, endTime are required" },
        { status: 400 }
      );
    }

    const role = profile.data.role as string;

    let finalRiderId = riderId || null;
    if (role === "student") {
      const { data: myRider } = await supabase
        .from("riders")
        .select("id")
        .eq("profile_id", user.id)
        .single();
      if (!myRider?.id) {
        return NextResponse.json(
          { error: "No rider profile found. Contact your stable." },
          { status: 403 }
        );
      }
      finalRiderId = myRider.id;
    }

    if (role === "student") {
      const { data: existingBookings } = await supabase
        .from("bookings")
        .select("id, start_time, end_time")
        .eq("horse_id", horseId)
        .eq("booking_date", bookingDate)
        .in("status", ["scheduled", "pending"]);

      const newStart = String(startTime).slice(0, 5);
      const newEnd = String(endTime).slice(0, 5);

      const overlaps = (existingBookings || []).some((b) => {
        const exStart = String(b.start_time).slice(0, 5);
        const exEnd = String(b.end_time).slice(0, 5);
        return exStart < newEnd && exEnd > newStart;
      });

      if (overlaps) {
        return NextResponse.json(
          { error: "This slot is full. Another lesson is already booked at this time." },
          { status: 400 }
        );
      }

      const { data: blockedSlots } = await supabase
        .from("blocked_slots")
        .select("id, start_time, end_time")
        .eq("stable_id", profile.data.stable_id)
        .eq("blocked_date", bookingDate);

      const blocked = (blockedSlots || []).some((b) => {
        const exStart = String(b.start_time).slice(0, 5);
        const exEnd = String(b.end_time).slice(0, 5);
        return exStart < newEnd && exEnd > newStart;
      });

      if (blocked) {
        return NextResponse.json(
          { error: "This time slot is not available. The stable is blocked." },
          { status: 400 }
        );
      }
    }

    const isStudent = role === "student";
    const status = isStudent ? "pending" : "scheduled";

    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({
        stable_id: profile.data.stable_id,
        horse_id: horseId,
        rider_id: finalRiderId,
        trainer_id: body.trainerId || null,
        booking_date: bookingDate,
        start_time: startTime,
        end_time: endTime,
        status,
        notes: notes?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      console.error("POST booking error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to create booking" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: booking.id,
      bookingDate: booking.booking_date,
      startTime: booking.start_time,
      endTime: booking.end_time,
      status: booking.status,
      horseId: booking.horse_id,
      riderId: booking.rider_id,
    });
  } catch (err) {
    console.error("POST booking error:", err);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
