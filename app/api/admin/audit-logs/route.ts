import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/admin";

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

    if (!isAdminEmail(user.email ?? undefined)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);

    const admin = createAdminClient();
    const platformActions = ["subscription_cancelled", "stable_deletion_scheduled", "reactivated"];
    const { data: logs, error } = await admin
      .from("audit_logs")
      .select(
        "id, actor_profile_id, stable_id, action, entity_type, entity_id, details, created_at"
      )
      .in("action", platformActions)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Admin audit logs error:", error);
      return NextResponse.json({ error: "Failed to load audit logs" }, { status: 500 });
    }

    const stableIds = [...new Set((logs ?? []).map((l) => l.stable_id).filter(Boolean))] as string[];
    const { data: stableNames } =
      stableIds.length > 0
        ? await admin.from("stables").select("id, name").in("id", stableIds)
        : { data: [] };
    const names = new Map((stableNames ?? []).map((s) => [s.id, s.name]));

    const rows = (logs ?? []).map((l) => ({
      id: l.id,
      actor_profile_id: l.actor_profile_id,
      stable_id: l.stable_id,
      stable_name: l.stable_id ? names.get(l.stable_id) ?? null : null,
      action: l.action,
      entity_type: l.entity_type,
      entity_id: l.entity_id,
      details: l.details,
      created_at: l.created_at,
    }));

    return NextResponse.json({ logs: rows });
  } catch (err) {
    console.error("Admin audit logs error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
