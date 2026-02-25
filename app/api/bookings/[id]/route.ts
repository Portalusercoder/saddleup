import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendNotificationEmail } from "@/lib/send-notification-email";

export async function PATCH(
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

    const profile = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile.data) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }

    const body = await req.json();
    const role = profile.data.role as string;

    if (role === "student") {
      if (body.status !== "cancelled") {
        return NextResponse.json(
          { error: "Students can only cancel their own bookings" },
          { status: 403 }
        );
      }
      const { data: myRider } = await supabase
        .from("riders")
        .select("id")
        .eq("profile_id", user.id)
        .single();
      if (!myRider?.id) {
        return NextResponse.json({ error: "Rider not found" }, { status: 403 });
      }
      const { data, error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", id)
        .eq("rider_id", myRider.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      if (!data) {
        return NextResponse.json({ error: "Booking not found or not yours" }, { status: 404 });
      }
      return NextResponse.json(data);
    }

    if (role === "owner" || role === "trainer") {
      const updates: Record<string, unknown> = {};

      if (body.action === "approve") {
        updates.status = "scheduled";
      } else if (body.action === "decline") {
        updates.status = "declined";
        updates.declined_notes = body.declinedNotes?.trim() || null;
      }

      const isApproveOrDecline = body.action === "approve" || body.action === "decline";
      if (isApproveOrDecline) {
        const { data: booking } = await supabase
          .from("bookings")
          .select("id, rider_id, booking_date, start_time, horses(name)")
          .eq("id", id)
          .single();

        if (booking?.rider_id) {
          const { data: rider } = await supabase
            .from("riders")
            .select("profile_id")
            .eq("id", booking.rider_id)
            .single();

          if (rider?.profile_id) {
            const horseName = (booking as { horses?: { name: string } | null }).horses?.name ?? "your horse";
            const dateStr = (booking as { booking_date: string }).booking_date;
            const timeStr = (t: string) => String(t).slice(0, 5);
            const startStr = timeStr((booking as { start_time: string }).start_time);

            const { data: profile } = await supabase
              .from("profiles")
              .select("email")
              .eq("id", rider.profile_id)
              .single();

            const recipientEmail = profile?.email;

            if (body.action === "approve") {
              const title = "Lesson confirmed";
              const bodyText = `Your lesson with ${horseName} on ${dateStr} at ${startStr} has been confirmed.`;
              await supabase.rpc("create_notification", {
                p_profile_id: rider.profile_id,
                p_type: "booking_confirmed",
                p_title: title,
                p_body: bodyText,
                p_booking_id: id,
              });
              if (recipientEmail) {
                await sendNotificationEmail(
                  recipientEmail,
                  title,
                  `<p>${bodyText}</p><p><a href="${process.env.NEXT_PUBLIC_APP_URL || "https://localhost:3000"}/dashboard/bookings">View your bookings</a></p>`
                );
              }
            } else if (body.action === "decline") {
              const notes = body.declinedNotes?.trim() || "";
              const title = "Lesson request declined";
              const bodyText = notes
                ? `Your lesson request for ${dateStr} was declined. Note: ${notes}`
                : `Your lesson request for ${dateStr} at ${startStr} was declined.`;
              await supabase.rpc("create_notification", {
                p_profile_id: rider.profile_id,
                p_type: "booking_declined",
                p_title: title,
                p_body: bodyText,
                p_booking_id: id,
              });
              if (recipientEmail) {
                await sendNotificationEmail(recipientEmail, title, `<p>${bodyText}</p>`);
              }
            }
          }
        }
      }

      if (!isApproveOrDecline) {
        if (body.status != null) updates.status = body.status;
        if (body.declined_notes != null) updates.declined_notes = body.declined_notes;
        if (body.bookingDate != null) updates.booking_date = body.bookingDate;
        if (body.startTime != null) updates.start_time = body.startTime;
        if (body.endTime != null) updates.end_time = body.endTime;
        if (body.horseId != null) updates.horse_id = body.horseId;
        if (body.riderId != null) updates.rider_id = body.riderId;
        if (body.trainerId != null) updates.trainer_id = body.trainerId;
        if (body.notes != null) updates.notes = body.notes;
      }

      if (Object.keys(updates).length === 0) {
        return NextResponse.json({ error: "No updates provided" }, { status: 400 });
      }

      const bookingDate = body.bookingDate as string | undefined;
      const startTime = body.startTime as string | undefined;
      const endTime = body.endTime as string | undefined;

      if (bookingDate != null && startTime != null && endTime != null) {
        const { data: current } = await supabase
          .from("bookings")
          .select("horse_id, stable_id")
          .eq("id", id)
          .single();

        const horse = (current as { horse_id: string } | null)?.horse_id;
        const stableId = (current as { stable_id: string } | null)?.stable_id;

        if (horse && stableId) {
          const { data: existingBookings } = await supabase
            .from("bookings")
            .select("id, start_time, end_time")
            .eq("horse_id", horse)
            .eq("booking_date", bookingDate)
            .in("status", ["scheduled", "pending"])
            .neq("id", id);

          const newStart = String(startTime).slice(0, 5);
          const newEnd = String(endTime).slice(0, 5);

          const overlaps = (existingBookings || []).some((b: { start_time: string; end_time: string }) => {
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
            .eq("stable_id", stableId)
            .eq("blocked_date", bookingDate);

          const blocked = (blockedSlots || []).some((b: { start_time: string; end_time: string }) => {
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
      }

      const { data, error } = await supabase
        .from("bookings")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } catch (err) {
    console.error("PATCH booking error:", err);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}
