import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { runCompleteSignup } from "@/lib/auth/completeSignup";
import { parseJsonBody } from "@/lib/validation/parse-json";
import { completeSignupBodySchema } from "@/lib/validation/schemas";
import { captureServerEvent } from "@/lib/analytics/posthog-server";

export async function POST(req: Request) {
  try {
    const parsed = await parseJsonBody(req, completeSignupBodySchema);
    if (!parsed.ok) return parsed.response;
    const { role, fullName, email, stableName, joinCode, userId } = parsed.data;

    const supabase = await createClient();
    const {
      data: { user: sessionUser },
    } = await supabase.auth.getUser();

    let user = sessionUser;

    if (!user && userId) {
      const admin = createAdminClient();
      const { data: authUser, error: adminError } = await admin.auth.admin.getUserById(
        userId
      );
      if (adminError) {
        console.error("Complete-signup admin getUserById error:", adminError.message);
      }
      if (authUser?.user) {
        const created = new Date(authUser.user.created_at).getTime();
        const now = Date.now();
        if (now - created < 900000) {
          user = authUser.user;
        }
      }
    }

    if (!user) {
      return NextResponse.json(
        {
          error: userId
            ? "We couldn't verify your sign-up. Please confirm your email using the link we sent, then try logging in and complete setup from the dashboard."
            : "Unauthorized. Please sign up first, then confirm your email if required.",
        },
        { status: 401 }
      );
    }

    const result = await runCompleteSignup(user, {
      role,
      fullName,
      email,
      stableName: stableName ?? undefined,
      joinCode: joinCode ?? undefined,
    });

    if (!result.ok) {
      // Guarantee cleanup: if signup failed and no profile exists yet, remove auth user.
      const admin = createAdminClient();
      const { data: hasProfile } = await admin
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();
      if (!hasProfile) {
        await supabase.auth.signOut();
        const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
        if (delErr) {
          console.error("Complete-signup cleanup deleteUser:", delErr.message);
        }
      }
      if (result.inviteCode) {
        return NextResponse.json(
          {
            error: result.error,
            inviteCode: result.inviteCode,
          },
          { status: result.status }
        );
      }
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    captureServerEvent("signup_completed", user.id, {
      role,
      has_join_code: Boolean(joinCode),
      has_stable_name: Boolean(stableName),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Complete signup error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
