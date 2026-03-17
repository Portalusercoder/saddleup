"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/components/providers/ProfileProvider";

type LogRow = {
  id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
};

function actionLabel(action: string): string {
  const labels: Record<string, string> = {
    member_removed: "Member removed",
    member_role_changed: "Role changed",
    horse_deleted: "Horse deleted",
    horse_created: "Horse added",
    booking_approved: "Booking approved",
    booking_declined: "Booking declined",
    booking_cancelled: "Booking cancelled",
    subscription_cancelled: "Subscription cancelled",
    stable_deletion_scheduled: "Account deletion scheduled",
    reactivated: "Account reactivated",
  };
  return labels[action] ?? action.replace(/_/g, " ");
}

export default function ActivityPage() {
  const router = useRouter();
  const { profile, loading: profileLoading } = useProfile();
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    if (profile.role !== "owner" && profile.role !== "trainer") {
      router.replace("/dashboard");
      return;
    }
    fetch("/api/activity?limit=100")
      .then((r) => r.json())
      .then((data) => (data.logs ? setLogs(data.logs) : []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [profile, router]);

  if (profileLoading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-black/50">Loading...</p>
      </div>
    );
  }

  if (profile.role !== "owner" && profile.role !== "trainer") {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl md:text-4xl font-normal text-black">Activity</h1>
        <p className="text-black/60 mt-2 text-sm">
          Internal log for your stable: member and role changes, horses, bookings, and account actions.
        </p>
      </div>

      {loading ? (
        <p className="text-black/50">Loading activity…</p>
      ) : (
        <div className="overflow-x-auto border border-black/10 rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/10 bg-black/5">
                <th className="text-left p-3 font-medium text-black">Time</th>
                <th className="text-left p-3 font-medium text-black">Action</th>
                <th className="text-left p-3 font-medium text-black">Entity</th>
                <th className="text-left p-3 font-medium text-black">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-black/5 hover:bg-black/5">
                  <td className="p-3 text-black/70 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="p-3 font-medium text-black">{actionLabel(log.action)}</td>
                  <td className="p-3 text-black/70">
                    {log.entity_type && log.entity_id
                      ? `${log.entity_type} (${log.entity_id.slice(0, 8)}…)`
                      : "—"}
                  </td>
                  <td className="p-3 text-black/60 max-w-xs truncate">
                    {log.details && Object.keys(log.details).length > 0
                      ? JSON.stringify(log.details)
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && logs.length === 0 && (
        <p className="text-black/50">No activity recorded yet.</p>
      )}
    </div>
  );
}
