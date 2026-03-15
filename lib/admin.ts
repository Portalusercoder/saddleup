/**
 * Admin access: only emails listed in ADMIN_EMAILS env (comma-separated) can access /admin and /api/admin/*.
 * Set in Vercel: ADMIN_EMAILS=you@example.com,other@example.com
 */

export function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | undefined): boolean {
  if (!email) return false;
  const list = getAdminEmails();
  if (list.length === 0) return false;
  return list.includes(email.trim().toLowerCase());
}
