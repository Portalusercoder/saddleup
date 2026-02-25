"use client";

import { useEffect, useState } from "react";
import { useProfile } from "@/components/providers/ProfileProvider";
import { IdCardUpload } from "@/components/dashboard/IdCardUpload";

interface TeamMember {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  id_card_url?: string | null;
}

export default function TeamTrainersPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const { profile } = useProfile();
  const currentUserId = profile?.id ?? null;

  const fetchMembers = () => {
    fetch("/api/members")
      .then((r) => r.json())
      .then((d) => setTeamMembers(Array.isArray(d) ? d : []))
      .catch(() => setTeamMembers([]));
  };

  useEffect(() => {
    if (!profile) return;
    if (profile.role === "student") return;
    fetchMembers();
  }, [profile]);

  useEffect(() => {
    const handler = () => fetchMembers();
    window.addEventListener("team-refresh", handler);
    return () => window.removeEventListener("team-refresh", handler);
  }, []);

  const trainers = teamMembers.filter((m) => m.role === "trainer");

  return (
    <>
      <p className="text-white/50 text-sm mb-4">
        Trainers are added via &quot;Add member by personal ID&quot; above. They can teach lessons and manage riders.
      </p>

      {toast && (
        <div className="px-4 py-2 border border-white/10 text-white text-sm mb-4" role="alert">
          {toast}
        </div>
      )}

      {trainers.length === 0 ? (
        <p className="text-white/50">No trainers yet. Add one using their personal ID above.</p>
      ) : (
        <div className="border border-white/10 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-white/50 text-xs uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium w-48">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {trainers.map((m) => (
                <tr key={m.id} className="hover:bg-white/[0.02]">
                  <td className="px-6 py-4 font-medium text-white">
                    {m.full_name || m.email || "—"}
                  </td>
                  <td className="px-6 py-4 text-white/60">{m.email || "—"}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-4 items-center">
                      <IdCardUpload
                        type="trainer"
                        id={m.id}
                        idCardUrl={m.id_card_url}
                        canUpload={profile?.role === "owner"}
                        onSuccess={fetchMembers}
                      />
                      {m.id !== currentUserId && (
                        <button
                          onClick={async () => {
                            if (
                              !confirm(
                                `Remove ${m.full_name || m.email || "this trainer"} from the team?`
                              )
                            )
                              return;
                            const res = await fetch(`/api/members/${m.id}`, {
                              method: "DELETE",
                            });
                            const data = await res.json();
                            if (!res.ok) {
                              setToast(data.error || "Failed to remove");
                              return;
                            }
                            setToast("Trainer removed");
                            fetchMembers();
                          }}
                          className="text-white/60 hover:text-white text-sm uppercase tracking-wider"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
