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
      .select("stable_id, role")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "No profile found" }, { status: 404 });
    }

    const { data: stable } = await supabase
      .from("stables")
      .select("id, name, slug, invite_code, logo_url")
      .eq("id", profile.stable_id)
      .single();

    if (!stable) {
      return NextResponse.json({ error: "Stable not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: stable.id,
      name: stable.name,
      joinCode: stable.invite_code ?? stable.slug,
      role: profile.role,
      logoUrl: stable.logo_url ?? null,
    });
  } catch (err) {
    console.error("GET stable error:", err);
    return NextResponse.json(
      { error: "Failed to fetch stable" },
      { status: 500 }
    );
  }
}
