import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("stable_id, role").eq("id", user.id).single();
    if (!profile?.stable_id) return NextResponse.json({ error: "No stable found" }, { status: 404 });

    const admin = createAdminClient();
    const { error } = await admin.from("stables").update({ scheduled_deletion_at: null }).eq("id", profile.stable_id);
    if (error) return NextResponse.json({ error: "Failed to reactivate" }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Reactivate error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
