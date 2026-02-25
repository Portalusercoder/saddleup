import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { generateInviteCode } from "@/lib/inviteCodes";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: existing } = await admin
      .from("user_invite_codes")
      .select("invite_code")
      .eq("user_id", user.id)
      .single();

    if (existing) {
      return NextResponse.json({ inviteCode: existing.invite_code });
    }

    let code = generateInviteCode(8).toUpperCase();
    for (let i = 0; i < 10; i++) {
      const { data: dup } = await admin
        .from("user_invite_codes")
        .select("user_id")
        .eq("invite_code", code)
        .single();
      if (!dup) break;
      code = generateInviteCode(8).toUpperCase();
    }

    await admin.from("user_invite_codes").insert({
      user_id: user.id,
      invite_code: code,
    });

    return NextResponse.json({ inviteCode: code });
  } catch (err) {
    console.error("GET invite code error:", err);
    return NextResponse.json(
      { error: "Failed to get invite code" },
      { status: 500 }
    );
  }
}
