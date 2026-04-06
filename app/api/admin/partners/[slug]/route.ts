import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/admin";
import { getPartnerCampaignStatus } from "@/lib/partners/campaigns";
import { parseJsonBody } from "@/lib/validation/parse-json";
import { adminPartnerPatchSchema } from "@/lib/validation/schemas";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user || !isAdminEmail(user.email ?? undefined)) return null;
  return user;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { slug } = await params;
  const status = await getPartnerCampaignStatus(slug);
  if (!status) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(status);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { slug } = await params;
  const parsed = await parseJsonBody(req, adminPartnerPatchSchema);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  const admin = createAdminClient();
  const patch: Record<string, unknown> = {};
  if (typeof body.name === "string") patch.name = body.name.trim();
  if (typeof body.enabled === "boolean") patch.enabled = body.enabled;
  if (body.startsAt !== undefined) patch.starts_at = body.startsAt;
  if (body.endsAt !== undefined) patch.ends_at = body.endsAt;
  if (typeof body.destinationUrl === "string") patch.destination_url = body.destinationUrl.trim();
  if (body.promoCode !== undefined) patch.promo_code = body.promoCode ? body.promoCode.trim() : null;
  if (typeof body.ctaText === "string") patch.cta_text = body.ctaText.trim();

  const { error } = await admin.from("partner_campaigns").update(patch).eq("slug", slug);
  if (error) {
    return NextResponse.json({ error: "Failed to update campaign" }, { status: 500 });
  }

  const status = await getPartnerCampaignStatus(slug);
  if (!status) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(status);
}
