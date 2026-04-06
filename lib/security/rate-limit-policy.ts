type RateLimitPolicy = {
  bucket: string;
  max: number;
  windowMs: number;
};

const ONE_MINUTE = 60_000;
const FIFTEEN_MINUTES = 15 * ONE_MINUTE;

/**
 * Central API rate-limit policy.
 * Returns null for methods/routes that should not be limited here.
 */
export function getApiRateLimitPolicy(
  pathname: string,
  method: string
): RateLimitPolicy | null {
  const m = method.toUpperCase();
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(m)) return null;

  // Keep webhook endpoints free from generic throttles.
  if (pathname === "/api/subscription/webhook") return null;

  // Route-specific stricter limits.
  if (pathname === "/api/auth/forgot-password") {
    return { bucket: "forgot-password", max: 20, windowMs: ONE_MINUTE };
  }
  if (pathname === "/api/auth/forgot-password/confirm") {
    return { bucket: "forgot-password-confirm", max: 30, windowMs: ONE_MINUTE };
  }
  if (pathname === "/api/contact") {
    return { bucket: "contact", max: 10, windowMs: ONE_MINUTE };
  }
  if (pathname === "/api/bookings" && m === "POST") {
    return { bucket: "bookings-create", max: 10, windowMs: ONE_MINUTE };
  }
  if (pathname === "/api/account/request-deletion") {
    return { bucket: "request-deletion", max: 5, windowMs: ONE_MINUTE };
  }
  if (pathname === "/api/notices/send" || pathname === "/api/newsletter/send") {
    return { bucket: "bulk-email-send", max: 3, windowMs: FIFTEEN_MINUTES };
  }

  // Sensible default for other mutating API endpoints.
  return { bucket: `write:${pathname}:${m}`, max: 60, windowMs: ONE_MINUTE };
}
