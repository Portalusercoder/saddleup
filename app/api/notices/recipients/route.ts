import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    const { data: profile } = await supabase
      .from("profiles")
      .select("stable_id, role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "owner") {
      return NextResponse.json({ error: "Only stable owners can view notice recipients" }, { status: 403 });
    }

    const stableId = profile.stable_id;
    if (!stableId) {
      return NextResponse.json({ error: "No stable found" }, { status: 403 });
    }

    // Students: riders with email
    const { data: riders } = await supabase
      .from("riders")
      .select("email")
      .eq("stable_id", stableId);
    const studentEmails = (riders || []).map((r) => r.email).filter((e): e is string => !!e && e.includes("@"));

    // Trainers & guardians: profiles (select all then filter by role in case guardian not in enum yet)
    const { data: profiles } = await supabase
      .from("profiles")
      .select("email, role")
      .eq("stable_id", stableId);
    const trainerEmails = (profiles || [])
      .filter((p) => p.role === "trainer")
      .map((p) => p.email)
      .filter((e): e is string => !!e && e.includes("@"));
    const guardianEmails = (profiles || [])
      .filter((p) => p.role === "guardian")
      .map((p) => p.email)
      .filter((e): e is string => !!e && e.includes("@"));

    return NextResponse.json({
      students: { count: studentEmails.length, emails: studentEmails },
      trainers: { count: trainerEmails.length, emails: trainerEmails },
      guardians: { count: guardianEmails.length, emails: guardianEmails },
    });
  } catch (err) {
    console.error("notices recipients error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
