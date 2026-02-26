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

    if (!profile || !["owner", "trainer"].includes(profile.role as string)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const stableId = profile.stable_id;
    if (!stableId) {
      return NextResponse.json({ error: "No stable found" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("newsletter_campaigns")
      .select("id, subject, recipient_count, sent_at")
      .eq("stable_id", stableId)
      .order("sent_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("newsletter campaigns fetch error:", error);
      return NextResponse.json({ error: "Could not fetch campaigns" }, { status: 500 });
    }

    return NextResponse.json({ campaigns: data || [] });
  } catch (err) {
    console.error("newsletter campaigns error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
