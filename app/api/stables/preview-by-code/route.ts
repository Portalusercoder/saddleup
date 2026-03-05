import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** Public: get stable name and logo by invite code (for join confirmation before signup). */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")?.trim().toUpperCase().replace(/\s/g, "");
  if (!code) {
    return NextResponse.json({ error: "Code required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: stable } = await admin
    .from("stables")
    .select("id, name, logo_url")
    .eq("invite_code", code)
    .is("scheduled_deletion_at", null)
    .single();

  if (!stable) {
    const slug = code.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "");
    const { data: bySlug } = slug
      ? await admin.from("stables").select("id, name, logo_url").eq("slug", slug).is("scheduled_deletion_at", null).single()
      : { data: null };
    if (!bySlug) {
      return NextResponse.json({ error: "Stable not found" }, { status: 404 });
    }
    return NextResponse.json({ name: bySlug.name, logoUrl: bySlug.logo_url ?? null });
  }

  return NextResponse.json({ name: stable.name, logoUrl: stable.logo_url ?? null });
}
