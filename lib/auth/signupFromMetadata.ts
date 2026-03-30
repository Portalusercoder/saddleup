import type { User } from "@supabase/supabase-js";
import type { CompleteSignupInput } from "./completeSignup";

/** Build API payload from user_metadata set in signInWithOtp (signup page). */
export function buildCompleteSignupInputFromUser(
  user: User
): CompleteSignupInput | null {
  if (!user.email) return null;
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  if (!meta?.signup_flow || typeof meta.role !== "string") return null;

  const role = meta.role;
  const fullName = typeof meta.full_name === "string" ? meta.full_name : "";
  const stableName =
    typeof meta.stable_name === "string" ? meta.stable_name : "";
  const enterpriseInvite =
    typeof meta.enterprise_invite_code === "string"
      ? meta.enterprise_invite_code.trim().toUpperCase().replace(/\s/g, "")
      : "";
  const joinCodeStable =
    typeof meta.join_code === "string"
      ? meta.join_code.trim().toUpperCase().replace(/\s/g, "")
      : "";

  return {
    role,
    fullName,
    email: user.email,
    stableName: role === "owner" && enterpriseInvite ? "" : stableName,
    joinCode:
      role === "owner"
        ? enterpriseInvite || undefined
        : joinCodeStable || undefined,
  };
}
