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

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, stable_id")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "owner" && profile?.role !== "trainer") {
      return NextResponse.json(
        { error: "Only owners and trainers can list guardians" },
        { status: 403 }
      );
    }

    const { data: guardians, error } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("stable_id", profile.stable_id)
      .eq("role", "guardian")
      .order("full_name");

    if (error) {
      console.error("GET guardians error:", error);
      return NextResponse.json(
        { error: "Failed to fetch guardians" },
        { status: 500 }
      );
    }

    return NextResponse.json(guardians || []);
  } catch (err) {
    console.error("Guardian profiles error:", err);
    return NextResponse.json(
      { error: "Failed to fetch guardians" },
      { status: 500 }
    );
  }
}
