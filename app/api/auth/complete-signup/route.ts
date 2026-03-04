import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { generateInviteCode } from "@/lib/inviteCodes";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { role, fullName, email, stableName, joinCode, userId } = body;

    const supabase = await createClient();
    const {
      data: { user: sessionUser },
    } = await supabase.auth.getUser();

    let user = sessionUser;

    // When email confirmation is required, there is often no session yet. Use admin lookup
    // so we can create the profile right after sign-up (link works when opened on another device).
    if (!user && userId) {
      const admin = createAdminClient();
      const { data: authUser, error: adminError } = await admin.auth.admin.getUserById(userId);
      if (adminError) {
        console.error("Complete-signup admin getUserById error:", adminError.message);
      }
      if (authUser?.user) {
        const created = new Date(authUser.user.created_at).getTime();
        const now = Date.now();
        if (now - created < 900000) {
          user = authUser.user;
        }
      }
    }

    if (!user) {
      return NextResponse.json(
        {
          error: userId
            ? "We couldn't verify your sign-up. Please confirm your email using the link we sent, then try logging in and complete setup from the dashboard."
            : "Unauthorized. Please sign up first, then confirm your email if required.",
        },
        { status: 401 }
      );
    }


    if (!role || !fullName || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const validRoles = ["owner", "trainer", "student", "guardian"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: existingProfile } = await admin
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (existingProfile) {
      return NextResponse.json({ success: true });
    }

    if (role === "owner") {
      if (!stableName?.trim()) {
        return NextResponse.json(
          { error: "Stable name is required for owners" },
          { status: 400 }
        );
      }

      const slug = stableName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      if (!slug) {
        return NextResponse.json(
          { error: "Please enter a valid stable name" },
          { status: 400 }
        );
      }

      const { data: existingStable } = await admin
        .from("stables")
        .select("id")
        .eq("slug", slug)
        .single();

      if (existingStable) {
        return NextResponse.json(
          { error: `Stable "${slug}" already exists. Try a different name.` },
          { status: 400 }
        );
      }

      let inviteCode = generateInviteCode(8).toUpperCase();
      let attempts = 0;
      while (attempts < 10) {
        const { data: existing } = await admin
          .from("stables")
          .select("id")
          .eq("invite_code", inviteCode)
          .single();
        if (!existing) break;
        inviteCode = generateInviteCode(8).toUpperCase();
        attempts++;
      }

      const { data: stable, error: stableError } = await admin
        .from("stables")
        .insert({
          name: stableName.trim(),
          slug,
          invite_code: inviteCode,
          subscription_tier: "free",
          subscription_plan_id: "free",
        })
        .select("id")
        .single();

      if (stableError || !stable) {
        console.error("Stable creation error:", stableError);
        return NextResponse.json(
          { error: "Failed to create stable" },
          { status: 500 }
        );
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
        return NextResponse.json(
          { error: "Failed to create profile" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    if (role === "trainer" || role === "student" || role === "guardian") {
      if (!joinCode?.trim()) {
        return NextResponse.json(
          { error: "Join code is required" },
          { status: 400 }
        );
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
          let attempts = 0;
          while (attempts < 10) {
            const { data: dup } = await admin
              .from("user_invite_codes")
              .select("user_id")
              .eq("invite_code", userCode)
              .single();
            if (!dup) break;
            userCode = generateInviteCode(8).toUpperCase();
            attempts++;
          }
          await admin.from("user_invite_codes").upsert(
            { user_id: user.id, invite_code: userCode },
            { onConflict: "user_id" }
          );
        }

        return NextResponse.json(
          {
            error: "Invalid join code. Share your personal ID with your stable owner so they can add you:",
            inviteCode: userCode,
          },
          { status: 400 }
        );
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
        return NextResponse.json(
          { error: "Failed to create profile" },
          { status: 500 }
        );
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

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  } catch (err) {
    console.error("Complete signup error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
