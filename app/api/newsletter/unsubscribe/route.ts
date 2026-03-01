import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token || token.length < 10) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "https://saddleup-sand.vercel.app"}/newsletter/unsubscribe?error=invalid`
    );
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .update({ unsubscribed_at: new Date().toISOString() })
      .eq("unsubscribe_token", token)
      .is("unsubscribed_at", null)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("newsletter unsubscribe error:", error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || "https://saddleup-sand.vercel.app"}/newsletter/unsubscribe?error=failed`
      );
    }

    if (data) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || "https://saddleup-sand.vercel.app"}/newsletter/unsubscribe?success=1`
      );
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "https://saddleup-sand.vercel.app"}/newsletter/unsubscribe?already=1`
    );
  } catch (err) {
    console.error("newsletter unsubscribe error:", err);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "https://saddleup-sand.vercel.app"}/newsletter/unsubscribe?error=failed`
    );
  }
}
