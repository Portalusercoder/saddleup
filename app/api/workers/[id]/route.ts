import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
        { error: "Only owners can edit workers" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, email, phone, role, notes } = body;

    const updates: Record<string, unknown> = {};
    if (name !== undefined) {
      const v = (name?.trim() || "").slice(0, 500);
      if (!v) return NextResponse.json({ error: "Name is required" }, { status: 400 });
      updates.name = v;
    }
    if (email !== undefined) updates.email = email?.trim() || null;
    if (phone !== undefined) updates.phone = phone?.trim() || null;
    if (role !== undefined) {
      const v = (role?.trim() || "").slice(0, 200);
      if (!v) return NextResponse.json({ error: "Role is required" }, { status: 400 });
      updates.role = v;
    }
    if (notes !== undefined) updates.notes = notes?.trim() || null;
    updates.updated_at = new Date().toISOString();

    const { data: worker, error } = await supabase
      .from("workers")
      .update(updates)
      .eq("id", id)
      .eq("stable_id", profile.stable_id)
      .select()
      .single();

    if (error) {
      console.error("PUT workers error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to update worker" },
        { status: 500 }
      );
    }

    if (!worker) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    return NextResponse.json(worker);
  } catch (err) {
    console.error("PUT workers error:", err);
    return NextResponse.json(
      { error: "Failed to update worker" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
        { error: "Only owners can delete workers" },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from("workers")
      .delete()
      .eq("id", id)
      .eq("stable_id", profile.stable_id);

    if (error) {
      console.error("DELETE workers error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to delete worker" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE workers error:", err);
    return NextResponse.json(
      { error: "Failed to delete worker" },
      { status: 500 }
    );
  }
}
