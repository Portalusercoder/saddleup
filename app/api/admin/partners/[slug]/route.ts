import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/admin";
import { getPartnerCampaignStatus } from "@/lib/partners/campaigns";

type PatchBody = {
  name?: string;
  enabled?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  destinationUrl?: string;
  promoCode?: string | null;
  ctaText?: string;
};

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

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
  const body = (await req.json()) as PatchBody;

  if (typeof body.destinationUrl === "string" && !isValidUrl(body.destinationUrl)) {
    return NextResponse.json({ error: "Invalid destinationUrl" }, { status: 400 });
  }
  if (body.startsAt && Number.isNaN(new Date(body.startsAt).getTime())) {
    return NextResponse.json({ error: "Invalid startsAt" }, { status: 400 });
  }
  if (body.endsAt && Number.isNaN(new Date(body.endsAt).getTime())) {
    return NextResponse.json({ error: "Invalid endsAt" }, { status: 400 });
  }

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
