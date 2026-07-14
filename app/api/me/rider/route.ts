import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    const { data: rider } = await supabase
      .from("riders")
      .select("id, name, id_card_url")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (!rider) {
      return NextResponse.json(null);
    }

    return NextResponse.json({
      id: rider.id,
      name: rider.name,
      id_card_url: rider.id_card_url ? true : null,
      has_id_card: Boolean(rider.id_card_url),
    });
  } catch (err) {
    console.error("GET me/rider error:", err);
    return NextResponse.json({ error: "Failed to fetch rider" }, { status: 500 });
  }
}
