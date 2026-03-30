import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { EmailOtpType, SupabaseClient } from "@supabase/supabase-js";
import { runCompleteSignup } from "@/lib/auth/completeSignup";

function redirectUrl(request: NextRequest, path: string) {
  const origin = request.nextUrl.origin;
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Email confirmation links land here with a session but never hit the signup page's
 * verifyOtp handler — so complete-signup never ran and there is no profile row.
 * Completes signup using metadata attached in signInWithOtp on the signup form.
 */
async function ensureSignupProfileIfNeeded(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return;

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return;

  const meta = user.user_metadata as Record<string, unknown> | undefined;
  if (!meta?.signup_flow || typeof meta.role !== "string") return;

  const role = meta.role;
  const fullName = typeof meta.full_name === "string" ? meta.full_name : "";
  const stableName = typeof meta.stable_name === "string" ? meta.stable_name : "";
  const enterpriseInvite =
    typeof meta.enterprise_invite_code === "string"
      ? meta.enterprise_invite_code.trim().toUpperCase().replace(/\s/g, "")
      : "";
  const joinCodeStable =
    typeof meta.join_code === "string"
      ? meta.join_code.trim().toUpperCase().replace(/\s/g, "")
      : "";

  const result = await runCompleteSignup(user, {
    role,
    fullName,
    email: user.email,
    stableName: role === "owner" && enterpriseInvite ? "" : stableName,
    joinCode:
      role === "owner"
        ? enterpriseInvite || undefined
        : joinCodeStable || undefined,
  });

  if (!result.ok) {
    console.error("auth callback runCompleteSignup failed:", result);
    throw new Error(result.error);
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") || "/dashboard";

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("auth callback exchangeCodeForSession:", error);
      return NextResponse.redirect(redirectUrl(request, "/login?error=confirmation_failed"));
    }
    try {
      await ensureSignupProfileIfNeeded(supabase);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "setup_failed";
      return NextResponse.redirect(
        redirectUrl(
          request,
          `/signup?error=${encodeURIComponent(msg)}`
        )
      );
    }
    return NextResponse.redirect(redirectUrl(request, next));
  }

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (error) {
      console.error("auth callback verifyOtp:", error);
      return NextResponse.redirect(redirectUrl(request, "/login?error=confirmation_failed"));
    }
    try {
      await ensureSignupProfileIfNeeded(supabase);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "setup_failed";
      return NextResponse.redirect(
        redirectUrl(
          request,
          `/signup?error=${encodeURIComponent(msg)}`
        )
      );
    }
    return NextResponse.redirect(redirectUrl(request, next));
  }

  return NextResponse.redirect(redirectUrl(request, "/login"));
}
