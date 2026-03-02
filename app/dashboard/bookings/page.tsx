"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useProfile } from "@/components/providers/ProfileProvider";
import { HorseAvatar } from "@/components/HorseAvatar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import TableSkeleton from "@/components/ui/TableSkeleton";

interface Booking {
  id: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string | null;
  declinedNotes?: string | null;
  horse: { id: string; name: string; photoUrl?: string | null } | null;
  rider: { id: string; name: string } | null;
  trainer: { id: string; fullName: string | null } | null;
}

interface Horse {
  id: string;
  name: string;
  photoUrl?: string | null;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [horses, setHorses] = useState<Horse[]>([]);
  const { profile } = useProfile();
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState<Booking | null>(null);
  const [declineNotes, setDeclineNotes] = useState("");
  const [createForm, setCreateForm] = useState({
    horseId: "",
    bookingDate: "",
    startTime: "09:00",
    endTime: "09:45",
    notes: "",
  });
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/bookings").then((r) => r.json()),
      fetch("/api/horses").then((r) => r.json()),
    ]).then(([b, h]) => {
      setBookings(Array.isArray(b) ? b : []);
      setHorses(Array.isArray(h) ? h : []);
      setLoading(false);
    });
  }, []);

  const isStudent = profile?.role === "student";
  const isTrainerOrOwner =
    profile?.role === "trainer" || profile?.role === "owner";

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  const formatTime = (t: string) => {
    if (typeof t !== "string") return t;
    const [h, m] = t.split(":");
    return `${h}:${m || "00"}`;
  };

  const handleCreate = async () => {
    if (!createForm.horseId || !createForm.bookingDate) return;
    setCreateLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          horseId: createForm.horseId,
          bookingDate: createForm.bookingDate,
          startTime: createForm.startTime,
          endTime: createForm.endTime,
          notes: createForm.notes || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setBookings((prev) => [
        ...prev,
        {
          id: data.id,
          bookingDate: data.bookingDate,
          startTime: data.startTime,
          endTime: data.endTime,
          status: data.status,
          horse: horses.find((h) => h.id === createForm.horseId)
            ? { id: createForm.horseId, name: horses.find((h) => h.id === createForm.horseId)!.name, photoUrl: null }
            : null,
          rider: null,
          trainer: null,
        },
      ]);
      setShowCreate(false);
      setCreateForm({ horseId: "", bookingDate: "", startTime: "09:00", endTime: "09:45", notes: "" });
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleApprove = async (b: Booking) => {
    try {
      const res = await fetch(`/api/bookings/${b.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed");
      }
      setBookings((prev) =>
        prev.map((x) => (x.id === b.id ? { ...x, status: "scheduled" } : x))
      );
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleDecline = async () => {
    if (!showDeclineModal) return;
    try {
      const res = await fetch(`/api/bookings/${showDeclineModal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "decline", declinedNotes: declineNotes || null }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed");
      }
      setBookings((prev) =>
        prev.map((x) =>
          x.id === showDeclineModal.id
            ? { ...x, status: "declined", declinedNotes: declineNotes || null }
            : x
        )
      );
      setShowDeclineModal(null);
      setDeclineNotes("");
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this booking?")) return;
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed");
      }
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))
      );
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const pending = bookings.filter(
    (b) =>
      b.status === "pending" &&
      new Date(b.bookingDate) >= new Date(new Date().toDateString())
  );
  const upcoming = bookings.filter(
    (b) =>
      b.status === "scheduled" &&
      new Date(b.bookingDate) >= new Date(new Date().toDateString())
  );
  const myUpcomingPending = bookings.filter(
    (b) =>
      b.status === "pending" &&
      new Date(b.bookingDate) >= new Date(new Date().toDateString())
  );
  const past = bookings.filter(
    (b) =>
      b.status !== "cancelled" &&
      b.status !== "declined" &&
      new Date(b.bookingDate) < new Date(new Date().toDateString())
  );
  const cancelled = bookings.filter((b) => b.status === "cancelled");
  const declined = bookings.filter((b) => b.status === "declined");

  const formInput =
    "w-full px-4 py-3 bg-black border border-white/10 text-white placeholder-white/40 focus:border-white/30 focus:outline-none";
  const btnPrimary =
    "px-4 py-2.5 bg-white text-black font-medium text-sm uppercase tracking-wider hover:opacity-95 transition";
  const btnSecondary =
    "px-4 py-2.5 border border-white/10 text-white text-sm uppercase tracking-wider hover:border-white/30 transition";

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="font-serif text-3xl md:text-4xl font-normal text-white">
          {isStudent ? "My Bookings" : "Bookings"}
        </h1>
        {isStudent && horses.length > 0 && (
          <button onClick={() => setShowCreate(true)} className={btnPrimary}>
            + Request Lesson
          </button>
        )}
      </div>

      {loading ? (
        <TableSkeleton rows={6} cols={4} />
      ) : (
        <>
          {isTrainerOrOwner && pending.length > 0 && (
            <div className="border border-white/20 p-6">
              <h2 className="font-serif text-lg text-white mb-2">
                Pending Requests
              </h2>
              <p className="text-white/50 text-sm mb-4">
                Approve or decline lesson requests from students.
              </p>
              <div className="space-y-3">
                {pending.map((b) => (
                  <div
                    key={b.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-white/10 px-4 py-3"
                  >
                    <div className="flex items-center gap-4">
                      <HorseAvatar
                        photoUrl={b.horse?.photoUrl}
                        name={b.horse?.name ?? "—"}
                        size="sm"
                      />
                      <div>
                        <span className="font-medium text-white">
                          {b.horse?.name ?? "—"}
                        </span>
                        <span className="text-white/50 text-sm ml-2">
                          {formatDate(b.bookingDate)} • {formatTime(b.startTime)}–{formatTime(b.endTime)}
                        </span>
                        {b.rider && (
                          <span className="text-white/40 text-xs block">
                            {b.rider.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleApprove(b)}
                        className="px-3 py-1.5 bg-white text-black text-xs font-medium uppercase tracking-wider hover:opacity-95"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setShowDeclineModal(b);
                          setDeclineNotes("");
                        }}
                        className="px-3 py-1.5 border border-white/30 text-white/80 text-xs uppercase tracking-wider hover:border-white/50"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(upcoming.length > 0 || (isStudent && myUpcomingPending.length > 0)) && (
            <div className="border border-white/10 p-6">
              <h2 className="font-serif text-lg text-white mb-4">
                {isStudent ? "My Lessons" : "Upcoming Lessons"}
              </h2>
              <div className="space-y-3">
                {(isStudent ? [...myUpcomingPending, ...upcoming] : upcoming).map((b) => (
                  <div
                    key={b.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-white/10 px-4 py-3"
                  >
                    <div className="flex items-center gap-4">
                      <HorseAvatar
                        photoUrl={b.horse?.photoUrl}
                        name={b.horse?.name ?? "—"}
                        size="sm"
                      />
                      <div>
                        <span className="font-medium text-white">
                          {b.horse?.name ?? "—"}
                        </span>
                        <span className="text-white/50 text-sm ml-2">
                          {formatDate(b.bookingDate)} • {formatTime(b.startTime)}–{formatTime(b.endTime)}
                        </span>
                        {b.status === "pending" && (
                          <span className="text-white/60 text-xs block">
                            Pending approval
                          </span>
                        )}
                        {b.trainer?.fullName && (
                          <span className="text-white/40 text-xs block">
                            Trainer: {b.trainer.fullName}
                          </span>
                        )}
                      </div>
                    </div>
                    {isStudent && b.status === "scheduled" && (
                      <button
                        onClick={() => handleCancel(b.id)}
                        className="text-white/60 hover:text-white text-xs uppercase tracking-wider"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {isStudent && declined.length > 0 && (
            <div className="border border-white/10 p-6">
              <h2 className="font-serif text-lg text-white mb-4">
                Declined Requests
              </h2>
              <div className="space-y-3">
                {declined.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between border border-white/10 px-4 py-3 opacity-75"
                  >
                    <div className="flex items-center gap-4">
                      <HorseAvatar
                        photoUrl={b.horse?.photoUrl}
                        name={b.horse?.name ?? "—"}
                        size="sm"
                      />
                      <div>
                        <span className="font-medium text-white">
                          {b.horse?.name ?? "—"}
                        </span>
                        <span className="text-white/50 text-sm ml-2">
                          {formatDate(b.bookingDate)} • {formatTime(b.startTime)}–{formatTime(b.endTime)}
                        </span>
                        {b.declinedNotes && (
                          <span className="text-white/60 text-xs block mt-1">
                            Reason: {b.declinedNotes}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-white/50 text-xs uppercase">Declined</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div className="border border-white/10 p-6">
              <h2 className="font-serif text-lg text-white mb-4">
                Past Sessions
              </h2>
              <div className="space-y-3">
                {past.slice(0, 10).map((b) => (
                  <div
                    key={b.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-white/10 px-4 py-3"
                  >
                    <div className="flex items-center gap-4">
                      <HorseAvatar
                        photoUrl={b.horse?.photoUrl}
                        name={b.horse?.name ?? "—"}
                        size="sm"
                      />
                      <div>
                        <span className="font-medium text-white">
                          {b.horse?.name ?? "—"}
                        </span>
                        <span className="text-white/50 text-sm ml-2">
                          {formatDate(b.bookingDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {upcoming.length === 0 && past.length === 0 && cancelled.length === 0 && declined.length === 0 && pending.length === 0 && (
            <div className="border border-white/10 p-8 text-center">
              <p className="text-white/60">
                {isStudent
                  ? "No bookings yet. Request a lesson to get started."
                  : "No bookings in this stable yet."}
              </p>
            </div>
          )}
        </>
      )}

      {showCreate && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto sm:items-center"
          onClick={() => setShowCreate(false)}
        >
          <div
            className="bg-black border border-white/10 p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-serif text-xl text-white mb-4">
              Request a Lesson
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">
                  Horse
                </label>
                <select
                  value={createForm.horseId}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, horseId: e.target.value }))
                  }
                  className={formInput}
                >
                  <option value="">Select horse</option>
                  {horses.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={createForm.bookingDate}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, bookingDate: e.target.value }))
                  }
                  className={formInput}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">
                    Start
                  </label>
                  <input
                    type="time"
                    value={createForm.startTime}
                    onChange={(e) =>
                      setCreateForm((f) => ({ ...f, startTime: e.target.value }))
                    }
                    className={formInput}
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">
                    End
                  </label>
                  <input
                    type="time"
                    value={createForm.endTime}
                    onChange={(e) =>
                      setCreateForm((f) => ({ ...f, endTime: e.target.value }))
                    }
                    className={formInput}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={createForm.notes}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  rows={2}
                  className={`${formInput} resize-none`}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreate(false)}
                className={`flex-1 ${btnSecondary}`}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={createLoading}
                className={`flex-1 ${btnPrimary} disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              >
                {createLoading ? (
                  <>
                    <LoadingSpinner size={16} className="text-black" />
                    Requesting…
                  </>
                ) : (
                  "Request"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeclineModal && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto sm:items-center"
          onClick={() => setShowDeclineModal(null)}
        >
          <div
            className="bg-black border border-white/10 p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-serif text-xl text-white mb-2">Decline Request</h2>
            <p className="text-white/60 text-sm mb-4">
              {showDeclineModal.horse?.name} • {formatDate(showDeclineModal.bookingDate)} • {formatTime(showDeclineModal.startTime)}
            </p>
            <div className="mb-4">
              <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">
                Reason (optional) — shown to the student
              </label>
              <textarea
                value={declineNotes}
                onChange={(e) => setDeclineNotes(e.target.value)}
                placeholder="e.g. Horse is in training that day"
                rows={3}
                className={`${formInput} resize-none`}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeclineModal(null)}
                className={`flex-1 ${btnSecondary}`}
              >
                Cancel
              </button>
              <button
                onClick={handleDecline}
                className="flex-1 px-4 py-2.5 border border-red-500/50 text-red-400 text-sm uppercase tracking-wider hover:border-red-500/80"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
