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

    if (!profile?.stable_id || !["owner", "trainer"].includes(profile.role)) {
      return NextResponse.json(
        { error: "Only owners and trainers can view workers" },
        { status: 403 }
      );
    }

    const { data: workers, error } = await supabase
      .from("workers")
      .select("id, name, email, phone, role, notes, created_at")
      .eq("stable_id", profile.stable_id)
      .order("name");

    if (error) {
      console.error("GET workers error:", error);
      return NextResponse.json(
        { error: "Failed to fetch workers" },
        { status: 500 }
      );
    }

    return NextResponse.json(workers || []);
  } catch (err) {
    console.error("GET workers error:", err);
    return NextResponse.json(
      { error: "Failed to fetch workers" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
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

    if (!profile?.stable_id || profile.role !== "owner") {
      return NextResponse.json(
        { error: "Only owners can add workers" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, email, phone, role, notes } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (!role || typeof role !== "string" || !role.trim()) {
      return NextResponse.json(
        { error: "Role is required" },
        { status: 400 }
      );
    }

    const { data: worker, error } = await supabase
      .from("workers")
      .insert({
        stable_id: profile.stable_id,
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        role: role.trim(),
        notes: notes?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      console.error("POST workers error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to add worker" },
        { status: 500 }
      );
    }

    return NextResponse.json(worker);
  } catch (err) {
    console.error("POST workers error:", err);
    return NextResponse.json(
      { error: "Failed to add worker" },
      { status: 500 }
    );
  }
}
