import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

type Admin = ReturnType<typeof createAdminClient>;

/**
 * If the current session is a Supabase user with **no** `profiles` row (incomplete signup),
 * sign out and delete the auth user so retries don't hit "already registered" / ghost sessions.
 * No-ops when there is no user or a profile already exists.
 */
export async function cleanupIncompleteSignupSession(
  supabase: SupabaseClient,
  admin: Admin
): Promise<{ cleaned: boolean }> {
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user?.id) {
    return { cleaned: false };
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (profile) {
    return { cleaned: false };
  }

  const id = user.id;
  await supabase.auth.signOut();

  const { error: delErr } = await admin.auth.admin.deleteUser(id);
  if (delErr) {
    console.error("cleanupIncompleteSignupSession deleteUser:", delErr);
  }

  return { cleaned: true };
}
