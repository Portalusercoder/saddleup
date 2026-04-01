import { createAdminClient } from "@/lib/supabase/admin";

export type PartnerCampaign = {
  slug: string;
  name: string;
  enabled: boolean;
  starts_at: string | null;
  ends_at: string | null;
  destination_url: string;
  promo_code: string | null;
  cta_text: string;
};

export type PartnerCampaignStatus = {
  slug: string;
  name: string;
  active: boolean;
  startsAt: string | null;
  endsAt: string | null;
  destinationUrl: string;
  promoCode: string | null;
  ctaText: string;
};

function toDate(value: string | null): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function isCampaignActive(campaign: PartnerCampaign, now: Date = new Date()): boolean {
  if (!campaign.enabled) return false;
  const start = toDate(campaign.starts_at);
  const end = toDate(campaign.ends_at);
  if (start && now < start) return false;
  if (end && now > end) return false;
  return true;
}

export async function getPartnerCampaignStatus(
  slug: string
): Promise<PartnerCampaignStatus | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("partner_campaigns")
    .select("slug,name,enabled,starts_at,ends_at,destination_url,promo_code,cta_text")
    .eq("slug", slug)
    .maybeSingle<PartnerCampaign>();

  if (error || !data) return null;

  return {
    slug: data.slug,
    name: data.name,
    active: isCampaignActive(data),
    startsAt: data.starts_at,
    endsAt: data.ends_at,
    destinationUrl: data.destination_url,
    promoCode: data.promo_code,
    ctaText: data.cta_text,
  };
}
