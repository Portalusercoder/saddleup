import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseJsonBody } from "@/lib/validation/parse-json";
import { profileEmailChangeSchema } from "@/lib/validation/schemas";

function normalizeEmail(s: string | null | undefined): string {
  return (s ?? "").trim().toLowerCase();
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = await parseJsonBody(req, profileEmailChangeSchema);
    if (!parsed.ok) return parsed.response;

    const newEmail = parsed.data.email;
    const current = normalizeEmail(user.email);

    if (newEmail === current) {
      return NextResponse.json(
        { error: "That is already your email address." },
        { status: 400 }
      );
    }

    const { error: updateAuthError } = await supabase.auth.updateUser({
      email: newEmail,
    });

    if (updateAuthError) {
      const msg = updateAuthError.message || "Could not update email";
      if (/already been registered|already exists|duplicate/i.test(msg)) {
        return NextResponse.json(
          { error: "That email is already in use by another account." },
          { status: 409 }
        );
      }
      if (/rate limit|too many|seconds/i.test(msg)) {
        return NextResponse.json(
          { error: "Too many attempts. Please wait a few minutes and try again." },
          { status: 429 }
        );
      }
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ email: newEmail })
      .eq("id", user.id);

    if (profileError) {
      console.error("profile email sync error:", profileError);
    }

    const admin = createAdminClient();
    const { error: riderError } = await admin
      .from("riders")
      .update({ email: newEmail })
      .eq("profile_id", user.id);

    if (riderError) {
      console.error("rider email sync error:", riderError);
    }

    return NextResponse.json({
      message:
        "Email update requested. If your project requires confirmation, check your new inbox (and sometimes your old one) for a link from Supabase before the change is final.",
      email: newEmail,
    });
  } catch (err) {
    console.error("POST profile/email error:", err);
    return NextResponse.json(
      { error: "Failed to update email" },
      { status: 500 }
    );
  }
}
