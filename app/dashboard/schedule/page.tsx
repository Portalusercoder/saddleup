"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useProfile } from "@/components/providers/ProfileProvider";
import { useRouter } from "next/navigation";
import { HorseAvatar } from "@/components/HorseAvatar";

interface Horse {
  id: string | number;
  name: string;
  photoUrl?: string | null;
  sessions?: Session[];
}

interface Session {
  id: string | number;
  punchType: string;
  duration: number;
  rider: string | null;
  createdAt: string;
  horse?: { name: string; photoUrl?: string | null };
}

interface Booking {
  id: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: string;
  horse: { id: string; name: string; photoUrl?: string | null } | null;
  rider: { id: string; name: string } | null;
  trainer: { id: string; fullName: string | null } | null;
}

interface BlockedSlot {
  id: string;
  blockedDate: string;
  startTime: string;
  endTime: string;
  reason?: string | null;
}

const PUNCH_LABELS: Record<string, string> = {
  training: "Training",
  lesson: "Lesson",
  free_ride: "Free Ride",
  competition: "Competition",
  rest: "Rest",
  medical_rest: "Medical Rest",
};

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8);

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function timeToMinutes(t: string): number {
  const s = String(t).slice(0, 5);
  const [h, m] = s.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function timeStr(t: string): string {
  return String(t).slice(0, 5);
}

export default function SchedulePage() {
  const router = useRouter();
  const [horses, setHorses] = useState<Horse[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  });
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState<Booking | null>(null);
  const [blockForm, setBlockForm] = useState({
    blockedDate: "",
    startTime: "09:00",
    endTime: "09:45",
    reason: "",
  });
  const [rescheduleForm, setRescheduleForm] = useState({
    bookingDate: "",
    startTime: "",
    endTime: "",
  });

  const weekStartStr = weekStart.toISOString().slice(0, 10);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekEndStr = weekEnd.toISOString().slice(0, 10);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/schedule?from=${weekStartStr}&to=${weekEndStr}`);
      const d = await res.json();
      if (d.error) return;
      setHorses(d.horses ?? []);
      setSessions(d.sessions ?? []);
      setBookings(Array.isArray(d.bookings) ? d.bookings : []);
      setBlockedSlots(Array.isArray(d.blockedSlots) ? d.blockedSlots : []);
    } finally {
      setLoading(false);
    }
  };

  const { profile } = useProfile();

  useEffect(() => {
    if (profile?.role === "student") {
      router.replace("/dashboard");
    }
  }, [profile?.role, router]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/schedule?from=${weekStartStr}&to=${weekEndStr}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled || d.error) return;
        setHorses(d.horses ?? []);
        setSessions(d.sessions ?? []);
        setBookings(Array.isArray(d.bookings) ? d.bookings : []);
        setBlockedSlots(Array.isArray(d.blockedSlots) ? d.blockedSlots : []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [weekStartStr, weekEndStr]);

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };

  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };

  const goToToday = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    setWeekStart(new Date(d.setDate(diff)));
  };

  const getBookingsForSlot = (dateStr: string, hour: number) => {
    const slotStart = hour * 60;
    const slotEnd = (hour + 1) * 60;
    return bookings.filter((b) => {
      if (b.bookingDate !== dateStr || !["scheduled", "pending"].includes(b.status)) return false;
      const bStart = timeToMinutes(b.startTime);
      const bEnd = timeToMinutes(b.endTime);
      return bStart < slotEnd && bEnd > slotStart;
    });
  };

  const getBlockedForSlot = (dateStr: string, hour: number) => {
    const slotStart = hour * 60;
    const slotEnd = (hour + 1) * 60;
    return blockedSlots.filter((b) => {
      if (b.blockedDate !== dateStr) return false;
      const bStart = timeToMinutes(b.startTime);
      const bEnd = timeToMinutes(b.endTime);
      return bStart < slotEnd && bEnd > slotStart;
    });
  };

  const handleBlockSlot = async () => {
    if (!blockForm.blockedDate) return;
    try {
      const res = await fetch("/api/blocked-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blockedDate: blockForm.blockedDate,
          startTime: blockForm.startTime,
          endTime: blockForm.endTime,
          reason: blockForm.reason || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed");
      }
      setShowBlockModal(false);
      setBlockForm({ blockedDate: "", startTime: "09:00", endTime: "09:45", reason: "" });
      fetchData();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleReschedule = async () => {
    if (!showRescheduleModal) return;
    try {
      const res = await fetch(`/api/bookings/${showRescheduleModal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingDate: rescheduleForm.bookingDate,
          startTime: rescheduleForm.startTime,
          endTime: rescheduleForm.endTime,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed");
      }
      setShowRescheduleModal(null);
      fetchData();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleRemoveBlock = async (id: string) => {
    if (!confirm("Remove this blocked slot?")) return;
    try {
      await fetch(`/api/blocked-slots/${id}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const formInput =
    "w-full px-4 py-3 bg-black border border-white/10 text-white placeholder-white/40 focus:border-white/30 focus:outline-none";
  const btnPrimary =
    "px-4 py-2.5 bg-white text-black font-medium text-sm uppercase tracking-wider hover:opacity-95 transition";
  const btnSecondary =
    "px-4 py-2.5 border border-white/10 text-white text-sm uppercase tracking-wider hover:border-white/30 transition";

  const byDate = sessions.reduce<Record<string, Session[]>>((acc, s) => {
    const d = new Date(s.createdAt).toDateString();
    if (!acc[d]) acc[d] = [];
    acc[d].push(s);
    return acc;
  }, {});

  const recentDates = Object.keys(byDate)
    .sort()
    .reverse()
    .slice(0, 5);

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="font-serif text-3xl md:text-4xl font-normal text-white">
          Schedule & Availability
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={prevWeek} className={btnSecondary}>
            ← Prev
          </button>
          <button onClick={goToToday} className="px-4 py-2.5 text-white/60 text-sm uppercase tracking-wider hover:text-white">
            Today
          </button>
          <button onClick={nextWeek} className={btnSecondary}>
            Next →
          </button>
          <button onClick={() => setShowBlockModal(true)} className={btnPrimary}>
            Block Slot
          </button>
        </div>
      </div>

      <div className="border border-white/10 p-4 overflow-x-auto">
        <p className="text-white/50 text-sm mb-4">
          {formatDate(weekStartStr)} – {formatDate(weekEndStr)}
        </p>
        {loading ? (
          <p className="text-white/50">Loading...</p>
        ) : (
          <div className="min-w-[800px]">
            <div className="grid gap-px bg-white/10" style={{ gridTemplateColumns: `60px repeat(7, 1fr)` }}>
              <div className="bg-black p-2 text-white/50 text-xs uppercase tracking-wider" />
              {days.map((d) => (
                <div
                  key={d.toISOString()}
                  className="bg-black p-2 text-center text-white/80 text-sm font-medium"
                >
                  {formatDate(d.toISOString().slice(0, 10))}
                </div>
              ))}
              {HOURS.flatMap((hour) => [
                <div key={`h-${hour}`} className="bg-black p-2 text-white/50 text-xs">
                  {hour}:00
                </div>,
                ...days.map((day) => {
                  const dateStr = day.toISOString().slice(0, 10);
                  const slotBookings = getBookingsForSlot(dateStr, hour);
                  const slotBlocked = getBlockedForSlot(dateStr, hour);
                  return (
                    <div
                      key={`${dateStr}-${hour}`}
                      className="min-h-[60px] bg-black p-1 border border-white/5"
                    >
                      {slotBlocked.length > 0 ? (
                        <div className="h-full bg-white/10 flex flex-col gap-1">
                          {slotBlocked.map((b) => (
                            <div
                              key={b.id}
                              className="flex items-center justify-between gap-1 px-2 py-1 text-xs"
                            >
                              <span className="text-white/60 truncate">Blocked</span>
                              <button
                                onClick={() => handleRemoveBlock(b.id)}
                                className="text-white/40 hover:text-white text-[10px]"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        slotBookings.map((b) => (
                          <button
                            key={b.id}
                            onClick={() => {
                              setShowRescheduleModal(b);
                              setRescheduleForm({
                                bookingDate: b.bookingDate,
                                startTime: timeStr(b.startTime),
                                endTime: timeStr(b.endTime),
                              });
                            }}
                            className="w-full text-left px-2 py-1 text-xs bg-white/10 hover:bg-white/5 border border-white/10 mb-1 last:mb-0"
                          >
                            <span className="font-medium text-white block truncate">
                              {b.horse?.name || "—"}
                            </span>
                            <span className="text-white/50 truncate block">
                              {b.rider?.name || b.status}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  );
                }),
              ])}
            </div>
          </div>
        )}
      </div>

      <div className="border border-white/10 p-6">
        <h2 className="font-serif text-lg text-white mb-2">Horse Workload This Week</h2>
        <p className="text-sm text-white/60 mb-4">
          Use this to avoid overworking horses. Log sessions from the Horses page.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {horses.map((horse) => {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const weekSessions =
              horse.sessions?.filter(
                (s) =>
                  new Date(s.createdAt) >= sevenDaysAgo &&
                  s.punchType !== "rest" &&
                  s.punchType !== "medical_rest"
              ) ?? [];
            const totalMin = weekSessions.reduce((sum, s) => sum + s.duration, 0);
            const isHeavy = weekSessions.length > 5 || totalMin >= 300;

            return (
              <Link
                key={horse.id}
                href={`/dashboard/horses/${horse.id}`}
                className={`flex items-center gap-3 p-4 border transition ${
                  isHeavy ? "border-white/20 bg-white/[0.02]" : "border-white/10 hover:border-white/20"
                }`}
              >
                <HorseAvatar photoUrl={horse.photoUrl} name={horse.name} size="md" />
                <div>
                  <p className="font-medium text-white">{horse.name}</p>
                  <p className="text-sm text-white/50 mt-1">
                    {weekSessions.length} sessions • {totalMin} min
                  </p>
                  {isHeavy && (
                    <p className="text-white/60 text-xs mt-2 uppercase tracking-wider">
                      Consider rest day
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="border border-white/10 p-6">
        <h2 className="font-serif text-lg text-white mb-4">Recent Activity</h2>
        <div className="space-y-6">
          {recentDates.map((dateStr) => (
            <div key={dateStr}>
              <p className="text-sm text-white/50 mb-2 uppercase tracking-wider">
                {formatDate(dateStr)}
              </p>
              <div className="space-y-2">
                {byDate[dateStr].map((s) => (
                  <div
                    key={s.id}
                    className="flex justify-between items-center gap-3 border border-white/10 px-4 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <HorseAvatar
                        photoUrl={s.horse?.photoUrl}
                        name={s.horse?.name || "Horse"}
                        size="sm"
                      />
                      <span className="text-white">{s.horse?.name || "—"}</span>
                    </div>
                    <span className="text-white/50 text-sm">
                      {PUNCH_LABELS[s.punchType] || s.punchType} •{" "}
                      {s.duration > 0 ? `${s.duration} min` : "Rest"}
                      {s.rider && ` • ${s.rider}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {recentDates.length === 0 && (
            <p className="text-white/50">No sessions logged yet</p>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <Link href="/dashboard/bookings" className={btnPrimary}>
          Bookings
        </Link>
        <Link href="/dashboard/horses" className={btnSecondary}>
          Log Session
        </Link>
      </div>

      {showBlockModal && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto sm:items-center"
          onClick={() => setShowBlockModal(false)}
        >
          <div
            className="bg-black border border-white/10 p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-serif text-xl text-white mb-4">Block Time Slot</h2>
            <p className="text-white/60 text-sm mb-4">
              Block a time when the stable is unavailable. Students cannot request lessons during blocked slots.
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Date</label>
                <input
                  type="date"
                  value={blockForm.blockedDate}
                  onChange={(e) =>
                    setBlockForm((f) => ({ ...f, blockedDate: e.target.value }))
                  }
                  className={formInput}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Start</label>
                  <input
                    type="time"
                    value={blockForm.startTime}
                    onChange={(e) =>
                      setBlockForm((f) => ({ ...f, startTime: e.target.value }))
                    }
                    className={formInput}
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">End</label>
                  <input
                    type="time"
                    value={blockForm.endTime}
                    onChange={(e) =>
                      setBlockForm((f) => ({ ...f, endTime: e.target.value }))
                    }
                    className={formInput}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Reason (optional)</label>
                <input
                  type="text"
                  value={blockForm.reason}
                  onChange={(e) =>
                    setBlockForm((f) => ({ ...f, reason: e.target.value }))
                  }
                  placeholder="e.g. Maintenance"
                  className={formInput}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowBlockModal(false)} className={`flex-1 ${btnSecondary}`}>
                Cancel
              </button>
              <button onClick={handleBlockSlot} className={`flex-1 ${btnPrimary}`}>
                Block
              </button>
            </div>
          </div>
        </div>
      )}

      {showRescheduleModal && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto sm:items-center"
          onClick={() => setShowRescheduleModal(null)}
        >
          <div
            className="bg-black border border-white/10 p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-serif text-xl text-white mb-2">Reschedule</h2>
            <p className="text-white/60 text-sm mb-4">
              {showRescheduleModal.horse?.name} • {showRescheduleModal.rider?.name}
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Date</label>
                <input
                  type="date"
                  value={rescheduleForm.bookingDate}
                  onChange={(e) =>
                    setRescheduleForm((f) => ({ ...f, bookingDate: e.target.value }))
                  }
                  className={formInput}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Start</label>
                  <input
                    type="time"
                    value={rescheduleForm.startTime}
                    onChange={(e) =>
                      setRescheduleForm((f) => ({ ...f, startTime: e.target.value }))
                    }
                    className={formInput}
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">End</label>
                  <input
                    type="time"
                    value={rescheduleForm.endTime}
                    onChange={(e) =>
                      setRescheduleForm((f) => ({ ...f, endTime: e.target.value }))
                    }
                    className={formInput}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowRescheduleModal(null)} className={`flex-1 ${btnSecondary}`}>
                Cancel
              </button>
              <button onClick={handleReschedule} className={`flex-1 ${btnPrimary}`}>
                Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
