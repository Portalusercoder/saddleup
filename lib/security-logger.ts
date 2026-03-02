/**
 * Security event logger for SIEM / log aggregator integration.
 * Set SIEM_WEBHOOK_URL (and optionally SIEM_WEBHOOK_SECRET) in Vercel to send events.
 * Events are fire-and-forget; failures are not thrown.
 */

export type SecurityEventType =
  | "auth_failure"
  | "access_denied"
  | "cron_invoked"
  | "newsletter_sent"
  | "error"
  | "admin_action";

export type SecurityEvent = {
  type: SecurityEventType;
  message: string;
  timestamp: string; // ISO
  path?: string;
  method?: string;
  status?: number;
  userId?: string | null;
  stableId?: string | null;
  meta?: Record<string, unknown>;
};

const WEBHOOK_URL = process.env.SIEM_WEBHOOK_URL;
const WEBHOOK_SECRET = process.env.SIEM_WEBHOOK_SECRET;

export function logSecurityEvent(event: SecurityEvent): void {
  if (!WEBHOOK_URL || !event.type) return;

  const payload: SecurityEvent & { source?: string } = {
    ...event,
    timestamp: event.timestamp || new Date().toISOString(),
    source: "saddleup",
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (WEBHOOK_SECRET) {
    headers["Authorization"] = `Bearer ${WEBHOOK_SECRET}`;
  }

  fetch(WEBHOOK_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  }).catch((err) => {
    console.error("SIEM webhook send failed:", err);
  });
}

/** Helper: log auth failure (e.g. invalid login, missing token). */
export function logAuthFailure(message: string, meta?: Record<string, unknown>): void {
  logSecurityEvent({
    type: "auth_failure",
    message,
    timestamp: new Date().toISOString(),
    meta,
  });
}

/** Helper: log access denied (403, wrong role). */
export function logAccessDenied(
  message: string,
  opts?: { path?: string; method?: string; userId?: string | null; stableId?: string | null }
): void {
  logSecurityEvent({
    type: "access_denied",
    message,
    timestamp: new Date().toISOString(),
    path: opts?.path,
    method: opts?.method,
    userId: opts?.userId,
    stableId: opts?.stableId,
  });
}

/** Helper: log cron / scheduled job run. */
export function logCronInvoked(
  job: string,
  opts?: { sent?: number; total?: number; meta?: Record<string, unknown> }
): void {
  logSecurityEvent({
    type: "cron_invoked",
    message: `Cron: ${job}`,
    timestamp: new Date().toISOString(),
    meta: { job, ...opts?.meta, sent: opts?.sent, total: opts?.total },
  });
}

/** Helper: log critical error for SIEM. */
export function logSecurityError(
  message: string,
  opts?: { path?: string; method?: string; status?: number; meta?: Record<string, unknown> }
): void {
  logSecurityEvent({
    type: "error",
    message,
    timestamp: new Date().toISOString(),
    path: opts?.path,
    method: opts?.method,
    status: opts?.status,
    meta: opts?.meta,
  });
}
