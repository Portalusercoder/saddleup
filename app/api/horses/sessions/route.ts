import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseJsonBody } from "@/lib/validation/parse-json";
import { horseSessionPrismaPostSchema } from "@/lib/validation/schemas";
import { captureServerEvent } from "@/lib/analytics/posthog-server";

/* ================= GET ALL SESSIONS ================= */

export async function GET() {
  try {
    const sessions = await prisma.session.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        horse: true, // optional but useful
      },
    });

    return NextResponse.json(sessions); 
  } catch (error) {
    console.error("GET sessions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

/* ================= CREATE SESSION ================= */

export async function POST(req: Request) {
  try {
    const parsed = await parseJsonBody(req, horseSessionPrismaPostSchema);
    if (!parsed.ok) return parsed.response;
    const body = parsed.data;

    const session = await prisma.session.create({
      data: {
        punchType: body.punchType || "training",
        duration: body.duration,
        intensity: body.intensity || "medium",
        discipline: body.discipline || "flatwork",
        rider: body.rider || null,
        notes: body.notes || null,
        horseId: body.horseId,
      },
    });

    captureServerEvent("session_logged", String(body.horseId), {
      punch_type: body.punchType || "training",
      duration_minutes: body.duration,
      intensity: body.intensity || "medium",
      discipline: body.discipline || "flatwork",
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error("POST session error:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}