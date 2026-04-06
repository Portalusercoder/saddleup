const DEFAULT_ALLOWED_METHODS = "GET,POST,PUT,PATCH,DELETE,OPTIONS";
const DEFAULT_ALLOWED_HEADERS =
  "Content-Type, Authorization, X-Requested-With, apikey, x-client-info";

function normalizeOrigin(raw: string): string | null {
  try {
    const u = new URL(raw.trim());
    return `${u.protocol}//${u.host}`;
  } catch {
    return null;
  }
}

function buildAllowedOrigins(): Set<string> {
  const set = new Set<string>();

  const envList = process.env.ALLOWED_ORIGINS ?? "";
  for (const part of envList.split(",")) {
    const origin = normalizeOrigin(part);
    if (origin) set.add(origin);
  }

  const appUrl = normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL ?? "");
  if (appUrl) set.add(appUrl);

  if (process.env.NODE_ENV !== "production") {
    set.add("http://localhost:3000");
    set.add("http://127.0.0.1:3000");
  }

  return set;
}

const ALLOWED_ORIGINS = buildAllowedOrigins();

export function getAllowedCorsOrigin(originHeader: string | null): string | null {
  if (!originHeader) return null;
  const origin = normalizeOrigin(originHeader);
  if (!origin) return null;
  return ALLOWED_ORIGINS.has(origin) ? origin : null;
}

export const CORS_ALLOWED_METHODS = DEFAULT_ALLOWED_METHODS;
export const CORS_ALLOWED_HEADERS = DEFAULT_ALLOWED_HEADERS;
