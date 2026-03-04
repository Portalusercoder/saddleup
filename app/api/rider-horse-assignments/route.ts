import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureStableCanMutate } from "@/lib/subscription";

export async function GET(req: Request) {
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

    if (!profile.data) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }

    const role = profile.data.role as string;
    if (role !== "owner" && role !== "trainer") {
      return NextResponse.json(
        { error: "Only trainers and owners can manage horse assignments" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const riderId = searchParams.get("riderId");

    let query = supabase
      .from("rider_horse_assignments")
      .select("id, rider_id, horse_id, suitability_notes, riders(id, name), horses(id, name)")
      .eq("stable_id", profile.data.stable_id)
      .order("created_at", { ascending: false });

    if (riderId) {
      query = query.eq("rider_id", riderId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("GET rider-horse assignments error:", error);
      return NextResponse.json(
        { error: "Failed to fetch assignments" },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (err) {
    console.error("GET rider-horse assignments error:", err);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
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
        { error: "Only trainers and owners can assign horses to riders" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { riderId, horseId, suitabilityNotes } = body;

    if (!riderId || !horseId) {
      return NextResponse.json(
        { error: "riderId and horseId are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("rider_horse_assignments")
      .insert({
        stable_id: profile.data.stable_id,
        rider_id: riderId,
        horse_id: horseId,
        suitability_notes: suitabilityNotes?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "This horse is already assigned to this rider" },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: error.message || "Failed to create assignment" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("POST rider-horse assignment error:", err);
    return NextResponse.json(
      { error: "Failed to create assignment" },
      { status: 500 }
    );
  }
}
