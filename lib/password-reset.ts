import { createHmac, randomInt, timingSafeEqual } from "crypto";

export const PASSWORD_RESET_TTL_MS = 15 * 60 * 1000;
export const MIN_PASSWORD_LENGTH = 8;

export function normalizeResetEmail(email: string): string {
  return email.trim().toLowerCase();
}

function getResetSecret(): string {
  return (
    process.env.PASSWORD_RESET_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "dev-only-password-reset-secret"
  );
}

export function hashResetCode(email: string, code: string): string {
  const normalized = normalizeResetEmail(email);
  const digits = code.replace(/\D/g, "").slice(0, 4).padStart(4, "0");
  return createHmac("sha256", getResetSecret())
    .update(`${normalized}:${digits}`)
    .digest("hex");
}

export function verifyResetCode(
  email: string,
  code: string,
  storedHash: string
): boolean {
  const computed = hashResetCode(email, code);
  try {
    return timingSafeEqual(Buffer.from(computed, "hex"), Buffer.from(storedHash, "hex"));
  } catch {
    return false;
  }
}

/** Cryptographic 4-digit string (0000–9999). */
export function generateFourDigitCode(): string {
  return randomInt(0, 10000).toString().padStart(4, "0");
}
