import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateMonthlyReportPdf, type MonthlyReportData } from "@/lib/generateMonthlyReportPdf";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

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

    const { data: profile } = await supabase
      .from("profiles")
      .select("stable_id, role")
      .eq("id", user.id)
      .single();

    if (!profile?.stable_id || profile.role !== "owner") {
      return NextResponse.json(
        { error: "Only stable owners can download monthly reports" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()), 10);
    const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1), 10);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json({ error: "Invalid year or month" }, { status: 400 });
    }

    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    const stableId = profile.stable_id;

    // Fetch stable name
    const { data: stable } = await supabase
      .from("stables")
      .select("name")
      .eq("id", stableId)
      .single();

    const stableName = stable?.name || "Stable";

    // Bookings in month
    const { data: bookings } = await supabase
      .from("bookings")
      .select(`
        id, booking_date, start_time, end_time, status,
        horses(id, name),
        riders(id, name),
        trainer:profiles!trainer_id(id, full_name)
      `)
      .eq("stable_id", stableId)
      .gte("booking_date", startDate)
      .lte("booking_date", endDate)
      .order("booking_date", { ascending: true })
      .order("start_time", { ascending: true });

    // New members (profiles) created in month
    const { data: newMembers } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, id_card_url, created_at")
      .eq("stable_id", stableId)
      .gte("created_at", `${startDate}T00:00:00Z`)
      .lte("created_at", `${endDate}T23:59:59Z`)
      .order("created_at", { ascending: true });

    // New riders created in month
    const { data: newRiders } = await supabase
      .from("riders")
      .select("id, name, email, level, id_card_url, created_at")
      .eq("stable_id", stableId)
      .gte("created_at", `${startDate}T00:00:00Z`)
      .lte("created_at", `${endDate}T23:59:59Z`)
      .order("created_at", { ascending: true });

    // Training punches in month (via horses -> stable)
    const { data: horsesForStable } = await supabase
      .from("horses")
      .select("id")
      .eq("stable_id", stableId);

    const horseIds = (horsesForStable || []).map((h) => h.id);

    let trainingSessions: Record<string, unknown>[] = [];
    if (horseIds.length > 0) {
      const { data: punches } = await supabase
        .from("training_punches")
        .select(`
          id, punch_date, punch_type, duration_minutes, intensity,
          rider_name,
          horses(id, name)
        `)
        .in("horse_id", horseIds)
        .gte("punch_date", startDate)
        .lte("punch_date", endDate)
        .order("punch_date", { ascending: true });

      trainingSessions = punches || [];
    }

    // New horses created in month
    const { data: newHorses } = await supabase
      .from("horses")
      .select("id, name, breed, gender, age, created_at")
      .eq("stable_id", stableId)
      .gte("created_at", `${startDate}T00:00:00Z`)
      .lte("created_at", `${endDate}T23:59:59Z`)
      .order("created_at", { ascending: true });

    // Incidents in month
    const { data: incidents } = await supabase
      .from("incident_reports")
      .select(`
        id, incident_date, description, severity,
        horses(id, name),
        riders(id, name),
        rider_name
      `)
      .eq("stable_id", stableId)
      .gte("incident_date", startDate)
      .lte("incident_date", endDate)
      .order("incident_date", { ascending: true });

    // Competitions in month (via horses)
    let competitions: Record<string, unknown>[] = [];
    if (horseIds.length > 0) {
      const { data: comps } = await supabase
        .from("competitions")
        .select(`
          id, event_name, event_date, location, discipline,
          horses(id, name)
        `)
        .eq("stable_id", stableId)
        .gte("event_date", startDate)
        .lte("event_date", endDate)
        .order("event_date", { ascending: true });

      competitions = comps || [];
    }

    const reportData: MonthlyReportData = {
      stableName,
      year,
      month,
      monthLabel: MONTH_NAMES[month - 1],
      bookings: (bookings || []).map((b: Record<string, unknown>) => {
        const horse = b.horses as { id: string; name: string } | null;
        const rider = b.riders as { id: string; name: string } | null;
        const trainer = b.trainer as { id: string; full_name: string | null } | null;
        return {
          id: b.id as string,
          bookingDate: b.booking_date as string,
          startTime: b.start_time as string,
          endTime: b.end_time as string,
          status: b.status as string,
          horseName: horse?.name ?? "—",
          riderName: rider?.name ?? "—",
          trainerName: trainer?.full_name ?? null,
        };
      }),
      newMembers: (newMembers || []).map((m: Record<string, unknown>) => ({
        id: m.id as string,
        fullName: m.full_name as string | null,
        email: m.email as string | null,
        role: m.role as string,
        idCardUrl: m.id_card_url as string | null,
        createdAt: m.created_at as string,
      })),
      newRiders: (newRiders || []).map((r: Record<string, unknown>) => ({
        id: r.id as string,
        name: r.name as string,
        email: r.email as string | null,
        level: r.level as string | null,
        idCardUrl: r.id_card_url as string | null,
        createdAt: r.created_at as string,
      })),
      trainingSessions: (trainingSessions || []).map((p: Record<string, unknown>) => {
        const horse = p.horses as { id: string; name: string } | null;
        return {
          id: p.id as string,
          punchDate: p.punch_date as string,
          punchType: p.punch_type as string,
          durationMinutes: (p.duration_minutes as number) ?? 0,
          intensity: p.intensity as string | null,
          horseName: horse?.name ?? "—",
          riderName: (p.rider_name as string) ?? null,
        };
      }),
      newHorses: (newHorses || []).map((h: Record<string, unknown>) => ({
        id: h.id as string,
        name: h.name as string,
        breed: h.breed as string | null,
        gender: h.gender as string,
        age: h.age as number | null,
        createdAt: h.created_at as string,
      })),
      incidents: (incidents || []).map((i: Record<string, unknown>) => {
        const horse = i.horses as { id: string; name: string } | null;
        const rider = i.riders as { id: string; name: string } | null;
        return {
          id: i.id as string,
          incidentDate: i.incident_date as string,
          description: i.description as string,
          severity: i.severity as string | null,
          horseName: horse?.name ?? "—",
          riderName: (rider?.name as string) ?? (i.rider_name as string) ?? null,
        };
      }),
      competitions: (competitions || []).map((c: Record<string, unknown>) => {
        const horse = c.horses as { id: string; name: string } | null;
        return {
          id: c.id as string,
          eventName: c.event_name as string,
          eventDate: c.event_date as string,
          location: c.location as string | null,
          discipline: c.discipline as string | null,
          horseName: horse?.name ?? "—",
        };
      }),
    };

    const pdfBuffer = generateMonthlyReportPdf(reportData);

    const filename = `monthly-report-${stableName.replace(/\s+/g, "-")}-${year}-${String(month).padStart(2, "0")}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String((pdfBuffer as ArrayBuffer).byteLength),
      },
    });
  } catch (err) {
    console.error("Monthly report error:", err);
    return NextResponse.json(
      { error: "Failed to generate monthly report" },
      { status: 500 }
    );
  }
}
