import { z } from "zod";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/error";

/** Max JSON body size to reduce abuse (most routes send small payloads). */
export const MAX_JSON_BYTES = 512 * 1024;

export function validationErrorResponse(error: z.ZodError): NextResponse {
  const issues = error.issues.map((i) => ({
    path: i.path.map(String).join(".") || "(root)",
    message: i.message,
  }));
  return apiError(400, "Validation failed", { code: "VALIDATION_ERROR", issues });
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
        response: apiError(413, "Request body too large", { code: "BODY_TOO_LARGE" }),
      };
    }
    const text = new TextDecoder().decode(buf);
    if (!text.trim()) {
      return {
        ok: false,
        response: apiError(400, "Empty body", { code: "EMPTY_BODY" }),
      };
    }
    raw = JSON.parse(text) as unknown;
  } catch {
    return {
      ok: false,
      response: apiError(400, "Invalid JSON", { code: "INVALID_JSON" }),
    };
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, response: validationErrorResponse(parsed.error) };
  }
  return { ok: true, data: parsed.data };
}
