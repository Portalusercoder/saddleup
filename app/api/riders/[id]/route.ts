import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = (await params).id;

    const { data: rider, error } = await supabase
      .from("riders")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !rider) {
      return NextResponse.json({ error: "Rider not found" }, { status: 404 });
    }

    return NextResponse.json(rider);
  } catch (err) {
    console.error("GET rider error:", err);
    return NextResponse.json(
      { error: "Failed to fetch rider" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = (await params).id;
    const body = await req.json();

    const { data: rider, error } = await supabase
      .from("riders")
      .update({
        name: body.name?.trim(),
        email: body.email?.trim() || null,
        phone: body.phone?.trim() || null,
        level: body.level || body.ridingLevel || null,
        goals: body.goals?.trim() || null,
        assigned_trainer_id: body.assigned_trainer_id || null,
        guardian_id: body.guardian_id !== undefined ? body.guardian_id || null : undefined,
        notes: body.notes?.trim() || null,
        instructor_feedback: body.instructor_feedback?.trim() || body.instructorFeedback?.trim() || null,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("PUT rider error:", error);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    return NextResponse.json(rider);
  } catch (err) {
    console.error("PUT rider error:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = (await params).id;

    const { error } = await supabase.from("riders").delete().eq("id", id);

    if (error) {
      console.error("DELETE rider error:", error);
      return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE rider error:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
