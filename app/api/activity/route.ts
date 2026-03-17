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

    const { data: profile } = await supabase
      .from("profiles")
      .select("stable_id, role")
      .eq("id", user.id)
      .single();

    if (!profile?.stable_id) {
      return NextResponse.json({ error: "No stable" }, { status: 404 });
    }

    if (profile.role !== "owner" && profile.role !== "trainer") {
      return NextResponse.json({ error: "Only owners and trainers can view activity" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit")) || 100, 200);

    const { data: logs, error } = await supabase
      .from("audit_logs")
      .select("id, action, entity_type, entity_id, details, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Activity logs error:", error);
      return NextResponse.json({ error: "Failed to load activity" }, { status: 500 });
    }

    return NextResponse.json({ logs: logs ?? [] });
  } catch (err) {
    console.error("Activity error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
