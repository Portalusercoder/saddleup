import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params;
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
        { error: "Only owners and trainers can remove members" },
        { status: 403 }
      );
    }

    if (targetUserId === user.id) {
      return NextResponse.json(
        { error: "You cannot remove yourself" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const { data: targetProfile } = await admin
      .from("profiles")
      .select("id, stable_id, role")
      .eq("id", targetUserId)
      .single();

    if (!targetProfile) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    if (targetProfile.stable_id !== profile.data.stable_id) {
      return NextResponse.json(
        { error: "This person is not in your stable" },
        { status: 403 }
      );
    }

    if (role === "trainer" && targetProfile.role !== "student") {
      return NextResponse.json(
        { error: "Trainers can only remove students (riders)" },
        { status: 403 }
      );
    }

    if (targetProfile.role === "student") {
      await admin.from("riders").delete().eq("profile_id", targetUserId);
    }

    const { error: deleteError } = await admin
      .from("profiles")
      .delete()
      .eq("id", targetUserId);

    if (deleteError) {
      console.error("Remove member error:", deleteError);
      return NextResponse.json(
        { error: "Failed to remove member" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Member removed. They will see a removal notice when they next sign in.",
    });
  } catch (err) {
    console.error("Remove member error:", err);
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 }
    );
  }
}
