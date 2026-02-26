import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendNotificationEmail } from "@/lib/send-notification-email";

export async function POST(req: Request) {
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

    if (!profile || profile.role !== "owner") {
      return NextResponse.json({ error: "Only stable owners can send newsletters" }, { status: 403 });
    }

    const stableId = profile.stable_id;
    if (!stableId) {
      return NextResponse.json({ error: "No stable found" }, { status: 403 });
    }

    const body = await req.json();
    const { subject, bodyHtml } = body;

    if (!subject || typeof subject !== "string" || !subject.trim()) {
      return NextResponse.json({ error: "Subject is required" }, { status: 400 });
    }
    if (!bodyHtml || typeof bodyHtml !== "string" || !bodyHtml.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: subscribers, error: fetchError } = await admin
      .from("newsletter_subscribers")
      .select("email")
      .eq("stable_id", stableId)
      .is("unsubscribed_at", null);

    if (fetchError) {
      console.error("newsletter send fetch error:", fetchError);
      return NextResponse.json({ error: "Could not fetch subscribers" }, { status: 500 });
    }

    const emails = (subscribers || [])
      .map((s) => s.email)
      .filter((e): e is string => !!e && e.includes("@"));

    if (emails.length === 0) {
      return NextResponse.json(
        { error: "No subscribers to send to" },
        { status: 400 }
      );
    }

    let sent = 0;
    const failures: string[] = [];

    for (const to of emails) {
      const result = await sendNotificationEmail(to, subject.trim(), bodyHtml.trim());
      if (result.ok) {
        sent++;
      } else {
        failures.push(to);
      }
    }

    await admin.from("newsletter_campaigns").insert({
      stable_id: stableId,
      subject: subject.trim(),
      body_html: bodyHtml.trim(),
      recipient_count: sent,
    });

    return NextResponse.json({
      success: true,
      sent,
      total: emails.length,
      failures: failures.length > 0 ? failures : undefined,
    });
  } catch (err) {
    console.error("newsletter send error:", err);
    return NextResponse.json(
      { error: "Could not send newsletter" },
      { status: 500 }
    );
  }
}
