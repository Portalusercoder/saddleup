import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { runCompleteSignup } from "@/lib/auth/completeSignup";
import { parseJsonBody } from "@/lib/validation/parse-json";
import { completeSignupBodySchema } from "@/lib/validation/schemas";

export async function POST(req: Request) {
  try {
    const parsed = await parseJsonBody(req, completeSignupBodySchema);
    if (!parsed.ok) return parsed.response;
    const { role, fullName, email, stableName, joinCode } = parsed.data;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Unauthorized. Please sign up first, then confirm your email if required.",
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

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Complete signup error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
