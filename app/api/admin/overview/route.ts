import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/admin";

export type AdminStable = {
  id: string;
  name: string;
  slug: string | null;
  subscription_tier: string;
  subscription_status: string;
  trial_ends_at: string | null;
  created_at: string;
  member_count: number;
  horse_count: number;
};

export type AdminUser = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  stable_id: string;
  stable_name: string | null;
  created_at: string;
};

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

    if (!isAdminEmail(user.email ?? undefined)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const admin = createAdminClient();

    const { data: stables, error: stablesError } = await admin
      .from("stables")
      .select("id, name, slug, subscription_tier, subscription_status, trial_ends_at, created_at")
      .order("created_at", { ascending: false });

    if (stablesError) {
      console.error("Admin stables error:", stablesError);
      return NextResponse.json({ error: "Failed to load stables" }, { status: 500 });
    }

    const stableIds = (stables ?? []).map((s) => s.id);

    const [profilesRes, horseCountsRes] = await Promise.all([
      admin
        .from("profiles")
        .select("id, email, full_name, role, stable_id, created_at")
        .in("stable_id", stableIds.length ? stableIds : ["__none__"]),
      Promise.all(
        stableIds.map((sid) =>
          admin.from("horses").select("id", { count: "exact", head: true }).eq("stable_id", sid)
        )
      ),
    ]);

    const profiles = profilesRes.data ?? [];
    const horseCounts = new Map<string, number>();
    horseCountsRes.forEach((r, i) => {
      horseCounts.set(stableIds[i], r.count ?? 0);
    });

    const memberCountByStable = new Map<string, number>();
    profiles.forEach((p) => {
      memberCountByStable.set(p.stable_id, (memberCountByStable.get(p.stable_id) ?? 0) + 1);
    });

    const stableNames = new Map<string, string>();
    (stables ?? []).forEach((s) => stableNames.set(s.id, s.name));

    const adminStables: AdminStable[] = (stables ?? []).map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug ?? null,
      subscription_tier: s.subscription_tier ?? "free",
      subscription_status: s.subscription_status ?? "trialing",
      trial_ends_at: s.trial_ends_at ?? null,
      created_at: s.created_at,
      member_count: memberCountByStable.get(s.id) ?? 0,
      horse_count: horseCounts.get(s.id) ?? 0,
    }));

    const adminUsers: AdminUser[] = profiles.map((p) => ({
      id: p.id,
      email: p.email ?? null,
      full_name: p.full_name ?? null,
      role: p.role ?? "student",
      stable_id: p.stable_id,
      stable_name: stableNames.get(p.stable_id) ?? null,
      created_at: p.created_at,
    }));

    const subscriptionCounts = {
      trialing: adminStables.filter((s) => s.subscription_status === "trialing").length,
      active: adminStables.filter((s) => s.subscription_status === "active").length,
      expired: adminStables.filter((s) => s.subscription_status === "expired").length,
      past_due: adminStables.filter((s) => s.subscription_status === "past_due").length,
      cancelled: adminStables.filter((s) => s.subscription_status === "cancelled").length,
    };

    return NextResponse.json({
      stables: adminStables,
      users: adminUsers,
      subscriptionCounts,
      totalStables: adminStables.length,
      totalUsers: adminUsers.length,
    });
  } catch (err) {
    console.error("Admin overview error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
