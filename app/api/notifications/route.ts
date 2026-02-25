import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendNotificationEmail } from "@/lib/send-notification-email";

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

    const profile = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile.data?.role === "student") {
      const { data: rider } = await supabase
        .from("riders")
        .select("id")
        .eq("profile_id", user.id)
        .single();

      if (rider?.id) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().slice(0, 10);

        const { data: upcoming } = await supabase
          .from("bookings")
          .select("id, booking_date, start_time, horses(name)")
          .eq("rider_id", rider.id)
          .eq("booking_date", tomorrowStr)
          .eq("status", "scheduled");

        const { data: existingReminders } = await supabase
          .from("notifications")
          .select("booking_id")
          .eq("profile_id", user.id)
          .eq("type", "lesson_reminder")
          .not("booking_id", "is", null);

        const existingIds = new Set(
          (existingReminders || []).map((r: { booking_id: string }) => r.booking_id)
        );

        for (const b of upcoming || []) {
          if (!existingIds.has((b as { id: string }).id)) {
            const horses = (b as { horses?: { name: string } | { name: string }[] | null }).horses;
            const horseName = (Array.isArray(horses) ? horses[0] : horses)?.name ?? "your horse";
            const startStr = String((b as { start_time: string }).start_time).slice(0, 5);
            const title = "Lesson tomorrow";
            const bodyText = `Reminder: Your lesson with ${horseName} tomorrow at ${startStr}.`;
            await supabase.rpc("create_notification", {
              p_profile_id: user.id,
              p_type: "lesson_reminder",
              p_title: title,
              p_body: bodyText,
              p_booking_id: (b as { id: string }).id,
            });
            const recipientEmail = user.email;
            if (recipientEmail) {
              await sendNotificationEmail(
                recipientEmail,
                title,
                `<p>${bodyText}</p><p><a href="${process.env.NEXT_PUBLIC_APP_URL || "https://localhost:3000"}/dashboard/bookings">View your bookings</a></p>`
              );
            }
          }
        }
      }
    }

    const { data, error } = await supabase
      .from("notifications")
      .select("id, type, title, body, booking_id, read_at, created_at")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("GET notifications error:", error);
      return NextResponse.json(
        { error: "Failed to fetch notifications" },
        { status: 500 }
      );
    }

    const mapped = (data || []).map((n: Record<string, unknown>) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      bookingId: n.booking_id,
      readAt: n.read_at,
      createdAt: n.created_at,
    }));

    return NextResponse.json(mapped);
  } catch (err) {
    console.error("GET notifications error:", err);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
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
    const { id, read } = body;

    if (!id || read !== true) {
      return NextResponse.json(
        { error: "id and read: true required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id)
      .eq("profile_id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to update" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: data.id,
      readAt: data.read_at,
    });
  } catch (err) {
    console.error("PATCH notifications error:", err);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}
