import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { buildCompleteSignupInputFromUser } from "@/lib/auth/signupFromMetadata";
import { runCompleteSignup } from "@/lib/auth/completeSignup";

/**
 * If the user confirmed via email but landed on /dashboard without hitting /auth/callback,
 * they have a session but no profile. This completes signup from user_metadata (same as callback).
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: existing } = await admin
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ ok: true });
    }

    const input = buildCompleteSignupInputFromUser(user);
    if (!input) {
      return NextResponse.json(
        { error: "No pending signup metadata on this account." },
        { status: 400 }
      );
    }

    const result = await runCompleteSignup(user, input);
    if (!result.ok) {
      if (result.inviteCode) {
        return NextResponse.json(
          { error: result.error, inviteCode: result.inviteCode },
          { status: result.status }
        );
      }
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("resume-signup error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
