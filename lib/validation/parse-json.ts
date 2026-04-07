import { z } from "zod";
import { NextResponse } from "next/server";

/** Max JSON body size to reduce abuse (most routes send small payloads). */
export const MAX_JSON_BYTES = 512 * 1024;

export function validationErrorResponse(error: z.ZodError): NextResponse {
  const issues = error.issues.map((i) => ({
    path: i.path.map(String).join(".") || "(root)",
    message: i.message,
  }));
  return NextResponse.json(
    { error: "Validation failed", issues },
    { status: 400 }
  );
}

/**
 * Parse JSON with a size cap, then validate with Zod. Strips unknown keys if schema uses .strip().
 */
export async function parseJsonBody<T extends z.ZodType>(
  req: Request,
  schema: T
): Promise<
  { ok: true; data: z.infer<T> } | { ok: false; response: NextResponse }
> {
  let raw: unknown;
  try {
    const buf = await req.arrayBuffer();
    if (buf.byteLength > MAX_JSON_BYTES) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: "Request body too large" },
          { status: 413 }
        ),
      };
    }
    const text = new TextDecoder().decode(buf);
    if (!text.trim()) {
      return {
        ok: false,
        response: NextResponse.json({ error: "Empty body" }, { status: 400 }),
      };
    }
    raw = JSON.parse(text) as unknown;
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "Invalid JSON" }, { status: 400 }),
    };
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, response: validationErrorResponse(parsed.error) };
  }
  return { ok: true, data: parsed.data };
}
