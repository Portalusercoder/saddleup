import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseJsonBody } from "@/lib/validation/parse-json";
import { healthPutSchema } from "@/lib/validation/schemas";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const parsed = await parseJsonBody(req, healthPutSchema);
    if (!parsed.ok) return parsed.response;
    const body = parsed.data;
    const id = Number((await params).id);

    const log = await prisma.healthLog.update({
      where: { id },
      data: {
        type: body.type ?? undefined,
        date: body.date ? new Date(body.date) : undefined,
        description: body.description ?? undefined,
        cost: body.cost !== undefined ? body.cost : undefined,
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
