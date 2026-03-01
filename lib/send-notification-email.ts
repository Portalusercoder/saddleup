/**
 * Sends a notification email via Resend.
 * Tries direct Resend API first (if RESEND_API_KEY in Vercel), else Supabase Edge Function.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "Saddle Up <onboarding@resend.dev>";

export async function sendNotificationEmail(
  to: string,
  subject: string,
  html: string
): Promise<{ ok: boolean; error?: string }> {
  if (!to || !to.includes("@")) {
    return { ok: false, error: "Invalid email" };
  }

  // 1. Try direct Resend (when RESEND_API_KEY is in Vercel)
  if (RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [to],
          subject,
          html: html || `<p>${subject}</p>`,
        }),
      });
      const data = (await res.json()) as { id?: string; message?: string };
      if (!res.ok) {
        console.error("Resend direct error:", data);
        return { ok: false, error: data.message || "Failed to send" };
      }
      return { ok: true };
    } catch (err) {
      console.error("sendNotificationEmail (Resend direct) error:", err);
      return { ok: false, error: String(err) };
    }
  }

  // 2. Fallback: Supabase Edge Function
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("No RESEND_API_KEY or Supabase config - skipping email");
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
    const data = (await res.json()) as { error?: string };
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
