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

    const riderId = (await params).id;
    const { data: rider } = await supabase
      .from("riders")
      .select("id, id_card_url")
      .eq("id", riderId)
      .eq("stable_id", profile.stable_id)
      .maybeSingle();

    if (!rider?.id_card_url) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Riders may only view their own card unless owner/trainer
    if (profile.role === "student" || profile.role === "guardian") {
      const { data: me } = await supabase
        .from("riders")
        .select("id")
        .eq("profile_id", user.id)
        .eq("id", riderId)
        .maybeSingle();
      if (!me) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const signed = await createIdCardSignedUrl(supabase, rider.id_card_url);
    if (!signed) {
      return NextResponse.json({ error: "Unavailable" }, { status: 404 });
    }

    return NextResponse.redirect(signed);
  } catch (err) {
    console.error("GET rider id-card:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
