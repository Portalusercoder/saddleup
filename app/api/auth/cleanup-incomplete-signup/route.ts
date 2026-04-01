import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cleanupIncompleteSignupSession } from "@/lib/auth/cleanupIncompleteSignup";

/**
 * POST: sign out and delete auth user if they have no profile (failed / abandoned signup).
 */
export async function POST() {
  try {
    const supabase = await createClient();
    let admin;
    try {
      admin = createAdminClient();
    } catch (e) {
      console.error("cleanup-incomplete-signup: admin client", e);
      await supabase.auth.signOut();
      return NextResponse.json({ ok: true });
    }

    await cleanupIncompleteSignupSession(supabase, admin);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("cleanup-incomplete-signup:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
