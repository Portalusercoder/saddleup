import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendNotificationEmail } from "@/lib/send-notification-email";
import { ensureStableCanMutate } from "@/lib/subscription";
import { parseJsonBody } from "@/lib/validation/parse-json";
import { z } from "zod";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const resendSchema = z
  .object({
    campaignId: z.string().uuid(),
    sendToStudents: z.boolean().optional(),
    sendToTrainers: z.boolean().optional(),
    sendToGuardians: z.boolean().optional(),
  })
  .strip();

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
      return NextResponse.json({ error: "Only stable owners can resend notices" }, { status: 403 });
    }

    const stableId = profile.stable_id;
    if (!stableId) {
      return NextResponse.json({ error: "No stable found" }, { status: 403 });
    }

    const guard = await ensureStableCanMutate(stableId);
    if (!guard.allowed) {
      return NextResponse.json(
        { error: guard.message, code: "TRIAL_EXPIRED" },
        { status: 403 }
      );
    }

    const parsed = await parseJsonBody(req, resendSchema);
    if (!parsed.ok) return parsed.response;

    const {
      campaignId,
      sendToStudents: toStudents = true,
      sendToTrainers: toTrainers = true,
      sendToGuardians: toGuardians = true,
    } = parsed.data;

    const { data: campaign, error: campError } = await supabase
      .from("newsletter_campaigns")
      .select("id, subject, body_html")
      .eq("id", campaignId)
      .eq("stable_id", stableId)
      .single();

    if (campError || !campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const emails: string[] = [];

    if (toStudents) {
      const { data: riders } = await supabase
        .from("riders")
        .select("email")
        .eq("stable_id", stableId);
      const list = (riders || []).map((r) => r.email).filter((e): e is string => !!e && e.includes("@"));
      emails.push(...list);
    }

    if (toTrainers || toGuardians) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("email, role")
        .eq("stable_id", stableId);
      (profiles || []).forEach((p) => {
        if (!p.email || !p.email.includes("@")) return;
        if (toTrainers && p.role === "trainer") emails.push(p.email);
        if (toGuardians && p.role === "guardian") emails.push(p.email);
      });
    }

    const uniqueEmails = [...new Set(emails)];
    if (uniqueEmails.length === 0) {
      return NextResponse.json(
        { error: "No recipients with email addresses in the selected audience(s)" },
        { status: 400 }
      );
    }

    let sent = 0;
    const failures: string[] = [];

    for (let i = 0; i < uniqueEmails.length; i++) {
      if (i > 0) await delay(600);
      const result = await sendNotificationEmail(
        uniqueEmails[i],
        campaign.subject,
        campaign.body_html
      );
      if (result.ok) sent++;
      else failures.push(uniqueEmails[i]);
    }

    await supabase.from("newsletter_campaigns").insert({
      stable_id: stableId,
      subject: campaign.subject,
      body_html: campaign.body_html,
      recipient_count: sent,
    });

    return NextResponse.json({
      success: true,
      sent,
      total: uniqueEmails.length,
      failures: failures.length > 0 ? failures : undefined,
    });
  } catch (err) {
    console.error("notices resend error:", err);
    return NextResponse.json({ error: "Could not resend notice" }, { status: 500 });
  }
}
