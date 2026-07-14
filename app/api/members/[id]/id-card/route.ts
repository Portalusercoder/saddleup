import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createIdCardSignedUrl } from "@/lib/storage/id-cards";

/** Auth-gated view: redirect to a short-lived signed URL for a private ID card. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("stable_id, role")
      .eq("id", user.id)
      .single();

    if (!profile?.stable_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const memberId = (await params).id;

    // Self or owner/trainer of same stable
    const isSelf = memberId === user.id;
    const isStaff = profile.role === "owner" || profile.role === "trainer";

    if (!isSelf && !isStaff) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: member } = await supabase
      .from("profiles")
      .select("id, id_card_url, stable_id")
      .eq("id", memberId)
      .eq("stable_id", profile.stable_id)
      .maybeSingle();

    if (!member?.id_card_url) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const signed = await createIdCardSignedUrl(supabase, member.id_card_url);
    if (!signed) {
      return NextResponse.json({ error: "Unavailable" }, { status: 404 });
    }

    return NextResponse.redirect(signed);
  } catch (err) {
    console.error("GET member id-card:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
