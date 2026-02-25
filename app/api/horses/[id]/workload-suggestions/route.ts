import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI suggestions not configured. Add OPENAI_API_KEY to .env" },
        { status: 503 }
      );
    }

    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: horse, error } = await supabase
      .from("horses")
      .select("id, name, temperament, skill_level, training_status, suitability")
      .eq("id", id)
      .single();

    if (error || !horse) {
      return NextResponse.json({ error: "Horse not found" }, { status: 404 });
    }

    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const { data: punches } = await supabase
      .from("training_punches")
      .select("punch_type, duration_minutes, intensity, discipline, punch_date, rider_name")
      .eq("horse_id", id)
      .gte("punch_date", fourteenDaysAgo.toISOString().slice(0, 10))
      .order("punch_date", { ascending: false });

    const sessions = (punches || []).map((p) => ({
      type: p.punch_type,
      duration: p.duration_minutes,
      intensity: p.intensity,
      discipline: p.discipline,
      date: p.punch_date,
      rider: (p as { rider_name?: string }).rider_name,
    }));

    const activeSessions = sessions.filter(
      (s) =>
        s.type !== "rest" &&
        s.type !== "medical" &&
        s.type !== "medical_rest"
    );
    const restDays = sessions.filter(
      (s) => s.type === "rest" || s.type === "medical" || s.type === "medical_rest"
    );


    const totalMinutes = activeSessions.reduce((sum, s) => sum + (s.duration ?? 0), 0);
    const hardCount = activeSessions.filter(
      (s) => (s.intensity ?? "").toLowerCase() === "hard"
    ).length;
    const byType = activeSessions.reduce<Record<string, number>>((acc, s) => {
      acc[s.type] = (acc[s.type] || 0) + 1;
      return acc;
    }, {});

    const workloadSummary = {
      horseName: horse.name,
      temperament: horse.temperament,
      skillLevel: horse.skill_level,
      trainingStatus: horse.training_status,
      last14Days: {
        totalSessions: activeSessions.length,
        totalMinutes,
        hardSessions: hardCount,
        restDays: restDays.length,
        byType,
        sessions: sessions.slice(0, 20).map((s) => ({
          date: s.date,
          type: s.type,
          duration: s.duration,
          intensity: s.intensity,
          discipline: s.discipline,
        })),
      },
    };

    const { last14Days } = workloadSummary;

    const buildFallback = () => {
      const lines: string[] = [];
      if (last14Days.totalMinutes >= 300 || last14Days.totalSessions > 5) {
        lines.push("• Consider a rest day—workload is high this period.");
      }
      if (last14Days.hardSessions >= 3) {
        lines.push("• Multiple hard sessions. Mix in light work or rest.");
      }
      if (last14Days.restDays === 0 && last14Days.totalSessions >= 3) {
        lines.push("• No rest days in 2 weeks. Add a rest day for recovery.");
      }
      if (lines.length === 0) {
        lines.push("• Workload looks balanced. Continue monitoring.");
      }
      return lines.join("\n");
    };

    let text: string;
    try {
      const openai = new OpenAI({ apiKey });
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Expert equestrian coach. Give 3-5 concise workload suggestions. Use bullet points. Under 150 words.",
          },
          {
            role: "user",
            content: `Horse: ${workloadSummary.horseName}. Last 14 days: ${last14Days.totalSessions} sessions, ${last14Days.totalMinutes} min, ${last14Days.hardSessions} hard, ${last14Days.restDays} rest. Types: ${JSON.stringify(last14Days.byType)}. Suggest workload management.`,
          },
        ],
        max_tokens: 300,
      });
      text = completion.choices[0]?.message?.content?.trim() || buildFallback();
    } catch (aiErr) {
      const errMsg = aiErr instanceof Error ? aiErr.message : String(aiErr);
      console.error("OpenAI error:", aiErr);
      text =
        buildFallback() +
        "\n\n(AI unavailable—basic recommendations above)" +
        (process.env.NODE_ENV === "development" ? ` [${errMsg}]` : "");
    }

    return NextResponse.json({
      suggestions: text,
      summary: {
        totalSessions: last14Days.totalSessions,
        totalMinutes: last14Days.totalMinutes,
        restDays: last14Days.restDays,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate suggestions";
    console.error("Workload suggestions error:", err);
    return NextResponse.json(
      { error: message || "Something went wrong. Try again." },
      { status: 500 }
    );
  }
}

export const maxDuration = 30;
