import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendNotificationEmail } from "@/lib/send-notification-email";
import { logCronInvoked } from "@/lib/security-logger";

// Vercel Cron: runs on schedule (e.g. weekly)
// Add CRON_SECRET to Vercel env vars; Vercel sends it as Authorization: Bearer $CRON_SECRET

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://saddleup-sand.vercel.app";
const DIGEST_SUBJECT = "Saddle Up — Weekly update";

function digestHtml(unsubscribeToken: string) {
  const unsubUrl = `${BASE_URL}/api/newsletter/unsubscribe?token=${unsubscribeToken}`;
  return `
<p>Hello from Saddle Up!</p>
<p>Here's your weekly update — news, tips, and what's new in horse & stable management.</p>
<p>Manage horses, riders, training, and more in one place.</p>
<p><a href="${BASE_URL}">Visit Saddle Up</a></p>
<p>— The Saddle Up team</p>
<p style="margin-top:24px;font-size:12px;color:#888"><a href="${unsubUrl}" style="color:#888">Unsubscribe</a> from this list</p>
`;
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const expected = process.env.CRON_SECRET;
  if (expected && authHeader !== `Bearer ${expected}`) {
    logCronInvoked("newsletter-digest", { meta: { unauthorized: true } });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const { data: subscribers, error } = await supabase
      .from("newsletter_subscribers")
      .select("email, unsubscribe_token")
      .is("stable_id", null) // global list only
      .is("unsubscribed_at", null);

    if (error) {
      console.error("newsletter digest fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 });
    }

    const list = (subscribers || []).filter(
      (s): s is { email: string; unsubscribe_token: string | null; id?: string } =>
        !!s.email && s.email.includes("@")
    );

    if (list.length === 0) {
      return NextResponse.json({ sent: 0, message: "No subscribers" });
    }

    let sent = 0;
    for (const s of list) {
      let token = s.unsubscribe_token;
      if (!token) {
        token = randomUUID();
        await supabase
          .from("newsletter_subscribers")
          .update({ unsubscribe_token: token })
          .eq("email", s.email)
          .is("stable_id", null);
      }
      const result = await sendNotificationEmail(s.email, DIGEST_SUBJECT, digestHtml(token));
      if (result.ok) sent++;
    }

    logCronInvoked("newsletter-digest", { sent, total: list.length });
    return NextResponse.json({ sent, total: list.length });
  } catch (err) {
    console.error("newsletter digest error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
