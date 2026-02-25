import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await supabase
      .from("profiles")
      .select("stable_id, role")
      .eq("id", user.id)
      .single();

    if (!profile.data?.stable_id) {
      return NextResponse.json({ error: "No stable found" }, { status: 403 });
    }

    const role = profile.data.role as string;
    if (role !== "owner" && role !== "trainer") {
      return NextResponse.json(
        { error: "Only owners and trainers can add members by ID" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { inviteCode, memberRole } = body;

    if (!inviteCode?.trim()) {
      return NextResponse.json(
        { error: "Invite code (personal ID) is required" },
        { status: 400 }
      );
    }

    const validRoles = ["student", "trainer", "guardian"];
    if (!memberRole || !validRoles.includes(memberRole)) {
      return NextResponse.json(
        { error: "Member role must be student, trainer, or guardian" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const code = inviteCode.trim().toUpperCase().replace(/\s/g, "");

    const { data: inviteRow, error: inviteError } = await admin
      .from("user_invite_codes")
      .select("user_id")
      .eq("invite_code", code)
      .single();

    if (inviteError || !inviteRow) {
      return NextResponse.json(
        { error: "Invalid ID. Ask the person to share their personal ID from their profile or signup." },
        { status: 404 }
      );
    }

    const targetUserId = inviteRow.user_id;

    if (targetUserId === user.id) {
      return NextResponse.json(
        { error: "You cannot add yourself" },
        { status: 400 }
      );
    }

    const { data: existingProfile } = await admin
      .from("profiles")
      .select("id, stable_id")
      .eq("id", targetUserId)
      .single();

    if (existingProfile) {
      if (existingProfile.stable_id === profile.data.stable_id) {
        return NextResponse.json(
          { error: "This person is already in your stable" },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "This person is already in another stable. They must leave first." },
        { status: 400 }
      );
    }

    const { data: authUser } = await admin.auth.admin.getUserById(targetUserId);
    if (!authUser?.user) {
      return NextResponse.json(
        { error: "User not found. They must sign up first." },
        { status: 404 }
      );
    }

    const { error: profileError } = await admin.from("profiles").insert({
      id: targetUserId,
      stable_id: profile.data.stable_id,
      role: memberRole,
      full_name: authUser.user.user_metadata?.full_name || authUser.user.email?.split("@")[0] || "Member",
      email: authUser.user.email || null,
    });

    if (profileError) {
      console.error("Add member profile error:", profileError);
      return NextResponse.json(
        { error: "Failed to add member" },
        { status: 500 }
      );
    }

    if (memberRole === "student") {
      await admin.from("riders").insert({
        stable_id: profile.data.stable_id,
        profile_id: targetUserId,
        name: authUser.user.user_metadata?.full_name || authUser.user.email?.split("@")[0] || "Student",
        email: authUser.user.email || null,
      });
    }

    const roleLabel = memberRole === "student" ? "Student" : memberRole === "guardian" ? "Guardian" : "Trainer";
    return NextResponse.json({
      success: true,
      message: `${roleLabel} added successfully. They can now sign in.`,
    });
  } catch (err) {
    console.error("Add by ID error:", err);
    return NextResponse.json(
      { error: "Failed to add member" },
      { status: 500 }
    );
  }
}
