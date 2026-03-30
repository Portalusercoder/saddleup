import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { runCompleteSignup } from "@/lib/auth/completeSignup";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { role, fullName, email, stableName, joinCode, userId } = body;

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
      stableName,
      joinCode,
    });

    if (!result.ok) {
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

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Complete signup error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
