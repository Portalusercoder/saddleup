import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseJsonBody } from "@/lib/validation/parse-json";
import { checkSignupEmailSchema } from "@/lib/validation/schemas";

export async function POST(req: Request) {
  try {
    const parsed = await parseJsonBody(req, checkSignupEmailSchema);
    if (!parsed.ok) return parsed.response;
    const raw = parsed.data.email;

    const admin = createAdminClient();

    const { data: existingProfile } = await admin
      .from("profiles")
      .select("id")
      .ilike("email", raw)
      .limit(1)
      .maybeSingle();

    if (existingProfile) {
      return NextResponse.json({ exists: true });
    }

    return NextResponse.json({ exists: false });
  } catch (err) {
    console.error("check-signup-email error:", err);
    return NextResponse.json(
      { error: "Failed to check email" },
      { status: 500 }
    );
  }
}
