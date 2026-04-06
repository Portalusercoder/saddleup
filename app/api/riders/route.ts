import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRiderLimit, ensureStableCanMutate } from "@/lib/subscription";
import { parseJsonBody } from "@/lib/validation/parse-json";
import { riderPostSchema } from "@/lib/validation/schemas";

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

    const { data: riders, error } = await supabase
      .from("riders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("GET riders error:", error);
      return NextResponse.json(
        { error: "Failed to fetch riders" },
        { status: 500 }
      );
    }

    return NextResponse.json(riders || []);
  } catch (err) {
    console.error("GET riders error:", err);
    return NextResponse.json(
      { error: "Failed to fetch riders" },
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

    const profile = await supabase
      .from("profiles")
      .select("stable_id, role")
      .eq("id", user.id)
      .single();

    if (!profile.data?.stable_id) {
      return NextResponse.json({ error: "No stable found" }, { status: 403 });
    }

    const guard = await ensureStableCanMutate(profile.data.stable_id);
    if (!guard.allowed) {
      return NextResponse.json(
        { error: guard.message, code: "TRIAL_EXPIRED" },
        { status: 403 }
      );
    }

    const role = profile.data.role as string;
    if (role !== "owner" && role !== "trainer") {
      return NextResponse.json(
        { error: "Only owners and trainers can add riders." },
        { status: 403 }
      );
    }

    const parsed = await parseJsonBody(req, riderPostSchema);
    if (!parsed.ok) return parsed.response;

    const body = parsed.data;

    const limitCheck = await checkRiderLimit(profile.data.stable_id);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { error: limitCheck.message, code: "LIMIT_REACHED" },
        { status: 403 }
      );
    }

    const { data: rider, error } = await supabase
      .from("riders")
      .insert({
        stable_id: profile.data.stable_id,
        name: body.name,
        email: body.email,
        phone: body.phone,
        level: body.level ?? body.ridingLevel,
        goals: body.goals,
        assigned_trainer_id: body.assigned_trainer_id,
        notes: body.notes,
        instructor_feedback:
          body.instructor_feedback ?? body.instructorFeedback,
      })
      .select()
      .single();

    if (error) {
      console.error("POST rider error:", error);
      return NextResponse.json(
        { error: "Failed to create rider" },
        { status: 500 }
      );
    }

    return NextResponse.json(rider);
  } catch (err) {
    console.error("POST rider error:", err);
    return NextResponse.json(
      { error: "Failed to create rider" },
      { status: 500 }
    );
  }
}
