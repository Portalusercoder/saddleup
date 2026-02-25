import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await req.json();
    const id = Number((await params).id);

    const log = await prisma.healthLog.update({
      where: { id },
      data: {
        type: body.type,
        date: body.date ? new Date(body.date) : undefined,
        description: body.description ?? undefined,
        cost: body.cost !== undefined ? Number(body.cost) : undefined,
        nextDue: body.nextDue ? new Date(body.nextDue) : undefined,
        recoveryStatus: body.recoveryStatus ?? undefined,
      },
    });

    return NextResponse.json(log);
  } catch (error) {
    console.error("PUT health log error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = Number((await params).id);
    await prisma.healthLog.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE health log error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
