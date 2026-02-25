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

    const profile = await supabase
      .from("profiles")
      .select("stable_id, role")
      .eq("id", user.id)
      .single();

    if (!profile.data?.stable_id) {
      return NextResponse.json({ error: "No stable found" }, { status: 403 });
    }

    const role = profile.data.role as string;
    if (role !== "owner" && role !== "trainer") {
      return NextResponse.json(
        { error: "Only owners and trainers can view blocked slots" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const fromDate = searchParams.get("from");
    const toDate = searchParams.get("to");

    let query = supabase
      .from("blocked_slots")
      .select("id, blocked_date, start_time, end_time, reason")
      .eq("stable_id", profile.data.stable_id)
      .order("blocked_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (fromDate) query = query.gte("blocked_date", fromDate);
    if (toDate) query = query.lte("blocked_date", toDate);

    const { data, error } = await query;

    if (error) {
      console.error("GET blocked slots error:", error);
      return NextResponse.json(
        { error: "Failed to fetch blocked slots" },
        { status: 500 }
      );
    }

    const mapped = (data || []).map((b: Record<string, unknown>) => ({
      id: b.id,
      blockedDate: b.blocked_date,
      startTime: b.start_time,
      endTime: b.end_time,
      reason: b.reason,
    }));

    return NextResponse.json(mapped);
  } catch (err) {
    console.error("GET blocked slots error:", err);
    return NextResponse.json(
      { error: "Failed to fetch blocked slots" },
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

    const role = profile.data.role as string;
    if (role !== "owner" && role !== "trainer") {
      return NextResponse.json(
        { error: "Only owners and trainers can block slots" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { blockedDate, startTime, endTime, reason } = body;

    if (!blockedDate || !startTime || !endTime) {
      return NextResponse.json(
        { error: "blockedDate, startTime, endTime are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("blocked_slots")
      .insert({
        stable_id: profile.data.stable_id,
        blocked_date: blockedDate,
        start_time: startTime,
        end_time: endTime,
        reason: reason?.trim() || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("POST blocked slot error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to block slot" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: data.id,
      blockedDate: data.blocked_date,
      startTime: data.start_time,
      endTime: data.end_time,
      reason: data.reason,
    });
  } catch (err) {
    console.error("POST blocked slot error:", err);
    return NextResponse.json(
      { error: "Failed to block slot" },
      { status: 500 }
    );
  }
}
