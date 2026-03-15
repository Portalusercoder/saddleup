/**
 * Simple in-memory rate limiter: max N requests per window per identifier (e.g. IP).
 * Resets on serverless cold start. For multi-instance use Redis (e.g. Upstash) later.
 */

const store = new Map<string, number[]>();
const WINDOW_MS = 60 * 1000; // 1 minute

function prune(keys: number[], windowMs: number): number[] {
  const cutoff = Date.now() - windowMs;
  return keys.filter((t) => t > cutoff);
}

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterMs: number };

/**
 * Check rate limit. If allowed, records the request.
 * @param key - e.g. IP or user id
 * @param maxPerWindow - max requests per window (default 10)
 * @param windowMs - window in ms (default 60000)
 */
export function checkRateLimit(
  key: string,
  maxPerWindow = 10,
  windowMs = WINDOW_MS
): RateLimitResult {
  const now = Date.now();
  let keys = store.get(key) ?? [];
  keys = prune(keys, windowMs);

  if (keys.length >= maxPerWindow) {
    const oldest = Math.min(...keys);
    return {
      allowed: false,
      retryAfterMs: Math.ceil((oldest + windowMs - now) / 1000) * 1000,
    };
  }

  keys.push(now);
  store.set(key, keys);
  return { allowed: true };
}

/** Get client IP from request (Vercel / Next). */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const real = req.headers.get("x-real-ip");
  if (forwarded) return forwarded.split(",")[0].trim();
  if (real) return real;
  return "unknown";
}
