/**
 * Sends a notification email via Supabase Edge Function (Resend).
 * Call this when creating in-app notifications for booking_confirmed, booking_declined, lesson_reminder.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function sendNotificationEmail(
  to: string,
  subject: string,
  html: string
): Promise<{ ok: boolean; error?: string }> {
  if (!to || !to.includes("@")) {
    return { ok: false, error: "Invalid email" };
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("Supabase URL or service role key not set - skipping email");
    return { ok: false, error: "Email service not configured" };
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/send-notification-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        to,
        subject,
        html: html || `<p>${subject}</p>`,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("send-notification-email error:", data);
      return { ok: false, error: data.error || "Failed to send" };
    }

    return { ok: true };
  } catch (err) {
    console.error("sendNotificationEmail error:", err);
    return { ok: false, error: String(err) };
  }
}
