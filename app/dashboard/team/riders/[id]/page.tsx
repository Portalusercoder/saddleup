"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useProfile } from "@/components/providers/ProfileProvider";
import { IdCardUpload } from "@/components/dashboard/IdCardUpload";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface Rider {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  level: string | null;
  goals: string | null;
  notes: string | null;
  instructor_feedback: string | null;
  id_card_url?: string | null;
  guardian_id?: string | null;
}

interface Assignment {
  id: string;
  horse_id: string;
  suitability_notes: string | null;
  horses: { id: string; name: string } | null;
}

interface Session {
  id: string;
  punchType: string;
  duration: number;
  intensity?: string | null;
  discipline?: string | null;
  punchDate: string;
  createdAt: string;
  horse: { id: string; name: string } | null;
}

const PUNCH_LABELS: Record<string, string> = {
  training: "Training",
  lesson: "Lesson",
  free_ride: "Free Ride",
  competition: "Competition",
  rest: "Rest",
  medical: "Medical Rest",
};

export default function RiderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [rider, setRider] = useState<Rider | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [horses, setHorses] = useState<{ id: string; name: string }[]>([]);
  const [guardians, setGuardians] = useState<{ id: string; full_name: string | null; email: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useProfile();
  const role = profile?.role ?? null;
  const [showAssign, setShowAssign] = useState(false);
  const [assignHorseId, setAssignHorseId] = useState("");
  const [assignNotes, setAssignNotes] = useState("");
  const [guardianId, setGuardianId] = useState("");
  const [guardianSaving, setGuardianSaving] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/riders/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setRider(data);
        setGuardianId(data?.guardian_id ?? "");
      })
      .catch(() => setRider(null));
    fetch(`/api/rider-horse-assignments?riderId=${id}`)
      .then((r) => r.json())
      .then((d) => setAssignments(Array.isArray(d) ? d : []))
      .catch(() => setAssignments([]));
    fetch(`/api/riders/${id}/sessions`)
      .then((r) => r.json())
      .then((d) => setSessions(Array.isArray(d) ? d : []))
      .catch(() => setSessions([]));
    Promise.all([
      fetch("/api/horses").then((r) => r.json()),
      (role === "owner" || role === "trainer") ? fetch("/api/guardian/profiles").then((r) => r.json()) : Promise.resolve([]),
    ])
      .then(([hData, gData]) => {
        setHorses(Array.isArray(hData) ? hData.map((h: { id: string; name: string }) => ({ id: h.id, name: h.name })) : []);
        setGuardians(Array.isArray(gData) ? gData : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, role]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-black/50">Loading...</p>
      </div>
    );
  }

  if (!rider) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/team/riders" className="text-black/60 hover:text-black text-sm uppercase tracking-wider">
          ← Back to Riders
        </Link>
        <p className="text-black/50">Rider not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link
        href="/dashboard/team/riders"
        className="text-black/60 hover:text-black text-sm uppercase tracking-wider"
      >
        ← Back to Riders
      </Link>

      <div className="border border-black/10 p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-normal text-black">{rider.name}</h1>
          <p className="text-black/60 mt-1 text-sm">
            {rider.level || "—"} • {rider.email || rider.phone || "No contact"}
          </p>
        </div>
        {(role === "owner" || role === "trainer") && (
          <IdCardUpload
            type="rider"
            id={id}
            idCardUrl={rider.id_card_url}
            canUpload={role === "owner"}
            onSuccess={() =>
              fetch(`/api/riders/${id}`)
                .then((r) => r.json())
                .then((d) => setRider(d))
            }
          />
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {(role === "owner" || role === "trainer") && guardians.length > 0 && (
          <div className="border border-black/10 p-6">
            <h2 className="font-serif text-lg text-black mb-4">Parent / Guardian</h2>
            <p className="text-black/50 text-sm mb-4">
              Link a guardian so they can view this rider&apos;s lessons and progress in the Parent Portal.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={guardianId}
                onChange={(e) => setGuardianId(e.target.value)}
                className="px-4 py-2.5 bg-base border border-black/10 text-black focus:border-black/30 focus:outline-none min-w-[200px]"
              >
                <option value="">No guardian linked</option>
                {guardians.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.full_name || g.email || g.id}
                  </option>
                ))}
              </select>
              <button
                onClick={async () => {
                  setGuardianSaving(true);
                  try {
                    const res = await fetch(`/api/riders/${id}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ guardian_id: guardianId || null }),
                    });
                    if (!res.ok) throw new Error("Failed");
                    setRider((prev) => prev ? { ...prev, guardian_id: guardianId || null } : null);
                  } catch {
                    alert("Failed to update guardian");
                  } finally {
                    setGuardianSaving(false);
                  }
                }}
                disabled={guardianSaving}
                className="px-4 py-2.5 bg-accent text-white font-medium text-sm uppercase tracking-wider hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {guardianSaving ? (
                  <>
                    <LoadingSpinner size={16} className="text-black" />
                    Saving…
                  </>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
        )}

        <div className="border border-black/10 p-6">
          <h2 className="font-serif text-lg text-black mb-4">Profile</h2>
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-black/50 text-xs uppercase tracking-widest">Email</dt>
              <dd className="text-black mt-1">{rider.email || "—"}</dd>
            </div>
            <div>
              <dt className="text-black/50 text-xs uppercase tracking-widest">Phone</dt>
              <dd className="text-black mt-1">{rider.phone || "—"}</dd>
            </div>
            <div>
              <dt className="text-black/50 text-xs uppercase tracking-widest">Level</dt>
              <dd className="text-black mt-1 capitalize">{rider.level || "—"}</dd>
            </div>
            <div>
              <dt className="text-black/50 text-xs uppercase tracking-widest">Goals</dt>
              <dd className="text-black mt-1">{rider.goals || "—"}</dd>
            </div>
            <div>
              <dt className="text-black/50 text-xs uppercase tracking-widest">Notes</dt>
              <dd className="text-black mt-1">{rider.notes || "—"}</dd>
            </div>
          </dl>
        </div>

        <div className="border border-black/10 p-6">
          <h2 className="font-serif text-lg text-black mb-4">Instructor feedback</h2>
          <p className="text-black/70 text-sm whitespace-pre-wrap">
            {rider.instructor_feedback || "No feedback yet."}
          </p>
        </div>
      </div>

      {(role === "owner" || role === "trainer") && (
        <div className="border border-black/10 p-6">
          <h2 className="font-serif text-lg text-black mb-4">Assigned Horses</h2>
          <p className="text-black/50 text-sm mb-4">
            Assign horses this rider can book lessons with. Students see these in &quot;My Horses&quot;.
          </p>
          <div className="space-y-2 mb-4">
            {assignments.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between border border-black/10 px-4 py-3"
              >
                <Link
                  href={`/dashboard/horses/${a.horse_id}`}
                  className="font-medium text-black hover:underline"
                >
                  {a.horses?.name ?? "—"}
                </Link>
                {a.suitability_notes && (
                  <span className="text-black/50 text-sm">{a.suitability_notes}</span>
                )}
                <button
                  onClick={async () => {
                    if (!confirm("Remove this assignment?")) return;
                    await fetch(`/api/rider-horse-assignments/${a.id}`, { method: "DELETE" });
                    setAssignments((prev) => prev.filter((x) => x.id !== a.id));
                  }}
                  className="text-black/60 hover:text-black text-xs uppercase tracking-wider"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowAssign(true)}
            className="px-4 py-2.5 bg-accent text-white font-medium text-sm uppercase tracking-wider hover:opacity-95 transition"
          >
            + Assign Horse
          </button>
        </div>
      )}

      <div className="border border-black/10 p-6">
        <h2 className="font-serif text-lg text-black mb-4">Activity timeline</h2>
        <p className="text-black/50 text-sm mb-4">
          Training sessions and lessons logged with this rider.
        </p>
        {sessions.length === 0 ? (
          <p className="text-black/50 text-sm">
            No sessions yet. Log a session from the Horses page and select this rider.
          </p>
        ) : (
          <div className="space-y-2">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between border border-black/10 px-4 py-3"
              >
                <div>
                  <span className="font-medium text-black">
                    {PUNCH_LABELS[s.punchType] || s.punchType}
                  </span>
                  {s.horse && (
                    <Link
                      href={`/dashboard/horses/${s.horse.id}`}
                      className="text-black/60 hover:text-black text-sm ml-2"
                    >
                      {s.horse.name}
                    </Link>
                  )}
                  <span className="text-black/50 text-sm block mt-0.5">
                    {s.duration > 0 ? `${s.duration} min` : "Rest"}
                    {s.discipline && ` • ${s.discipline}`}
                    {s.intensity && ` • ${s.intensity}`}
                  </span>
                </div>
                <span className="text-black/50 text-sm whitespace-nowrap">
                  {new Date(s.punchDate || s.createdAt).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAssign && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto sm:items-center"
          onClick={() => setShowAssign(false)}
        >
          <div
            className="bg-base border border-black/10 p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-serif text-xl text-black mb-4">Assign Horse</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-black/50 uppercase tracking-widest block mb-2">Horse</label>
                <select
                  value={assignHorseId}
                  onChange={(e) => setAssignHorseId(e.target.value)}
                  className="w-full px-4 py-3 bg-base border border-black/10 text-black focus:border-black/30 focus:outline-none"
                >
                  <option value="">Select horse</option>
                  {horses
                    .filter((h) => !assignments.some((a) => a.horse_id === h.id))
                    .map((h) => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-black/50 uppercase tracking-widest block mb-2">Suitability notes (optional)</label>
                <textarea
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 bg-base border border-black/10 text-black placeholder-black/40 focus:border-black/30 focus:outline-none resize-none"
                  placeholder="e.g. Best for flatwork, needs experienced rider"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAssign(false)}
                className="flex-1 py-2.5 border border-black/10 text-black text-sm uppercase tracking-wider hover:border-black/30 transition"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!assignHorseId) return;
                  setAssignLoading(true);
                  try {
                    const res = await fetch("/api/rider-horse-assignments", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        riderId: id,
                        horseId: assignHorseId,
                        suitabilityNotes: assignNotes || null,
                      }),
                    });
                    const data = await res.json();
                    if (!res.ok) {
                      alert(data.error || "Failed");
                      return;
                    }
                    setAssignments((prev) => [
                      ...prev,
                      {
                        id: data.id,
                        horse_id: assignHorseId,
                        suitability_notes: assignNotes || null,
                        horses: horses.find((h) => h.id === assignHorseId)
                          ? { id: assignHorseId, name: horses.find((h) => h.id === assignHorseId)!.name }
                          : null,
                      },
                    ]);
                    setShowAssign(false);
                    setAssignHorseId("");
                    setAssignNotes("");
                  } finally {
                    setAssignLoading(false);
                  }
                }}
                disabled={assignLoading}
                className="flex-1 py-2.5 bg-accent text-white font-medium text-sm uppercase tracking-wider hover:opacity-95 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {assignLoading ? (
                  <>
                    <LoadingSpinner size={16} className="text-black" />
                    Assigning…
                  </>
                ) : (
                  "Assign"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
