import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

    return NextResponse.json({ success: true, message: "You're subscribed!" });
  } catch (err) {
    console.error("newsletter subscribe error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
