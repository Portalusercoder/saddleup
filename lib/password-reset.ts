import { createHmac, randomInt, timingSafeEqual } from "crypto";

export const PASSWORD_RESET_TTL_MS = 15 * 60 * 1000;
export const MIN_PASSWORD_LENGTH = 10;
/** 8-digit space (~100M) with rate limits — not the old 4-digit (~10k) OTP. */
export const RESET_CODE_LENGTH = 8;

export function normalizeResetEmail(email: string): string {
  return email.trim().toLowerCase();
}

function getResetSecret(): string {
  const dedicated = process.env.PASSWORD_RESET_SECRET?.trim();
  if (dedicated) return dedicated;

  // Never fall back to a hardcoded string — forgeable reset codes in misconfigured prod.
  if (process.env.NODE_ENV !== "production") {
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    if (service) return service;
  }

  throw new Error(
    "PASSWORD_RESET_SECRET is required (set a long random secret in production)."
  );
}

export function hashResetCode(email: string, code: string): string {
  const normalized = normalizeResetEmail(email);
  const digits = code.replace(/\D/g, "").slice(0, RESET_CODE_LENGTH).padStart(RESET_CODE_LENGTH, "0");
  return createHmac("sha256", getResetSecret())
    .update(`${normalized}:${digits}`)
    .digest("hex");
}

export function verifyResetCode(
  email: string,
  code: string,
  storedHash: string
): boolean {
  try {
    const computed = hashResetCode(email, code);
    return timingSafeEqual(Buffer.from(computed, "hex"), Buffer.from(storedHash, "hex"));
  } catch {
    return false;
  }
}

/** Cryptographic 8-digit string (00000000–99999999). */
export function generateResetCode(): string {
  return randomInt(0, 100_000_000).toString().padStart(RESET_CODE_LENGTH, "0");
}
