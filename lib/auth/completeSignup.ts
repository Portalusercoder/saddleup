import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateInviteCode } from "@/lib/inviteCodes";
import { allocateUniqueSlug, slugFromStableName } from "@/lib/stableSlug";

export type CompleteSignupInput = {
  role: string;
  fullName: string;
  email: string;
  stableName?: string;
  joinCode?: string;
};

export type CompleteSignupResult =
  | { ok: true }
  | { ok: false; status: number; error: string; inviteCode?: string };

/**
 * Creates stable + profile (or joins stable) for a verified auth user.
 * Used from POST /api/auth/complete-signup and from /auth/callback when the user
 * confirms via email link instead of the signup page OTP flow.
 */
export async function runCompleteSignup(
  user: User,
  input: CompleteSignupInput
): Promise<CompleteSignupResult> {
  const { role, fullName, email, stableName, joinCode } = input;

  if (!role || !fullName || !email) {
    return { ok: false, status: 400, error: "Missing required fields" };
  }

  const validRoles = ["owner", "trainer", "student", "guardian"];
  if (!validRoles.includes(role)) {
    return { ok: false, status: 400, error: "Invalid role" };
  }

  const admin = createAdminClient();

  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existingProfile) {
    return { ok: true };
  }

  if (role === "owner") {
    const joinCodeTrimmed =
      typeof joinCode === "string"
        ? joinCode.trim().toUpperCase().replace(/\s/g, "")
        : "";

    if (joinCodeTrimmed.length >= 6) {
      const { data: stableByCode } = await admin
        .from("stables")
        .select("id, subscription_tier")
        .eq("invite_code", joinCodeTrimmed)
        .single();

      if (stableByCode && stableByCode.subscription_tier === "enterprise") {
        const { count } = await admin
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("stable_id", stableByCode.id)
          .eq("role", "owner");

        if ((count ?? 0) === 0) {
          const { error: profileError } = await admin.from("profiles").insert({
            id: user.id,
            stable_id: stableByCode.id,
            role: "owner",
            full_name: fullName.trim(),
            email: email.trim(),
          });
          if (profileError) {
            console.error("Profile creation (claim enterprise) error:", profileError);
            return { ok: false, status: 500, error: "Failed to claim stable" };
          }
          return { ok: true };
        }
      }
    }

    if (!stableName?.trim()) {
      return {
        ok: false,
        status: 400,
        error:
          "Stable name is required, or use your enterprise invite code if you have one.",
      };
    }

    const baseSlug = slugFromStableName(stableName);
    if (!baseSlug) {
      return { ok: false, status: 400, error: "Please enter a valid stable name" };
    }

    let stable: { id: string } | null = null;
    let stableError: { message?: string; code?: string } | null = null;

    for (let insertAttempt = 0; insertAttempt < 5; insertAttempt++) {
      const slug = await allocateUniqueSlug(admin, baseSlug);

      let inviteCodeGen = generateInviteCode(8).toUpperCase();
      for (let i = 0; i < 10; i++) {
        const { data: dup } = await admin
          .from("stables")
          .select("id")
          .eq("invite_code", inviteCodeGen)
          .maybeSingle();
        if (!dup) break;
        inviteCodeGen = generateInviteCode(8).toUpperCase();
      }

      const insert = await admin
        .from("stables")
        .insert({
          name: stableName.trim(),
          slug,
          invite_code: inviteCodeGen,
          subscription_tier: "free",
          subscription_plan_id: "free",
          subscription_status: "trialing",
          plan_type: "beta",
        })
        .select("id")
        .maybeSingle();

      stable = insert.data ?? null;
      stableError = (insert.error as { message?: string; code?: string } | null) ?? null;

      const duplicate =
        stableError?.code === "23505" ||
        /duplicate key|unique constraint/i.test(stableError?.message ?? "");
      if (!duplicate || stable) break;
    }

    if (stableError || !stable) {
      console.error("Stable creation error:", stableError);
      const msg = stableError?.message ?? "";
      const code = (stableError as { code?: string })?.code;
      if (
        code === "42501" ||
        /row-level security|permission denied|RLS/i.test(msg)
      ) {
        return {
          ok: false,
          status: 500,
          error:
            "Server misconfiguration: database rejected the new stable. Check that SUPABASE_SERVICE_ROLE_KEY in Vercel is the service_role secret (not the anon key).",
        };
      }
      if (/duplicate key|unique constraint/i.test(msg)) {
        return {
          ok: false,
          status: 400,
          error:
            "Could not create stable (duplicate invite code or slug). Please try again.",
        };
      }
      if (/foreign key|subscription_plans/i.test(msg)) {
        return {
          ok: false,
          status: 500,
          error:
            "Database setup issue: missing subscription plan. Run Supabase migrations or ensure the \"free\" plan exists in table subscription_plans.",
        };
      }
      return {
        ok: false,
        status: 500,
        error: msg ? `Could not create stable: ${msg}` : "Failed to create stable",
      };
    }

    const { error: profileError } = await admin.from("profiles").insert({
      id: user.id,
      stable_id: stable.id,
      role: "owner",
      full_name: fullName.trim(),
      email: email.trim(),
    });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      await admin.from("stables").delete().eq("id", stable.id);
      const msg = profileError.message ?? "";
      if (/onboarding_completed/i.test(msg)) {
        return {
          ok: false,
          status: 500,
          error:
            "Database is missing onboarding setup. Run migration 00029_profiles_onboarding_completed.sql, then try signup again.",
        };
      }
      return { ok: false, status: 500, error: "Failed to create profile" };
    }

    return { ok: true };
  }

  if (role === "trainer" || role === "student" || role === "guardian") {
    if (!joinCode?.trim()) {
      return { ok: false, status: 400, error: "Join code is required" };
    }

    const normalized = joinCode.trim().toUpperCase().replace(/\s/g, "");
    const slugFallback = joinCode
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-|-$/g, "");

    const { data: stableByCode } = await admin
      .from("stables")
      .select("id")
      .eq("invite_code", normalized)
      .single();

    const { data: stableBySlug } = !stableByCode
      ? await admin.from("stables").select("id").eq("slug", slugFallback).single()
      : { data: null };

    const stable = stableByCode || stableBySlug;

    if (!stable) {
      const { data: existingCode } = await admin
        .from("user_invite_codes")
        .select("invite_code")
        .eq("user_id", user.id)
        .single();

      let userCode = existingCode?.invite_code;
      if (!userCode) {
        userCode = generateInviteCode(8).toUpperCase();
        let attempt = 0;
        while (attempt < 10) {
          const { data: dup } = await admin
            .from("user_invite_codes")
            .select("user_id")
            .eq("invite_code", userCode)
            .single();
          if (!dup) break;
          userCode = generateInviteCode(8).toUpperCase();
          attempt++;
        }
        await admin.from("user_invite_codes").upsert(
          { user_id: user.id, invite_code: userCode },
          { onConflict: "user_id" }
        );
      }

      return {
        ok: false,
        status: 400,
        error:
          "Invalid join code. Share your personal ID with your stable owner so they can add you:",
        inviteCode: userCode,
      };
    }

    const { error: profileError } = await admin.from("profiles").insert({
      id: user.id,
      stable_id: stable.id,
      role,
      full_name: fullName.trim(),
      email: email.trim(),
    });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      const msg = profileError.message ?? "";
      if (/onboarding_completed/i.test(msg)) {
        return {
          ok: false,
          status: 500,
          error:
            "Database is missing onboarding setup. Run migration 00029_profiles_onboarding_completed.sql, then try signup again.",
        };
      }
      return { ok: false, status: 500, error: "Failed to create profile" };
    }

    if (role === "student") {
      await admin.from("riders").insert({
        stable_id: stable.id,
        profile_id: user.id,
        name: fullName.trim(),
        email: email.trim(),
      });
    }

    let userInviteCode = generateInviteCode(8).toUpperCase();
    for (let i = 0; i < 10; i++) {
      const { data: dup } = await admin
        .from("user_invite_codes")
        .select("user_id")
        .eq("invite_code", userInviteCode)
        .single();
      if (!dup) break;
      userInviteCode = generateInviteCode(8).toUpperCase();
    }
    await admin.from("user_invite_codes").upsert(
      { user_id: user.id, invite_code: userInviteCode },
      { onConflict: "user_id" }
    );

    return { ok: true };
  }

  return { ok: false, status: 400, error: "Invalid role" };
}
