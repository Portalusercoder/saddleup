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
  stripe_customer_id: string | null;
};

/** One row per stable: owner contact only (no full user list for privacy). */
export type AdminOwner = {
  stable_id: string;
  stable_name: string;
  owner_email: string | null;
  owner_name: string | null;
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
      .select("id, name, slug, subscription_tier, subscription_status, trial_ends_at, created_at, stripe_customer_id")
      .order("created_at", { ascending: false });

    if (stablesError) {
      console.error("Admin stables error:", stablesError);
      return NextResponse.json({ error: "Failed to load stables" }, { status: 500 });
    }

    const stableIds = (stables ?? []).map((s) => s.id);

    const [ownersRes, horseCountsRes] = await Promise.all([
      admin
        .from("profiles")
        .select("stable_id, email, full_name")
        .in("stable_id", stableIds.length ? stableIds : ["__none__"])
        .eq("role", "owner"),
      Promise.all(
        stableIds.map((sid) =>
          admin.from("horses").select("id", { count: "exact", head: true }).eq("stable_id", sid)
        )
      ),
    ]);

    const memberCountsRes = await Promise.all(
      stableIds.map((sid) =>
        admin.from("profiles").select("id", { count: "exact", head: true }).eq("stable_id", sid)
      )
    );
    const memberCountByStable = new Map<string, number>();
    memberCountsRes.forEach((r, i) => {
      memberCountByStable.set(stableIds[i], r.count ?? 0);
    });

    const horseCounts = new Map<string, number>();
    horseCountsRes.forEach((r, i) => {
      horseCounts.set(stableIds[i], r.count ?? 0);
    });

    const stableNames = new Map<string, string>();
    (stables ?? []).forEach((s) => stableNames.set(s.id, s.name));

    const ownerByStable = new Map<string, { email: string | null; full_name: string | null }>();
    (ownersRes.data ?? []).forEach((o) => {
      ownerByStable.set(o.stable_id, { email: o.email ?? null, full_name: o.full_name ?? null });
    });

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
      stripe_customer_id: s.stripe_customer_id ?? null,
    }));

    const adminOwners: AdminOwner[] = (stables ?? []).map((s) => {
      const owner = ownerByStable.get(s.id);
      return {
        stable_id: s.id,
        stable_name: s.name,
        owner_email: owner?.email ?? null,
        owner_name: owner?.full_name ?? null,
      };
    });

    const subscriptionCounts = {
      trialing: adminStables.filter((s) => s.subscription_status === "trialing").length,
      active: adminStables.filter((s) => s.subscription_status === "active").length,
      expired: adminStables.filter((s) => s.subscription_status === "expired").length,
      past_due: adminStables.filter((s) => s.subscription_status === "past_due").length,
      cancelled: adminStables.filter((s) => s.subscription_status === "cancelled").length,
    };

    return NextResponse.json({
      stables: adminStables,
      owners: adminOwners,
      subscriptionCounts,
      totalStables: adminStables.length,
    });
  } catch (err) {
    console.error("Admin overview error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
