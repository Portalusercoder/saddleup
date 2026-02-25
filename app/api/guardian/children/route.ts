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
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "guardian") {
      return NextResponse.json(
        { error: "Guardian access only" },
        { status: 403 }
      );
    }

    const { data: riders, error } = await supabase
      .from("riders")
      .select("id, name, email, phone, level, goals")
      .eq("guardian_id", user.id)
      .order("name");

    if (error) {
      console.error("Guardian children error:", error);
      return NextResponse.json(
        { error: "Failed to fetch children" },
        { status: 500 }
      );
    }

    return NextResponse.json(riders || []);
  } catch (err) {
    console.error("Guardian children error:", err);
    return NextResponse.json(
      { error: "Failed to fetch children" },
      { status: 500 }
    );
  }
}
