import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { parseJsonBody } from "@/lib/validation/parse-json";
import { newsletterSubscriberAddSchema } from "@/lib/validation/schemas";

export async function GET(req: Request) {
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

    if (!profile || !["owner", "trainer"].includes(profile.role as string)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const stableId = profile.stable_id;
    if (!stableId) {
      return NextResponse.json({ error: "No stable found" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("id, email, full_name, subscribed_at, unsubscribed_at")
      .eq("stable_id", stableId)
      .order("subscribed_at", { ascending: false });

    if (error) {
      console.error("newsletter subscribers fetch error:", error);
      return NextResponse.json({ error: "Could not fetch subscribers" }, { status: 500 });
    }

    const active = (data || []).filter((s) => !s.unsubscribed_at);
    const unsubscribed = (data || []).filter((s) => s.unsubscribed_at);

    return NextResponse.json({
      subscribers: active,
      unsubscribed,
      total: active.length,
    });
  } catch (err) {
    console.error("newsletter subscribers error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

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

    const { data: profile } = await supabase
      .from("profiles")
      .select("stable_id, role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "owner") {
      return NextResponse.json({ error: "Only owners can add subscribers" }, { status: 403 });
    }

    const stableId = profile.stable_id;
    if (!stableId) {
      return NextResponse.json({ error: "No stable found" }, { status: 403 });
    }

    const parsed = await parseJsonBody(req, newsletterSubscriberAddSchema);
    if (!parsed.ok) return parsed.response;
    const { email, fullName } = parsed.data;

    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("id, unsubscribed_at")
      .eq("email", email)
      .eq("stable_id", stableId)
      .maybeSingle();

    if (existing) {
      if (existing.unsubscribed_at) {
        await supabase
          .from("newsletter_subscribers")
          .update({
            unsubscribed_at: null,
            full_name: fullName,
            subscribed_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
      }
      return NextResponse.json({ success: true, message: "Subscriber added" });
    }

    const { error } = await supabase.from("newsletter_subscribers").insert({
      email,
      unsubscribe_token: randomUUID(),
      full_name: fullName,
      stable_id: stableId,
    });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ success: true, message: "Subscriber added" });
      }
      console.error("newsletter add subscriber error:", error);
      return NextResponse.json(
        { error: "Could not add subscriber" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Subscriber added" });
  } catch (err) {
    console.error("newsletter add subscriber error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
