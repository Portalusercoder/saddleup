import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
      .select("stable_id, role")
      .eq("id", user.id)
      .single();

    if (!profile.data?.stable_id) {
      return NextResponse.json({ error: "No stable found" }, { status: 403 });
    }

    const role = profile.data.role as string;
    if (role !== "owner" && role !== "trainer") {
      return NextResponse.json(
        { error: "Only owners and trainers can view team members" },
        { status: 403 }
      );
    }

    const { data: members, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, id_card_url")
      .eq("stable_id", profile.data.stable_id)
      .order("role", { ascending: true })
      .order("full_name", { ascending: true });

    if (error) {
      console.error("GET members error:", error);
      return NextResponse.json(
        { error: "Failed to fetch members" },
        { status: 500 }
      );
    }

    return NextResponse.json(members || []);
  } catch (err) {
    console.error("GET members error:", err);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}
