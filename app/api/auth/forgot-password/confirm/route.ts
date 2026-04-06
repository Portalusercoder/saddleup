import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  MIN_PASSWORD_LENGTH,
  normalizeResetEmail,
  verifyResetCode,
} from "@/lib/password-reset";
import { parseJsonBody } from "@/lib/validation/parse-json";
import { forgotPasswordConfirmSchema } from "@/lib/validation/schemas";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const ipLimit = await checkRateLimit(`forgot-pw-confirm-ip:${ip}`, 30, 60_000);
  if (!ipLimit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in a minute." },
      { status: 429 }
    );
  }

  const parsed = await parseJsonBody(req, forgotPasswordConfirmSchema);
  if (!parsed.ok) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  const emailRaw = parsed.data.email;
  const codeRaw = parsed.data.code;
  const newPassword = parsed.data.newPassword;

  if (codeRaw.length !== 4) {
    return NextResponse.json({ error: "Enter the 4-digit code from your email." }, { status: 400 });
  }

  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` },
      { status: 400 }
    );
  }

  const email = normalizeResetEmail(emailRaw);

  const emailLimit = await checkRateLimit(`forgot-pw-confirm-email:${email}`, 10, 15 * 60_000);
  if (!emailLimit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts for this email. Try again later." },
      { status: 429 }
    );
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    console.error("forgot-password confirm admin client:", e);
    return NextResponse.json({ error: "Server configuration error." }, { status: 503 });
  }

  const { data: userId, error: rpcError } = await admin.rpc("lookup_user_id_by_email", {
    p_email: email,
  });
  if (rpcError || !userId) {
    return NextResponse.json({ error: "Invalid or expired code." }, { status: 400 });
  }

  const nowIso = new Date().toISOString();
  const { data: rows, error: selError } = await admin
    .from("password_reset_codes")
    .select("id, code_hash")
    .eq("email", email)
    .is("consumed_at", null)
    .gt("expires_at", nowIso)
    .order("created_at", { ascending: false })
    .limit(1);

  if (selError || !rows?.length) {
    return NextResponse.json({ error: "Invalid or expired code." }, { status: 400 });
  }

  const row = rows[0];
  if (!verifyResetCode(email, codeRaw, row.code_hash)) {
    return NextResponse.json({ error: "Invalid or expired code." }, { status: 400 });
  }

  const { error: updateAuthError } = await admin.auth.admin.updateUserById(userId as string, {
    password: newPassword,
  });

  if (updateAuthError) {
    console.error("updateUserById password reset:", updateAuthError);
    return NextResponse.json(
      { error: updateAuthError.message || "Could not update password." },
      { status: 400 }
    );
  }

  await admin
    .from("password_reset_codes")
    .update({ consumed_at: nowIso })
    .eq("email", email)
    .is("consumed_at", null);

  return NextResponse.json({ ok: true });
}
