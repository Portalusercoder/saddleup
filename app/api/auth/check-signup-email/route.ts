import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  getTurnstileTokenFromRequest,
  verifyTurnstileToken,
} from "@/lib/security/turnstile";
import { parseJsonBody } from "@/lib/validation/parse-json";
import { checkSignupEmailSchema } from "@/lib/validation/schemas";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limit = await checkRateLimit(`check-signup-email:${ip}`, 15, 60_000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Try again in a minute." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const parsed = await parseJsonBody(req, checkSignupEmailSchema);
    if (!parsed.ok) return parsed.response;

    const turnstileToken = getTurnstileTokenFromRequest(
      req,
      parsed.data.turnstileToken
    );
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

    const raw = parsed.data.email;

    const admin = createAdminClient();

    const { data: existingProfile } = await admin
      .from("profiles")
      .select("id")
      .ilike("email", raw)
      .limit(1)
      .maybeSingle();

    if (existingProfile) {
      return NextResponse.json({ exists: true });
    }

    return NextResponse.json({ exists: false });
  } catch (err) {
    console.error("check-signup-email error:", err);
    return NextResponse.json(
      { error: "Failed to check email" },
      { status: 500 }
    );
  }
}
