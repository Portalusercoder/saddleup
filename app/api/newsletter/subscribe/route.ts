import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendNotificationEmail } from "@/lib/send-notification-email";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://saddleup-sand.vercel.app";

const WELCOME_EMAIL_SUBJECT = "You're subscribed to Saddle Up";

function welcomeEmailHtml(unsubscribeToken: string) {
  const unsubUrl = `${BASE_URL}/api/newsletter/unsubscribe?token=${unsubscribeToken}`;
  return `
<p>Thanks for subscribing!</p>
<p>You'll receive news and updates about Saddle Up — modern horse & stable management for riding schools, trainers, and horse owners.</p>
<p>— The Saddle Up team</p>
<p style="margin-top:24px;font-size:12px;color:#888"><a href="${unsubUrl}" style="color:#888">Unsubscribe</a> from this list</p>
`;
}

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
      .select("id, unsubscribed_at, unsubscribe_token")
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
      let token = existing.unsubscribe_token;
      if (!token) {
        token = randomUUID();
        await supabase
          .from("newsletter_subscribers")
          .update({ unsubscribe_token: token })
          .eq("id", existing.id);
      }
      const emailResult = await sendNotificationEmail(
        emailTrimmed,
        WELCOME_EMAIL_SUBJECT,
        welcomeEmailHtml(token)
      );
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

    const token = randomUUID();
    const { error } = await supabase.from("newsletter_subscribers").insert({
      email: emailTrimmed,
      full_name: fullName?.trim() || null,
      stable_id,
      unsubscribe_token: token,
    });

    if (error) {
      if (error.code === "23505") {
        const { data: dup } = await supabase
          .from("newsletter_subscribers")
          .select("unsubscribe_token")
          .eq("email", emailTrimmed)
          .is("stable_id", stable_id)
          .single();
        const t = dup?.unsubscribe_token || randomUUID();
        const emailResult = await sendNotificationEmail(
          emailTrimmed,
          WELCOME_EMAIL_SUBJECT,
          welcomeEmailHtml(t)
        );
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

    const emailResult2 = await sendNotificationEmail(
      emailTrimmed,
      WELCOME_EMAIL_SUBJECT,
      welcomeEmailHtml(token)
    );
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
