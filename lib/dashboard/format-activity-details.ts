type TranslateFn = (path: string, vars?: Record<string, string>) => string;

function str(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  return undefined;
}

function roleLabel(role: string | undefined, t: TranslateFn): string {
  if (!role) return t("dashboard.activityDetail.roleMember");
  const key = `dashboard.activityDetail.role.${role}`;
  const label = t(key);
  return label !== key ? label : role.replace(/_/g, " ");
}

/**
 * Plain-language summary for stable owners (no JSON / UUIDs).
 */
export function formatActivitySummary(
  action: string,
  details: Record<string, unknown> | null | undefined,
  t: TranslateFn
): string {
  const d = details ?? {};
  const detailKey = `dashboard.activityDetail.${action}`;
  const vars: Record<string, string> = {};

  switch (action) {
    case "horse_deleted":
    case "horse_created": {
      const name = str(d.name);
      if (name) vars.name = name;
      break;
    }
    case "member_removed": {
      vars.role = roleLabel(str(d.removedRole), t);
      break;
    }
    case "member_role_changed": {
      const from = str(d.fromRole);
      const to = str(d.toRole);
      if (from) vars.fromRole = roleLabel(from, t);
      if (to) vars.toRole = roleLabel(to, t);
      break;
    }
    case "booking_approved":
    case "booking_declined":
    case "booking_cancelled": {
      const horse = str(d.horseName);
      const rider = str(d.riderName);
      if (horse) vars.horseName = horse;
      if (rider) vars.riderName = rider;
      break;
    }
    default:
      break;
  }

  const translated = t(detailKey, vars);
  if (translated !== detailKey) return translated;

  const actionLabelPath = `dashboard.activityAction.${action}`;
  const actionLabel = t(actionLabelPath);
  const fallbackAction =
    actionLabel !== actionLabelPath ? actionLabel : action.replace(/_/g, " ");

  const name = str(d.name);
  if (name) {
    return t("dashboard.activityDetail.genericWithName", {
      action: fallbackAction,
      name,
    });
  }

  return fallbackAction;
}
