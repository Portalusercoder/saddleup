import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SUBSCRIPTION_LIMITS } from "@/lib/constants";

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

    const { data: profile } = await supabase
      .from("profiles")
      .select("stable_id, role")
      .eq("id", user.id)
      .single();

    if (!profile?.stable_id) {
      return NextResponse.json({ error: "No stable found" }, { status: 404 });
    }

    if (profile.role !== "owner" && profile.role !== "trainer") {
      return NextResponse.json({ error: "Analytics is for owners and trainers only" }, { status: 403 });
    }

    const { data: stable } = await supabase
      .from("stables")
      .select("subscription_tier")
      .eq("id", profile.stable_id)
      .single();

    const tier = (stable?.subscription_tier || "free") as keyof typeof SUBSCRIPTION_LIMITS;
    const limits = SUBSCRIPTION_LIMITS[tier] || SUBSCRIPTION_LIMITS.free;

    if (!limits.analytics) {
      return NextResponse.json(
        { error: "Upgrade to Starter or higher to access analytics", code: "ANALYTICS_LOCKED" },
        { status: 403 }
      );
    }

    const now = new Date();
    const eightWeeksAgo = new Date(now);
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

    const { data: punches, error: punchesError } = await supabase
      .from("training_punches")
      .select("id, punch_type, duration_minutes, punch_date, horse_id, horses(id, name)")
      .gte("punch_date", eightWeeksAgo.toISOString().slice(0, 10));

    if (punchesError) {
      console.error("Analytics punches error:", punchesError);
      return NextResponse.json(
        { error: "Failed to fetch analytics data" },
        { status: 500 }
      );
    }

    const { data: bookings } = await supabase
      .from("bookings")
      .select("id, booking_date, status")
      .eq("stable_id", profile.stable_id)
      .gte("booking_date", eightWeeksAgo.toISOString().slice(0, 10));

    type PunchRow = {
      punch_type: string;
      duration_minutes: number;
      punch_date: string;
      horse_id: string;
      horses: { id: string; name: string } | { id: string; name: string }[] | null;
    };
    const rawPunches = (punches || []) as unknown as PunchRow[];
    const punchList = rawPunches.map((p) => ({
      ...p,
      horses: Array.isArray(p.horses) ? p.horses[0] ?? null : p.horses,
    }));

    const activePunches = punchList.filter(
      (p) => p.punch_type !== "rest" && p.punch_type !== "medical"
    );

    const weekMap = new Map<string, { minutes: number; count: number }>();
    const base = new Date(now);
    base.setHours(0, 0, 0, 0);
    const baseDay = base.getDay();
    const baseWeekStart = new Date(base);
    baseWeekStart.setDate(base.getDate() - baseDay);

    for (let i = 0; i < 8; i++) {
      const weekStart = new Date(baseWeekStart);
      weekStart.setDate(baseWeekStart.getDate() - i * 7);
      const key = weekStart.toISOString().slice(0, 10);
      weekMap.set(key, { minutes: 0, count: 0 });
    }

    activePunches.forEach((p) => {
      const d = new Date(p.punch_date);
      d.setHours(0, 0, 0, 0);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().slice(0, 10);
      const curr = weekMap.get(key);
      if (curr) {
        curr.minutes += p.duration_minutes ?? 0;
        curr.count += 1;
      }
    });

    const sessionsByWeek = Array.from(weekMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([week, data]) => ({
        week,
        label: new Date(week).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" }),
        minutes: data.minutes,
        count: data.count,
      }));

    const punchTypeCount = new Map<string, number>();
    activePunches.forEach((p) => {
      const t = p.punch_type || "training";
      punchTypeCount.set(t, (punchTypeCount.get(t) || 0) + 1);
    });

    const punchTypeBreakdown = Array.from(punchTypeCount.entries()).map(([type, count]) => ({
      type: type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      count,
    }));

    const fourWeeksAgo = new Date(now);
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    const recentPunches = activePunches.filter(
      (p) => new Date(p.punch_date) >= fourWeeksAgo
    );

    const horseMinutes = new Map<string, { name: string; minutes: number }>();
    recentPunches.forEach((p) => {
      const name = p.horses?.name ?? "Unknown";
      const id = p.horse_id;
      const curr = horseMinutes.get(id);
      const mins = p.duration_minutes ?? 0;
      if (curr) {
        curr.minutes += mins;
      } else {
        horseMinutes.set(id, { name, minutes: mins });
      }
    });

    const horseWorkload = Array.from(horseMinutes.entries())
      .map(([horseId, data]) => ({ horseId, horseName: data.name, minutes: data.minutes }))
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 10);

    const upcomingBookings = (bookings || []).filter(
      (b: { booking_date: string; status: string }) =>
        new Date(b.booking_date) >= now && b.status === "scheduled"
    ).length;
    const completedBookings = (bookings || []).filter(
      (b: { booking_date: string; status: string }) =>
        new Date(b.booking_date) < now && (b.status === "scheduled" || b.status === "completed")
    ).length;

    const { data: healthLogs } = await supabase
      .from("health_logs")
      .select("horse_id, cost_cents, horses(id, name)")
      .not("cost_cents", "is", null);

    const horseCostMap = new Map<string, { name: string; costCents: number }>();
    const healthLogList = (healthLogs || []) as Array<{
      horse_id: string;
      cost_cents: number;
      horses: { id: string; name: string } | { id: string; name: string }[] | null;
    }>;
    healthLogList.forEach((h) => {
      const horse = Array.isArray(h.horses) ? h.horses[0] : h.horses;
      const name = horse?.name ?? "Unknown";
      const curr = horseCostMap.get(h.horse_id);
      const cents = h.cost_cents ?? 0;
      if (curr) {
        curr.costCents += cents;
      } else {
        horseCostMap.set(h.horse_id, { name, costCents: cents });
      }
    });

    const horseCosts = Array.from(horseCostMap.entries())
      .map(([horseId, data]) => ({
        horseId,
        horseName: data.name,
        cost: data.costCents / 100,
      }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 10);

    const totalCareCost = horseCosts.reduce((s, h) => s + h.cost, 0);

    return NextResponse.json({
      sessionsByWeek,
      punchTypeBreakdown,
      horseWorkload,
      horseCosts,
      totalCareCost,
      bookingsCount: { upcoming: upcomingBookings, completed: completedBookings },
      totalSessions: activePunches.length,
      totalMinutes: activePunches.reduce((s, p) => s + (p.duration_minutes ?? 0), 0),
    });
  } catch (err) {
    console.error("Analytics error:", err);
    return NextResponse.json(
      { error: "Failed to load analytics" },
      { status: 500 }
    );
  }
}
