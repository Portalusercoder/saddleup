/**
 * Debug endpoint to test email delivery.
 * Call: GET /api/test-email?to=your@email.com
 * Remove or restrict this in production.
 */
import { NextResponse } from "next/server";
import { sendNotificationEmail } from "@/lib/send-notification-email";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const to = searchParams.get("to");

  if (!to || !to.includes("@")) {
    return NextResponse.json(
      { error: "Add ?to=your@email.com to the URL" },
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
