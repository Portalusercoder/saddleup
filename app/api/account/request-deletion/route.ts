import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const DELAY_DAYS = 30;

/** Owner only: schedule stable (and account) for deletion in 30 days. User can reactivate before then. */
export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limit = checkRateLimit(`request-deletion:${ip}`, 5, 60_000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Try again in a minute." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

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
      return NextResponse.json({ error: "Only the stable owner can delete the account" }, { status: 403 });
    }

    const deadline = new Date();
    deadline.setDate(deadline.getDate() + DELAY_DAYS);

    const admin = createAdminClient();
    const { error } = await admin
      .from("stables")
      .update({ scheduled_deletion_at: deadline.toISOString() })
      .eq("id", profile.stable_id);

    if (error) {
      console.error("Request deletion error:", error);
      return NextResponse.json({ error: "Failed to schedule deletion" }, { status: 500 });
    }

    return NextResponse.json({ success: true, deletionAt: deadline.toISOString() });
  } catch (err) {
    console.error("Request deletion error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
