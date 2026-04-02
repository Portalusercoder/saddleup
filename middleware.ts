import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Most /api routes skip middleware to avoid duplicate getUser() work.
     * Auth API routes still need session refresh so cookies match the browser client
     * right after verifyOtp (e.g. POST /api/auth/complete-signup).
     */
    "/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/api/auth/:path*",
  ],
};
