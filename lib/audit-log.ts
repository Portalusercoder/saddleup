import { createAdminClient } from "@/lib/supabase/admin";

export type AuditAction =
  | "member_removed"
  | "member_role_changed"
  | "horse_deleted"
  | "horse_created"
  | "booking_approved"
  | "booking_declined"
  | "booking_cancelled"
  | "subscription_cancelled"
  | "stable_deletion_scheduled"
  | "reactivated";

type AuditLogParams = {
  actorProfileId: string | null;
  stableId: string;
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  details?: Record<string, unknown>;
};

/**
 * Append an audit log entry. Use service role so it cannot be skipped by RLS.
 * Call this after successful mutations; do not block the main flow on log failures.
 */
export async function auditLog(params: AuditLogParams): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from("audit_logs").insert({
      actor_profile_id: params.actorProfileId || null,
      stable_id: params.stableId,
      action: params.action,
      entity_type: params.entityType ?? null,
      entity_id: params.entityId ?? null,
      details: params.details ?? null,
    });
  } catch (err) {
    console.error("Audit log write failed:", err);
  }
}
