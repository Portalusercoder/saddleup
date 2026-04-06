import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const store = new Map<string, number[]>();
const WINDOW_MS = 60 * 1000;
const ratelimitCache = new Map<string, Ratelimit>();

function prune(keys: number[], windowMs: number): number[] {
  const cutoff = Date.now() - windowMs;
  return keys.filter((t) => t > cutoff);
}

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterMs: number };

function checkRateLimitInMemory(
  key: string,
  maxPerWindow: number,
  windowMs: number
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

function getUpstashRatelimit(
  maxPerWindow: number,
  windowMs: number
): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const cacheKey = `${maxPerWindow}:${windowMs}`;
  const existing = ratelimitCache.get(cacheKey);
  if (existing) return existing;

  const redis = Redis.fromEnv();
  const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000));
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(maxPerWindow, `${windowSeconds} s`),
    prefix: "saddleup:rl",
  });
  ratelimitCache.set(cacheKey, limiter);
  return limiter;
}

/**
 * Check rate limit. Uses Upstash Redis when configured,
 * otherwise falls back to in-memory (dev/single instance).
 */
export async function checkRateLimit(
  key: string,
  maxPerWindow = 10,
  windowMs = WINDOW_MS
): Promise<RateLimitResult> {
  const upstash = getUpstashRatelimit(maxPerWindow, windowMs);
  if (!upstash) {
    return checkRateLimitInMemory(key, maxPerWindow, windowMs);
  }

  try {
    const result = await upstash.limit(key);
    if (result.success) return { allowed: true };
    const retryAfterMs = Math.max(0, result.reset - Date.now());
    return { allowed: false, retryAfterMs };
  } catch {
    // Fail-open to local in-memory limiter if Redis is transiently unavailable.
    return checkRateLimitInMemory(key, maxPerWindow, windowMs);
  }
}

/** Get client IP from request (Vercel / Next). */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const real = req.headers.get("x-real-ip");
  if (forwarded) return forwarded.split(",")[0].trim();
  if (real) return real;
  return "unknown";
}
