import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SUBSCRIPTION_LIMITS } from "@/lib/constants";
import { computeMatch } from "@/lib/matching";

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

    if (!profile?.stable_id) {
      return NextResponse.json({ error: "No stable found" }, { status: 404 });
    }

    if (profile.role !== "owner" && profile.role !== "trainer") {
      return NextResponse.json({ error: "Matching is for owners and trainers only" }, { status: 403 });
    }

    const { data: stable } = await supabase
      .from("stables")
      .select("subscription_tier")
      .eq("id", profile.stable_id)
      .single();

    const tier = (stable?.subscription_tier || "free") as keyof typeof SUBSCRIPTION_LIMITS;
    const limits = SUBSCRIPTION_LIMITS[tier] || SUBSCRIPTION_LIMITS.free;

    if (!limits.matching) {
      return NextResponse.json(
        { error: "Upgrade to Stable or Enterprise for horse–rider matching", code: "MATCHING_LOCKED" },
        { status: 403 }
      );
    }

    const [horsesRes, ridersRes, assignmentsRes] = await Promise.all([
      supabase
        .from("horses")
        .select("id, name, temperament, skill_level, suitability")
        .eq("stable_id", profile.stable_id),
      supabase
        .from("riders")
        .select("id, name, level")
        .eq("stable_id", profile.stable_id),
      supabase
        .from("rider_horse_assignments")
        .select("rider_id, horse_id")
        .eq("stable_id", profile.stable_id),
    ]);

    const horses = (horsesRes.data || []) as Array<{
      id: string;
      name: string;
      temperament: string | null;
      skill_level: string | null;
      suitability: string[] | string | null;
    }>;
    const riders = (ridersRes.data || []) as Array<{
      id: string;
      name: string;
      level: string | null;
    }>;
    const assignments = (assignmentsRes.data || []) as Array<{ rider_id: string; horse_id: string }>;
    const assignedSet = new Set(assignments.map((a) => `${a.rider_id}:${a.horse_id}`));

    const riderSuggestions = riders.map((rider) => {
      const suggested = horses
        .filter((h) => !assignedSet.has(`${rider.id}:${h.id}`))
        .map((horse) => {
          const suitabilityStr = Array.isArray(horse.suitability)
            ? horse.suitability.join(", ")
            : horse.suitability;
          const match = computeMatch(
            rider.level as "beginner" | "intermediate" | "advanced" | null,
            horse.temperament as "calm" | "energetic" | "sensitive" | "beginner_safe" | null,
            horse.skill_level as "beginner" | "intermediate" | "advanced" | null,
            suitabilityStr
          );
          return {
            horseId: horse.id,
            horseName: horse.name,
            ...match,
          };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 8);

      const assigned = horses
        .filter((h) => assignedSet.has(`${rider.id}:${h.id}`))
        .map((h) => ({ horseId: h.id, horseName: h.name }));

      return {
        riderId: rider.id,
        riderName: rider.name,
        riderLevel: rider.level,
        assigned,
        suggested,
      };
    });

    const horseSuggestions = horses.map((horse) => {
      const suggested = riders
        .filter((r) => !assignedSet.has(`${r.id}:${horse.id}`))
        .map((rider) => {
          const suitabilityStr = Array.isArray(horse.suitability)
            ? horse.suitability.join(", ")
            : horse.suitability;
          const match = computeMatch(
            rider.level as "beginner" | "intermediate" | "advanced" | null,
            horse.temperament as "calm" | "energetic" | "sensitive" | "beginner_safe" | null,
            horse.skill_level as "beginner" | "intermediate" | "advanced" | null,
            suitabilityStr
          );
          return {
            riderId: rider.id,
            riderName: rider.name,
            riderLevel: rider.level,
            ...match,
          };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 8);

      const assigned = riders
        .filter((r) => assignedSet.has(`${r.id}:${horse.id}`))
        .map((r) => ({ riderId: r.id, riderName: r.name }));

      return {
        horseId: horse.id,
        horseName: horse.name,
        horseTemperament: horse.temperament,
        horseSkillLevel: horse.skill_level,
        assigned,
        suggested,
      };
    });

    return NextResponse.json({
      riderSuggestions,
      horseSuggestions,
    });
  } catch (err) {
    console.error("Matching error:", err);
    return NextResponse.json(
      { error: "Failed to load matching" },
      { status: 500 }
    );
  }
}
