export const TURNSTILE_REQUIRED_MESSAGE = "Please complete the security check.";

export function hasTurnstileToken(token: string): boolean {
  return token.trim().length > 0;
}
