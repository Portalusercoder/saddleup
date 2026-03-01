import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendNotificationEmail } from "@/lib/send-notification-email";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const WELCOME_EMAIL_SUBJECT = "You're subscribed to Saddle Up";
const WELCOME_EMAIL_HTML = `
<p>Thanks for subscribing!</p>
<p>You'll receive news and updates about Saddle Up — modern horse & stable management for riding schools, trainers, and horse owners.</p>
<p>— The Saddle Up team</p>
`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, fullName, stableId } = body;

    const emailTrimmed = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!emailTrimmed || !EMAIL_REGEX.test(emailTrimmed)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const stable_id = stableId && typeof stableId === "string" ? stableId : null;

    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("id, unsubscribed_at")
      .eq("email", emailTrimmed)
      .is("stable_id", stable_id)
      .maybeSingle();

    if (existing) {
      if (existing.unsubscribed_at) {
        await supabase
          .from("newsletter_subscribers")
          .update({
            unsubscribed_at: null,
            full_name: fullName?.trim() || null,
            subscribed_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
      }
    const emailResult = await sendNotificationEmail(emailTrimmed, WELCOME_EMAIL_SUBJECT, WELCOME_EMAIL_HTML);
    if (!emailResult.ok) {
      console.error("newsletter welcome email failed:", emailResult.error);
    }
    return NextResponse.json({
      success: true,
      message: "You're subscribed!",
      emailSent: emailResult.ok,
      ...(emailResult.error && { emailError: emailResult.error }),
    });
    }

    const { error } = await supabase.from("newsletter_subscribers").insert({
      email: emailTrimmed,
      full_name: fullName?.trim() || null,
      stable_id,
    });

    if (error) {
      if (error.code === "23505") {
        const emailResult = await sendNotificationEmail(emailTrimmed, WELCOME_EMAIL_SUBJECT, WELCOME_EMAIL_HTML);
        return NextResponse.json({
          success: true,
          message: "You're subscribed!",
          emailSent: emailResult.ok,
        });
      }
      console.error("newsletter subscribe error:", error);
      return NextResponse.json(
        { error: "Could not subscribe. Please try again." },
        { status: 500 }
      );
    }

    const emailResult2 = await sendNotificationEmail(emailTrimmed, WELCOME_EMAIL_SUBJECT, WELCOME_EMAIL_HTML);
    if (!emailResult2.ok) {
      console.error("newsletter welcome email failed:", emailResult2.error);
    }
    return NextResponse.json({
      success: true,
      message: "You're subscribed!",
      emailSent: emailResult2.ok,
      ...(emailResult2.error && { emailError: emailResult2.error }),
    });
  } catch (err) {
    console.error("newsletter subscribe error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
