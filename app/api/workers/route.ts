import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureStableCanMutate } from "@/lib/subscription";
import { parseJsonBody } from "@/lib/validation/parse-json";
import { workerPostSchema } from "@/lib/validation/schemas";

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

    const guard = await ensureStableCanMutate(profile.stable_id);
    if (!guard.allowed) {
      return NextResponse.json(
        { error: guard.message, code: "TRIAL_EXPIRED" },
        { status: 403 }
      );
    }

    const parsed = await parseJsonBody(req, workerPostSchema);
    if (!parsed.ok) return parsed.response;
    const { name, email, phone, role, notes } = parsed.data;

    const { data: worker, error } = await supabase
      .from("workers")
      .insert({
        stable_id: profile.stable_id,
        name,
        email,
        phone,
        role,
        notes,
      })
      .select()
      .single();

    if (error) {
      console.error("POST workers error:", error);
      return NextResponse.json(
        { error: "Failed to add worker" },
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
