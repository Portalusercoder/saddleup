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

/** GET ?test=1&to=your@email.com — debug email delivery (remove in production) */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("test") !== "1") {
    return NextResponse.json({ error: "Use POST to subscribe" }, { status: 405 });
  }
  const to = searchParams.get("to");
  if (!to || !to.includes("@")) {
    return NextResponse.json(
      { error: "Add ?test=1&to=your@email.com to test" },
      { status: 400 }
    );
  }
  const result = await sendNotificationEmail(
    to,
    "Saddle Up test email",
    "<p>If you got this, email is working!</p>"
  );
  return NextResponse.json({
    ok: result.ok,
    error: result.error,
    debug: {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
  });
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
        await sendNotificationEmail(emailTrimmed, WELCOME_EMAIL_SUBJECT, WELCOME_EMAIL_HTML);
      }
      return NextResponse.json({ success: true, message: "You're subscribed!" });
    }

    const { error } = await supabase.from("newsletter_subscribers").insert({
      email: emailTrimmed,
      full_name: fullName?.trim() || null,
      stable_id,
    });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ success: true, message: "You're subscribed!" });
      }
      console.error("newsletter subscribe error:", error);
      return NextResponse.json(
        { error: "Could not subscribe. Please try again." },
        { status: 500 }
      );
    }

    await sendNotificationEmail(emailTrimmed, WELCOME_EMAIL_SUBJECT, WELCOME_EMAIL_HTML);

    return NextResponse.json({ success: true, message: "You're subscribed!" });
  } catch (err) {
    console.error("newsletter subscribe error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
