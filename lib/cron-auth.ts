import { NextResponse } from "next/server";

/**
 * Cron jobs must present Authorization: Bearer <CRON_SECRET>.
 * If CRON_SECRET is missing, fail closed (503) so destructive jobs cannot run exposed.
 */
export function requireCronBearer(authHeader: string | null): NextResponse | null {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: "Cron is not configured (CRON_SECRET missing)." },
      { status: 503 }
    );
  }
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
