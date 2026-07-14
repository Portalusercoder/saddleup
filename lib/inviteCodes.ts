import { randomInt } from "crypto";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** CSPRNG invite / join codes (never Math.random). */
export function generateInviteCode(length = 8): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += CHARS[randomInt(0, CHARS.length)];
  }
  return result;
}
