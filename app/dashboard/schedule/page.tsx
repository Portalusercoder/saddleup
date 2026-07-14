"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useProfile } from "@/components/providers/ProfileProvider";
import { useRouter } from "next/navigation";
import { HorseAvatar } from "@/components/HorseAvatar";
import TableSkeleton from "@/components/ui/TableSkeleton";
import GuidedTourOverlay, { type GuidedTourStep } from "@/components/dashboard/GuidedTourOverlay";
import { usePageTour } from "@/components/dashboard/usePageTour";
import { useLanguage } from "@/components/providers/LanguageProvider";

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

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8);

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
  const openSlotBlock = (dateStr: string, hour: number) => {
    const start = `${String(hour).padStart(2, "0")}:00`;
    const end = `${String(hour).padStart(2, "0")}:45`;
    setBlockForm({ blockedDate: dateStr, startTime: start, endTime: end, reason: "" });
    setShowBlockModal(true);
  };
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
  const { open: showTour, complete: completeTour } = usePageTour(
    "saddleup_tour_schedule_v1",
    !loading && profile?.role !== "student"
  );

  const { t, lang } = useLanguage();
  const dateLocale = lang === "ar" ? "ar-SA" : "en-US";

  const punchLabel = (punchType: string) => {
    const map: Record<string, string> = {
      training: t("dashboard.punchTraining"),
      lesson: t("dashboard.punchLesson"),
      free_ride: t("dashboard.punchFreeRide"),
      competition: t("dashboard.punchCompetition"),
      rest: t("dashboard.punchRest"),
      medical_rest: t("dashboard.punchMedicalRest"),
    };
    return map[punchType] ?? punchType;
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(dateLocale, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  const tourSteps: GuidedTourStep[] = [
    {
      id: "week-nav",
      title: t("dashboard.scheduleTourWeekTitle"),
      description: t("dashboard.scheduleTourWeekDesc"),
      selector: '[data-tour="schedule-week-nav"]',
    },
    {
      id: "block-slot",
      title: t("dashboard.scheduleTourBlockTitle"),
      description: t("dashboard.scheduleTourBlockDesc"),
      selector: '[data-tour="schedule-block-slot"]',
    },
    {
      id: "grid",
      title: t("dashboard.scheduleTourGridTitle"),
      description: t("dashboard.scheduleTourGridDesc"),
      selector: '[data-tour="schedule-grid"]',
    },
  ];

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
    if (!confirm(t("dashboard.scheduleConfirmRemoveBlock"))) return;
    try {
      await fetch(`/api/blocked-slots/${id}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const formInput =
    "w-full px-4 py-3 bg-base border border-black/10 text-black placeholder-black/40 focus:border-black/30 focus:outline-none rounded-control";
  const btnPrimary =
    "px-4 py-2.5 bg-accent text-white font-medium text-sm uppercase tracking-wider hover:opacity-95 transition rounded-control";
  const btnSecondary =
    "px-4 py-2.5 border border-black/10 text-black text-sm uppercase tracking-wider hover:border-black/30 transition rounded-control";

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
      <GuidedTourOverlay
        open={showTour}
        steps={tourSteps}
        onSkip={completeTour}
        onComplete={completeTour}
      />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="font-serif text-3xl md:text-4xl font-medium text-black">
          {t("dashboard.schedulePageTitle")}
        </h1>
        <div className="flex flex-wrap items-center gap-2" data-tour="schedule-week-nav">
          <button onClick={prevWeek} className={btnSecondary}>
            {t("dashboard.schedulePrevWeek")}
          </button>
          <button onClick={goToToday} className="px-4 py-2.5 text-black/60 text-sm uppercase tracking-wider hover:text-black">
            {t("dashboard.scheduleToday")}
          </button>
          <button onClick={nextWeek} className={btnSecondary}>
            {t("dashboard.scheduleNextWeek")}
          </button>
          <button onClick={() => setShowBlockModal(true)} className={btnPrimary} data-tour="schedule-block-slot">
            {t("dashboard.scheduleBlockSlot")}
          </button>
        </div>
      </div>

      <div className="card border border-black/10 p-4 overflow-x-auto rounded-control" data-tour="schedule-grid">
        <p className="text-black/50 text-sm mb-4">
          {formatDate(weekStartStr)} – {formatDate(weekEndStr)}
        </p>
        {loading ? (
          <TableSkeleton rows={8} cols={5} showHeaderBar={false} showBottomBar={false} />
        ) : (
          <div className="min-w-[800px]">
            <div className="grid gap-px bg-white/10" style={{ gridTemplateColumns: `60px repeat(7, 1fr)` }}>
              <div className="bg-base p-2 text-black/50 text-xs uppercase tracking-wider" />
              {days.map((d) => (
                <div
                  key={d.toISOString()}
                  className="bg-base p-2 text-center text-black/80 text-sm font-medium"
                >
                  {formatDate(d.toISOString().slice(0, 10))}
                </div>
              ))}
              {HOURS.flatMap((hour) => [
                <div key={`h-${hour}`} className="bg-base p-2 text-black/50 text-xs">
                  {hour}:00
                </div>,
                ...days.map((day) => {
                  const dateStr = day.toISOString().slice(0, 10);
                  const slotBookings = getBookingsForSlot(dateStr, hour);
                  const slotBlocked = getBlockedForSlot(dateStr, hour);
                  return (
                    <div
                      key={`${dateStr}-${hour}`}
                      className="min-h-[60px] bg-base p-1 border border-black/5"
                    >
                      {slotBlocked.length > 0 ? (
                        <div className="h-full bg-white/10 flex flex-col gap-1">
                          {slotBlocked.map((b) => (
                            <div
                              key={b.id}
                              className="flex items-center justify-between gap-1 px-2 py-1 text-xs"
                            >
                              <span className="text-black/60 truncate">{t("dashboard.scheduleBlockedLabel")}</span>
                              <button
                                onClick={() => handleRemoveBlock(b.id)}
                                className="text-black/40 hover:text-black text-[10px]"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : slotBookings.length === 0 ? (
                        <button
                          type="button"
                          onClick={() => openSlotBlock(dateStr, hour)}
                          className="w-full h-full min-h-[52px] text-left px-1 py-1 text-[10px] uppercase tracking-wider text-black/30 hover:bg-accent/10 hover:text-accent transition dark:text-white/30"
                          title={t("dashboard.scheduleSlotBook")}
                        >
                          +
                        </button>
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
                            className="w-full text-left px-2 py-1 text-xs bg-white/10 hover:bg-black/5 border border-black/10 mb-1 last:mb-0"
                          >
                            <span className="font-medium text-black block truncate">
                              {b.horse?.name || "—"}
                            </span>
                            <span className="text-black/50 truncate block">
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

      <div className="card border border-black/10 p-6 rounded-control dark:border-white/10" data-tour="schedule-recent">
        <h2 className="font-serif text-lg text-black dark:text-white mb-4">{t("dashboard.scheduleRecentActivity")}</h2>
        <div className="space-y-6">
          {recentDates.map((dateStr) => (
            <div key={dateStr}>
              <p className="text-sm text-black/50 mb-2 uppercase tracking-wider dark:text-white/50">
                {formatDate(dateStr)}
              </p>
              <div className="space-y-3">
                {byDate[dateStr].map((s) => (
                  <div
                    key={s.id}
                    className="flex justify-between items-center gap-3 border border-black/10 px-4 py-3 rounded-control dark:border-white/10"
                  >
                    <div className="flex items-center gap-2">
                      <HorseAvatar
                        photoUrl={s.horse?.photoUrl}
                        name={s.horse?.name || "—"}
                        size="sm"
                      />
                      <span className="text-black dark:text-white">{s.horse?.name || "—"}</span>
                    </div>
                    <span className="text-black/50 text-sm dark:text-white/50">
                      {punchLabel(s.punchType)} •{" "}
                      {s.duration > 0
                        ? t("dashboard.trainingHistoryDurationMin", { minutes: String(s.duration) })
                        : t("dashboard.scheduleRestLabel")}
                      {s.rider && ` • ${s.rider}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {recentDates.length === 0 && (
            <p className="text-black/50 dark:text-white/50">{t("dashboard.scheduleNoSessions")}</p>
          )}
        </div>
      </div>

      <div className="card border border-black/10 p-6 rounded-control dark:border-white/10">
        <h2 className="font-serif text-lg text-black dark:text-white mb-2">{t("dashboard.scheduleWorkloadHeading")}</h2>
        <p className="text-sm text-black/60 mb-4">
          {t("dashboard.scheduleWorkloadLead")}
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
                href={`/dashboard/horses/${horse.id}?week=${weekStartStr}`}
                className={`flex items-center gap-3 p-4 border transition ${
                  isHeavy ? "border-black/20 bg-black/[0.02]" : "border-black/10 hover:border-black/20"
                }`}
              >
                <HorseAvatar photoUrl={horse.photoUrl} name={horse.name} size="md" />
                <div>
                  <p className="font-medium text-black">{horse.name}</p>
                  <p className="text-sm text-black/50 mt-1">
                    {t("dashboard.scheduleSessionsMin", {
                      count: String(weekSessions.length),
                      minutes: String(totalMin),
                    })}
                  </p>
                  {isHeavy && (
                    <p className="text-black/60 text-xs mt-2 uppercase tracking-wider">
                      {t("dashboard.scheduleConsiderRest")}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex gap-4">
        <Link href="/dashboard/bookings" className={btnPrimary}>
          {t("dashboard.scheduleLinkBookings")}
        </Link>
        <Link href="/dashboard/horses" className={btnSecondary}>
          {t("dashboard.scheduleLogSession")}
        </Link>
      </div>

      {showBlockModal && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto sm:items-center"
          onClick={() => setShowBlockModal(false)}
        >
          <div
            className="bg-base border border-black/10 p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-serif text-xl text-black mb-4">{t("dashboard.scheduleBlockModalTitle")}</h2>
            <p className="text-black/60 text-sm mb-4">
              {t("dashboard.scheduleBlockModalLead")}
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-black/50 uppercase tracking-widest block mb-2">{t("dashboard.bookingsLabelDate")}</label>
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
                  <label className="text-xs text-black/50 uppercase tracking-widest block mb-2">{t("dashboard.bookingsLabelStart")}</label>
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
                  <label className="text-xs text-black/50 uppercase tracking-widest block mb-2">{t("dashboard.bookingsLabelEnd")}</label>
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
                <label className="text-xs text-black/50 uppercase tracking-widest block mb-2">{t("dashboard.scheduleReasonOptional")}</label>
                <input
                  type="text"
                  value={blockForm.reason}
                  onChange={(e) =>
                    setBlockForm((f) => ({ ...f, reason: e.target.value }))
                  }
                  placeholder={t("dashboard.scheduleReasonPlaceholder")}
                  className={formInput}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowBlockModal(false)} className={`flex-1 ${btnSecondary}`}>
                {t("dashboard.bookingsCancel")}
              </button>
              <button onClick={handleBlockSlot} className={`flex-1 ${btnPrimary}`}>
                {t("dashboard.scheduleBlockSubmit")}
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
            className="bg-base border border-black/10 p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-serif text-xl text-black mb-2">{t("dashboard.scheduleRescheduleTitle")}</h2>
            <p className="text-black/60 text-sm mb-4">
              {showRescheduleModal.horse?.name} • {showRescheduleModal.rider?.name}
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-black/50 uppercase tracking-widest block mb-2">{t("dashboard.bookingsLabelDate")}</label>
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
                  <label className="text-xs text-black/50 uppercase tracking-widest block mb-2">{t("dashboard.bookingsLabelStart")}</label>
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
                  <label className="text-xs text-black/50 uppercase tracking-widest block mb-2">{t("dashboard.bookingsLabelEnd")}</label>
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
                {t("dashboard.bookingsCancel")}
              </button>
              <button onClick={handleReschedule} className={`flex-1 ${btnPrimary}`}>
                {t("dashboard.scheduleRescheduleTitle")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
