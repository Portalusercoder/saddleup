/**
 * Allow only same-origin relative paths. Blocks protocol-relative (//evil),
 * backslash tricks, scheme-relative, and absolute URLs used for open redirects.
 */
export function safeInternalPath(
  candidate: string | null | undefined,
  fallback = "/dashboard"
): string {
  if (!candidate) return fallback;

  let path = candidate.trim();
  // Decode once to catch encoded separators (e.g. %2F%2F)
  try {
    path = decodeURIComponent(path);
  } catch {
    return fallback;
  }
  path = path.trim();

  if (!path.startsWith("/")) return fallback;
  if (path.startsWith("//")) return fallback;
  if (path.includes("\\")) return fallback;
  if (path.includes("://")) return fallback;
  if (/[\0\r\n]/.test(path)) return fallback;

  return path;
}
