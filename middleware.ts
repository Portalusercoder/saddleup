import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import {
  CORS_ALLOWED_HEADERS,
  CORS_ALLOWED_METHODS,
  getAllowedCorsOrigin,
} from "@/lib/security/cors";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getApiRateLimitPolicy } from "@/lib/security/rate-limit-policy";
import { apiError } from "@/lib/api/error";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isApiRoute = pathname.startsWith("/api/");

  if (isApiRoute) {
    const requestOrigin = request.headers.get("origin");
    const allowedOrigin = getAllowedCorsOrigin(requestOrigin);

    if (requestOrigin && !allowedOrigin) {
      return apiError(403, "CORS origin forbidden", { code: "CORS_FORBIDDEN" });
    }

    const policy = getApiRateLimitPolicy(pathname, request.method);
    if (policy) {
      const ip = getClientIp(request);
      const result = await checkRateLimit(`mw:${policy.bucket}:${ip}`, policy.max, policy.windowMs);
      if (!result.allowed) {
        const retryAfterSeconds = Math.max(1, Math.ceil(result.retryAfterMs / 1000));
        return apiError(429, "Too many requests. Please try again shortly.", {
          code: "RATE_LIMITED",
          headers: { "Retry-After": String(retryAfterSeconds) },
        });
      }
    }

    let response: NextResponse;
    if (request.method === "OPTIONS") {
      response = new NextResponse(null, { status: 204 });
    } else if (pathname.startsWith("/api/auth/")) {
      response = await updateSession(request);
    } else {
      response = NextResponse.next();
    }

    if (allowedOrigin) {
      response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
      response.headers.set("Access-Control-Allow-Credentials", "true");
      response.headers.set("Access-Control-Allow-Methods", CORS_ALLOWED_METHODS);
      response.headers.set("Access-Control-Allow-Headers", CORS_ALLOWED_HEADERS);
      response.headers.set("Access-Control-Max-Age", "86400");
      response.headers.set("Vary", "Origin");
    }

    return response;
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Page routes keep session refresh behavior as before.
     */
    "/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    /*
     * API routes are centrally CORS-protected here.
     * Only /api/auth/* routes run updateSession to keep auth cookie refresh behavior.
     */
    "/api/:path*",
  ],
};
