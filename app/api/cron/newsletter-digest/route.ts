import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendNotificationEmail } from "@/lib/send-notification-email";

// Vercel Cron: runs on schedule (e.g. weekly)
// Add CRON_SECRET to Vercel env vars; Vercel sends it as Authorization: Bearer $CRON_SECRET

const DIGEST_SUBJECT = "Saddle Up — Weekly update";
const DIGEST_HTML = `
<p>Hello from Saddle Up!</p>
<p>Here's your weekly update — news, tips, and what's new in horse & stable management.</p>
<p>Manage horses, riders, training, and more in one place.</p>
<p><a href="${process.env.NEXT_PUBLIC_APP_URL || "https://saddleup.app"}">Visit Saddle Up</a></p>
<p>— The Saddle Up team</p>
`;

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const expected = process.env.CRON_SECRET;
  if (expected && authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const { data: subscribers, error } = await supabase
      .from("newsletter_subscribers")
      .select("email")
      .is("stable_id", null) // global list only
      .is("unsubscribed_at", null);

    if (error) {
      console.error("newsletter digest fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 });
    }

    const emails = (subscribers || []).map((s) => s.email).filter((e): e is string => !!e && e.includes("@"));

    if (emails.length === 0) {
      return NextResponse.json({ sent: 0, message: "No subscribers" });
    }

    let sent = 0;
    for (const to of emails) {
      const result = await sendNotificationEmail(to, DIGEST_SUBJECT, DIGEST_HTML);
      if (result.ok) sent++;
    }

    return NextResponse.json({ sent, total: emails.length });
  } catch (err) {
    console.error("newsletter digest error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
