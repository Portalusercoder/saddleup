import { NextResponse } from "next/server";

/**
 * Legacy Prisma SQLite endpoints — disabled.
 * Use authenticated `/api/sessions` (Supabase + RLS) instead.
 */
function gone() {
  return NextResponse.json(
    {
      error: "This endpoint has been removed. Use /api/sessions.",
      code: "endpoint_gone",
    },
    { status: 410 }
  );
}

export async function GET() {
  return gone();
}

export async function POST() {
  return gone();
}
