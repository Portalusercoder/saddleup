import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  generateFourDigitCode,
  hashResetCode,
  normalizeResetEmail,
  PASSWORD_RESET_TTL_MS,
} from "@/lib/password-reset";
import { sendPasswordResetCodeEmail } from "@/lib/send-password-reset-email";
import { parseJsonBody } from "@/lib/validation/parse-json";
import { forgotPasswordRequestSchema } from "@/lib/validation/schemas";
import {
  getTurnstileTokenFromRequest,
  verifyTurnstileToken,
} from "@/lib/security/turnstile";

const PUBLIC_OK =
  "If an account exists for that email, you’ll receive a 4-digit code shortly.";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const ipLimit = await checkRateLimit(`forgot-pw-ip:${ip}`, 20, 60_000);
  if (!ipLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again in a minute." },
      { status: 429 }
    );
  }

  const parsed = await parseJsonBody(req, forgotPasswordRequestSchema);
  if (!parsed.ok) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const emailRaw = parsed.data.email;
  const turnstileToken = getTurnstileTokenFromRequest(req, parsed.data.turnstileToken);
  const turnstileOk = await verifyTurnstileToken({
    token: turnstileToken,
    remoteIp: ip,
  });
  if (!turnstileOk) {
    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 400 }
    );
  }

  const email = normalizeResetEmail(emailRaw);

  const emailLimit = await checkRateLimit(`forgot-pw-email:${email}`, 5, 15 * 60_000);
  if (!emailLimit.allowed) {
    return NextResponse.json({ ok: true, message: PUBLIC_OK });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    console.error("forgot-password admin client:", e);
    return NextResponse.json({ error: "Server configuration error." }, { status: 503 });
  }

  const { data: userId, error: rpcError } = await admin.rpc("lookup_user_id_by_email", {
    p_email: email,
  });

  if (rpcError) {
    console.error("lookup_user_id_by_email:", rpcError);
    return NextResponse.json({ ok: true, message: PUBLIC_OK });
  }

  if (!userId) {
    return NextResponse.json({ ok: true, message: PUBLIC_OK });
  }

  const code = generateFourDigitCode();
  const codeHash = hashResetCode(email, code);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS).toISOString();

  await admin
    .from("password_reset_codes")
    .update({ consumed_at: new Date().toISOString() })
    .eq("email", email)
    .is("consumed_at", null);

  const { data: inserted, error: insertError } = await admin
    .from("password_reset_codes")
    .insert({
      email,
      code_hash: codeHash,
      expires_at: expiresAt,
    })
    .select("id")
    .single();

  if (insertError || !inserted?.id) {
    console.error("password_reset insert:", insertError);
    return NextResponse.json({ error: "Could not start reset. Try again." }, { status: 500 });
  }

  const sent = await sendPasswordResetCodeEmail(emailRaw, code);
  if (!sent.ok) {
    await admin.from("password_reset_codes").delete().eq("id", inserted.id);
    return NextResponse.json({ error: sent.error }, { status: 503 });
  }

  return NextResponse.json({ ok: true, message: PUBLIC_OK });
}
