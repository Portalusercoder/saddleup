import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    const body = await req.json();

    if (!body.horseId) {
      return NextResponse.json(
        { error: "horseId is required" },
        { status: 400 }
      );
    }

    const session = await prisma.session.create({
      data: {
        punchType: body.punchType || "training",
        duration: Number(body.duration ?? 0),
        intensity: body.intensity || "medium",
        discipline: body.discipline || "flatwork",
        rider: body.rider || null,
        notes: body.notes || null,
        horseId: Number(body.horseId),
      },
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