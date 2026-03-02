import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendNotificationEmail } from "@/lib/send-notification-email";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

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
      return NextResponse.json({ error: "Only stable owners can send notices" }, { status: 403 });
    }

    const stableId = profile.stable_id;
    if (!stableId) {
      return NextResponse.json({ error: "No stable found" }, { status: 403 });
    }

    const body = await req.json();
    const { subject, bodyHtml, sendToStudents, sendToTrainers, sendToGuardians } = body;

    if (!subject || typeof subject !== "string" || !subject.trim()) {
      return NextResponse.json({ error: "Subject is required" }, { status: 400 });
    }
    if (!bodyHtml || typeof bodyHtml !== "string" || !bodyHtml.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const toStudents = !!sendToStudents;
    const toTrainers = !!sendToTrainers;
    const toGuardians = !!sendToGuardians;
    if (!toStudents && !toTrainers && !toGuardians) {
      return NextResponse.json({ error: "Select at least one audience (Students, Trainers, or Guardians)" }, { status: 400 });
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

    const html = bodyHtml.trim();
    let sent = 0;
    const failures: string[] = [];

    for (let i = 0; i < uniqueEmails.length; i++) {
      if (i > 0) await delay(600);
      const result = await sendNotificationEmail(uniqueEmails[i], subject.trim(), html);
      if (result.ok) {
        sent++;
      } else {
        failures.push(uniqueEmails[i]);
      }
    }

    await supabase.from("newsletter_campaigns").insert({
      stable_id: stableId,
      subject: subject.trim(),
      body_html: html,
      recipient_count: sent,
    });

    return NextResponse.json({
      success: true,
      sent,
      total: uniqueEmails.length,
      failures: failures.length > 0 ? failures : undefined,
    });
  } catch (err) {
    console.error("notices send error:", err);
    return NextResponse.json(
      { error: "Could not send notices" },
      { status: 500 }
    );
  }
}
