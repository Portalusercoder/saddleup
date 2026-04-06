import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseJsonBody } from "@/lib/validation/parse-json";
import { profileUpdateSchema } from "@/lib/validation/schemas";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildCompleteSignupInputFromUser } from "@/lib/auth/signupFromMetadata";
import { runCompleteSignup } from "@/lib/auth/completeSignup";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url, role, stable_id, id_card_url, onboarding_completed")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      const admin = createAdminClient();
      const input = buildCompleteSignupInputFromUser(user);
      if (input) {
        const result = await runCompleteSignup(user, input);
        if (result.ok) {
          const again = await admin
            .from("profiles")
            .select("id, full_name, email, avatar_url, role, stable_id, id_card_url, onboarding_completed")
            .eq("id", user.id)
            .maybeSingle();
          profile = again.data ?? null;
        }
      }
    }

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    let myRiderId: string | null = null;
    if (profile.role === "student") {
      const { data: rider } = await supabase
        .from("riders")
        .select("id")
        .eq("profile_id", user.id)
        .maybeSingle();
      myRiderId = rider?.id ?? null;
    }

    return NextResponse.json({
      id: profile.id,
      fullName: profile.full_name,
      email: profile.email ?? user.email,
      avatarUrl: profile.avatar_url,
      role: profile.role,
      id_card_url: profile.id_card_url,
      myRiderId,
      onboardingCompleted: Boolean(profile.onboarding_completed),
    });
  } catch (err) {
    console.error("GET profile error:", err);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = await parseJsonBody(req, profileUpdateSchema);
    if (!parsed.ok) return parsed.response;
    const { fullName, avatarUrl, onboardingCompleted } = parsed.data;

    const updates: Record<string, unknown> = {};
    if (fullName !== undefined) updates.full_name = fullName;
    if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;
    if (onboardingCompleted !== undefined) {
      updates.onboarding_completed = onboardingCompleted;
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Invalid profile update" }, { status: 400 });
    }

    return NextResponse.json({
      id: data.id,
      fullName: data.full_name,
      email: data.email ?? user.email,
      avatarUrl: data.avatar_url,
      role: data.role,
      onboardingCompleted: Boolean(data.onboarding_completed),
    });
  } catch (err) {
    console.error("PUT profile error:", err);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
