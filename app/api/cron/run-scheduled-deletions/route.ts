import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireCronBearer } from "@/lib/cron-auth";

/** Call from Vercel Cron or similar: deletes stables where scheduled_deletion_at <= now(). */
export async function POST(req: NextRequest) {
  const deny = requireCronBearer(req.headers.get("authorization"));
  if (deny) return deny;

  try {
    const admin = createAdminClient();
    const { data: toDelete } = await admin
      .from("stables")
      .select("id")
      .not("scheduled_deletion_at", "is", null)
      .lte("scheduled_deletion_at", new Date().toISOString());
    if (toDelete?.length) {
      for (const row of toDelete) {
        await admin.from("stables").delete().eq("id", row.id);
      }
    }
    return NextResponse.json({ ok: true, deleted: toDelete?.length ?? 0 });
  } catch (err) {
    console.error("Cron run-scheduled-deletions error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
