import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const CARE_LABELS: Record<string, string> = {
  vet: "Vet Visit",
  vaccination: "Vaccination",
  deworming: "Deworming",
  farrier: "Farrier",
  injury: "Injury",
};

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

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const todayStr = today.toISOString().slice(0, 10);
    const endStr = thirtyDaysFromNow.toISOString().slice(0, 10);

    const { data: logs, error } = await supabase
      .from("health_logs")
      .select("id, log_type, next_due, horse_id, horses(id, name)")
      .not("next_due", "is", null)
      .lte("next_due", endStr)
      .order("next_due", { ascending: true });

    if (error) {
      console.error("GET care reminders error:", error);
      return NextResponse.json(
        { error: "Failed to fetch care reminders" },
        { status: 500 }
      );
    }

    const all = (logs || []).map((l) => {
      const horses = (l as { horses?: { id: string; name: string } | { id: string; name: string }[] | null }).horses;
      const horse = Array.isArray(horses) ? horses[0] : horses;
      return {
        id: l.id,
        type: l.log_type,
        typeLabel: CARE_LABELS[l.log_type] || l.log_type,
        nextDue: l.next_due,
        horseId: l.horse_id,
        horseName: horse?.name ?? "Unknown",
        overdue: (l.next_due as string) < todayStr,
      };
    });

    return NextResponse.json(all);
  } catch (err) {
    console.error("Care reminders error:", err);
    return NextResponse.json(
      { error: "Failed to fetch care reminders" },
      { status: 500 }
    );
  }
}
