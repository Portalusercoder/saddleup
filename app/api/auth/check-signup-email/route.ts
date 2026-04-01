import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string };
    const raw = (body.email ?? "").trim().toLowerCase();
    if (!raw) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: existingProfile } = await admin
      .from("profiles")
      .select("id")
      .ilike("email", raw)
      .limit(1)
      .maybeSingle();

    if (existingProfile) {
      return NextResponse.json({ exists: true });
    }

    // Catch orphan auth users with no profile yet.
    let page = 1;
    const perPage = 200;
    const maxPages = 20;
    while (page <= maxPages) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
      if (error) break;
      const users = data?.users ?? [];
      if (users.some((u) => (u.email ?? "").toLowerCase() === raw)) {
        return NextResponse.json({ exists: true });
      }
      if (users.length < perPage) break;
      page += 1;
    }

    return NextResponse.json({ exists: false });
  } catch (err) {
    console.error("check-signup-email error:", err);
    return NextResponse.json(
      { error: "Failed to check email" },
      { status: 500 }
    );
  }
}
