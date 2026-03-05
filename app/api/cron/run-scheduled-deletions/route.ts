import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** Call from Vercel Cron or similar: deletes stables where scheduled_deletion_at <= now(). */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
