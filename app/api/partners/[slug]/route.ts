import { NextResponse } from "next/server";
import { getPartnerCampaignStatus } from "@/lib/partners/campaigns";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const status = await getPartnerCampaignStatus(slug);
  if (!status) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  if (!status.active) {
    return NextResponse.json(
      {
        slug: status.slug,
        name: status.name,
        active: false,
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }

  return NextResponse.json(
    {
      slug: status.slug,
      name: status.name,
      active: true,
      destinationUrl: status.destinationUrl,
      promoCode: status.promoCode,
      ctaText: status.ctaText,
      startsAt: status.startsAt,
      endsAt: status.endsAt,
    },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}
