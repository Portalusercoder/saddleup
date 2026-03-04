import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";

function redirectUrl(request: NextRequest, path: string) {
  const origin = request.nextUrl.origin;
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
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
    return NextResponse.redirect(redirectUrl(request, next));
  }

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (error) {
      console.error("auth callback verifyOtp:", error);
      return NextResponse.redirect(redirectUrl(request, "/login?error=confirmation_failed"));
    }
    return NextResponse.redirect(redirectUrl(request, next));
  }

  return NextResponse.redirect(redirectUrl(request, "/login"));
}
