import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { STORAGE_BUCKETS } from "@/lib/constants";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    if (!profile?.stable_id || profile.role !== "owner") {
      return NextResponse.json(
        { error: "Only stable owners can upload ID cards" },
        { status: 403 }
      );
    }

    const memberId = (await params).id;

    const { data: member } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", memberId)
      .eq("stable_id", profile.stable_id)
      .in("role", ["owner", "trainer"])
      .single();

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Use JPEG, PNG, WebP, or PDF" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large. Max 5MB." }, { status: 400 });
    }

    const ext = file.type === "application/pdf" ? "pdf" : file.type.split("/")[1] || "png";
    const path = `${profile.stable_id}/profiles/${memberId}/id.${ext}`;

    const buffer = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKETS.ID_CARDS)
      .upload(path, buffer, { contentType: file.type, upsert: true });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ error: uploadError.message || "Upload failed" }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKETS.ID_CARDS)
      .getPublicUrl(path);

    const url = `${publicUrl}?t=${Date.now()}`;

    await supabase
      .from("profiles")
      .update({ id_card_url: url })
      .eq("id", memberId)
      .eq("stable_id", profile.stable_id);

    return NextResponse.json({ url });
  } catch (err) {
    console.error("Upload ID card error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
