import { createClient } from "@/lib/supabase/server";
import { SUBSCRIPTION_LIMITS } from "@/lib/constants";

type Tier = keyof typeof SUBSCRIPTION_LIMITS;

export async function checkHorseLimit(stableId: string): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
  tier: Tier;
  message?: string;
}> {
  const supabase = await createClient();

  const { data: stable } = await supabase
    .from("stables")
    .select("subscription_tier")
    .eq("id", stableId)
    .single();

  const tier = (stable?.subscription_tier || "free") as Tier;
  const limits = SUBSCRIPTION_LIMITS[tier] || SUBSCRIPTION_LIMITS.free;

  const { count } = await supabase
    .from("horses")
    .select("id", { count: "exact", head: true })
    .eq("stable_id", stableId);

  const current = count ?? 0;
  const allowed = current < limits.horses;

  return {
    allowed,
    current,
    limit: limits.horses,
    tier,
    message: allowed ? undefined : `Horse limit reached (${limits.horses}). Upgrade your plan to add more.`,
  };
}

export async function checkRiderLimit(stableId: string): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
  tier: Tier;
  message?: string;
}> {
  const supabase = await createClient();

  const { data: stable } = await supabase
    .from("stables")
    .select("subscription_tier")
    .eq("id", stableId)
    .single();

  const tier = (stable?.subscription_tier || "free") as Tier;
  const limits = SUBSCRIPTION_LIMITS[tier] || SUBSCRIPTION_LIMITS.free;

  const { count } = await supabase
    .from("riders")
    .select("id", { count: "exact", head: true })
    .eq("stable_id", stableId);

  const current = count ?? 0;
  const allowed = current < limits.riders;

  return {
    allowed,
    current,
    limit: limits.riders,
    tier,
    message: allowed ? undefined : `Rider limit reached (${limits.riders}). Upgrade your plan to add more.`,
  };
}
