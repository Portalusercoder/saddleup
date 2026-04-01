import { randomBytes } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = ReturnType<typeof createAdminClient>;

/** URL-safe slug from stable display name (not necessarily unique). */
export function slugFromStableName(stableName: string): string {
  return stableName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Returns a slug that is not yet used in `stables.slug` (column stays UNIQUE).
 * Same display name as another stable → different slug (e.g. oak-farm-a3c9e2).
 */
export async function allocateUniqueSlug(
  admin: AdminClient,
  baseSlug: string
): Promise<string> {
  const base = (baseSlug || "stable").slice(0, 72);
  let candidate = base;

  for (let i = 0; i < 32; i++) {
    const { data: existing } = await admin
      .from("stables")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (!existing) return candidate;

    const suffix = randomBytes(3).toString("hex");
    candidate = `${base.slice(0, 56)}-${suffix}`.replace(/-+/g, "-").replace(/^-|-$/g, "") || `stable-${suffix}`;
  }

  throw new Error("Could not allocate a unique stable slug");
}
