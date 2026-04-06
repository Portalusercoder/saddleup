import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/admin";
import { generateInviteCode } from "@/lib/inviteCodes";
import { allocateUniqueSlug, slugFromStableName } from "@/lib/stableSlug";
import { parseJsonBody } from "@/lib/validation/parse-json";
import { adminStableCreateSchema } from "@/lib/validation/schemas";

/**
 * POST: Create an enterprise stable (admin only).
 * Body: { name: string, horseLimit?: number, riderLimit?: number }
 * Returns: { stableId, name, inviteCode, inviteUrl } so you can send the link to the customer to claim as owner.
 */
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
    if (!isAdminEmail(user.email ?? undefined)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const parsed = await parseJsonBody(req, adminStableCreateSchema);
    if (!parsed.ok) return parsed.response;
    const { name } = parsed.data;

    const admin = createAdminClient();
    const baseSlug = slugFromStableName(name);
    const slugBase = baseSlug || "enterprise";
    const slug = await allocateUniqueSlug(admin, slugBase);

    let inviteCode = generateInviteCode(8).toUpperCase();
    for (let i = 0; i < 10; i++) {
      const { data: dup } = await admin
        .from("stables")
        .select("id")
        .eq("invite_code", inviteCode)
        .single();
      if (!dup) break;
      inviteCode = generateInviteCode(8).toUpperCase();
    }

    const { data: stable, error: stableError } = await admin
      .from("stables")
      .insert({
        name,
        slug,
        invite_code: inviteCode,
        subscription_tier: "enterprise",
        subscription_plan_id: "enterprise",
        subscription_status: "active",
        trial_ends_at: null,
        plan_type: "enterprise",
        grace_period_ends_at: null,
      })
      .select("id, name, invite_code")
      .single();

    if (stableError || !stable) {
      console.error("Admin create stable error:", stableError);
      return NextResponse.json(
        { error: "Failed to create stable" },
        { status: 500 }
      );
    }

    const rawBase =
      process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://yourapp.vercel.app";
    const baseUrl = rawBase.replace(/\/+$/, "");
    const inviteUrl = `${baseUrl}/signup?code=${encodeURIComponent(stable.invite_code ?? inviteCode)}`;

    return NextResponse.json({
      stableId: stable.id,
      name: stable.name,
      inviteCode: stable.invite_code ?? inviteCode,
      inviteUrl,
    });
  } catch (err) {
    console.error("Admin stables POST error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
