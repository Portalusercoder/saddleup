import { Resend } from "resend";

const FROM =
  process.env.RESEND_FROM ??
  "Saddle Up <onboarding@resend.dev>";

export async function sendPasswordResetCodeEmail(
  to: string,
  code: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey?.trim()) {
    console.error("sendPasswordResetCodeEmail: RESEND_API_KEY is not set");
    return { ok: false, error: "Email is not configured" };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: FROM,
      to: [to],
      subject: "Your Saddle Up password reset code",
      text: `Your password reset code is: ${code}\n\nIt expires in 15 minutes. If you didn't request this, you can ignore this email.\n\n— Saddle Up`,
      html: `<p>Your password reset code is:</p>
<p style="font-size: 28px; font-weight: 700; letter-spacing: 0.2em; margin: 16px 0;">${code}</p>
<p style="color:#555;">It expires in 15 minutes. If you didn't request this, you can ignore this email.</p>
<p style="color:#888;font-size:12px;">— Saddle Up</p>`,
    });
    if (error) {
      console.error("Resend password reset error:", error);
      return { ok: false, error: "Failed to send email" };
    }
    return { ok: true };
  } catch (e) {
    console.error("sendPasswordResetCodeEmail:", e);
    return { ok: false, error: "Failed to send email" };
  }
}
