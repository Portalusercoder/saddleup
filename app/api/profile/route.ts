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

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url, role, stable_id, id_card_url")
      .eq("id", user.id)
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    let myRiderId: string | null = null;
    if (profile.role === "student") {
      const { data: rider } = await supabase
        .from("riders")
        .select("id")
        .eq("profile_id", user.id)
        .single();
      myRiderId = rider?.id ?? null;
    }

    return NextResponse.json({
      id: profile.id,
      fullName: profile.full_name,
      email: profile.email ?? user.email,
      avatarUrl: profile.avatar_url,
      role: profile.role,
      id_card_url: profile.id_card_url,
      myRiderId,
    });
  } catch (err) {
    console.error("GET profile error:", err);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { fullName, avatarUrl } = body;

    const updates: Record<string, unknown> = {};
    if (typeof fullName === "string") updates.full_name = fullName.trim();
    if (typeof avatarUrl === "string") updates.avatar_url = avatarUrl.trim() || null;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid updates" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      id: data.id,
      fullName: data.full_name,
      email: data.email ?? user.email,
      avatarUrl: data.avatar_url,
      role: data.role,
    });
  } catch (err) {
    console.error("PUT profile error:", err);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
