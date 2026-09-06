"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useProfile } from "@/components/providers/ProfileProvider";
import { useRouter } from "next/navigation";
import { HorseAvatar } from "@/components/HorseAvatar";
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

type TabId = "overview" | "calendar" | "week";
type EventFilter = "all" | "scheduled" | "pending" | "cancelled" | "declined";

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8);

function timeToMinutes(t: string): number {
  const s = String(t).slice(0, 5);
  const [h, m] = s.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function timeStr(t: string): string {
  return String(t).slice(0, 5);
}

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfWeek(d: Date): Date {
  const x = new Date(d);
  const day = x.getDay();
  const diff = x.getDate() - day + (day === 0 ? -6 : 1);
  x.setDate(diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function monthMatrix(year: number, month: number): (Date | null)[][] {
  const first = new Date(year, month, 1);
  const startPad = (first.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

function StatusBadge({
  status,
  label,
}: {
  status: string;
  label: string;
}) {
  const styles: Record<string, string> = {
    scheduled: "su-chip",
    pending: "bg-white/15 text-white",
    cancelled: "border border-white/20 text-white/45",
    declined: "border border-white/20 text-white/45",
    blocked: "border border-dashed border-white/30 text-white/55",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] font-semibold uppercase tracking-wide ${
        styles[status] ?? "bg-white/15 text-white"
      }`}
    >
      {label}
    </span>
  );
}

export default function SchedulePage() {
  const router = useRouter();
  const { profile } = useProfile();
  const { t, lang } = useLanguage();
  const dateLocale = lang === "ar" ? "ar-SA" : "en-US";

  const [horses, setHorses] = useState<Horse[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<TabId>("overview");
  const [eventFilter, setEventFilter] = useState<EventFilter>("all");
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()));

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
  const [doneTodos, setDoneTodos] = useState<Record<string, boolean>>({});

  const monthStart = toDateKey(new Date(viewMonth.year, viewMonth.month, 1));
  const monthEnd = toDateKey(new Date(viewMonth.year, viewMonth.month + 1, 0));
  const weekStartStr = toDateKey(weekStart);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekEndStr = toDateKey(weekEnd);

  const fetchRange = tab === "week" ? { from: weekStartStr, to: weekEndStr } : { from: monthStart, to: monthEnd };

  const { open: showTour, complete: completeTour } = usePageTour(
    "saddleup_tour_schedule_v2",
    !loading && profile?.role !== "student"
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/schedule?from=${fetchRange.from}&to=${fetchRange.to}`);
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

  useEffect(() => {
    if (profile?.role === "student") router.replace("/dashboard");
  }, [profile?.role, router]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/schedule?from=${fetchRange.from}&to=${fetchRange.to}`)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchRange.from, fetchRange.to]);

  const bookingDates = useMemo(() => {
    const set = new Set<string>();
    for (const b of bookings) {
      if (["scheduled", "pending"].includes(b.status)) set.add(b.bookingDate);
    }
    for (const b of blockedSlots) set.add(b.blockedDate);
    return set;
  }, [bookings, blockedSlots]);

  const filteredEvents = useMemo(() => {
    const todayKey = toDateKey(new Date());
    return [...bookings]
      .filter((b) => (eventFilter === "all" ? true : b.status === eventFilter))
      .sort((a, b) => {
        const ad = a.bookingDate.localeCompare(b.bookingDate);
        if (ad !== 0) return ad;
        return timeStr(a.startTime).localeCompare(timeStr(b.startTime));
      })
      .filter((b) => b.bookingDate >= todayKey || eventFilter !== "all")
      .slice(0, 12);
  }, [bookings, eventFilter]);

  const selectedDayEvents = useMemo(() => {
    const key = toDateKey(selectedDate);
    return bookings
      .filter((b) => b.bookingDate === key)
      .sort((a, b) => timeStr(a.startTime).localeCompare(timeStr(b.startTime)));
  }, [bookings, selectedDate]);

  const recentActivity = useMemo(() => {
    return [...sessions]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);
  }, [sessions]);

  const todos = useMemo(() => {
    const items: { id: string; label: string; meta?: string; href?: string }[] = [];
    const pending = bookings.filter((b) => b.status === "pending");
    for (const b of pending.slice(0, 4)) {
      items.push({
        id: `pending-${b.id}`,
        label: t("dashboard.scheduleTodoApprove", {
          horse: b.horse?.name ?? "—",
          rider: b.rider?.name ?? "—",
        }),
        meta: b.bookingDate,
        href: "/dashboard/bookings",
      });
    }
    const todayKey = toDateKey(new Date());
    const todayBookings = bookings.filter(
      (b) => b.bookingDate === todayKey && b.status === "scheduled"
    );
    for (const b of todayBookings.slice(0, 3)) {
      items.push({
        id: `today-${b.id}`,
        label: t("dashboard.scheduleTodoToday", {
          horse: b.horse?.name ?? "—",
          time: timeStr(b.startTime),
        }),
        meta: todayKey,
      });
    }
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    for (const horse of horses) {
      const weekSessions =
        horse.sessions?.filter(
          (s) =>
            new Date(s.createdAt) >= sevenDaysAgo &&
            s.punchType !== "rest" &&
            s.punchType !== "medical_rest"
        ) ?? [];
      const totalMin = weekSessions.reduce((sum, s) => sum + s.duration, 0);
      if (weekSessions.length > 5 || totalMin >= 300) {
        items.push({
          id: `rest-${horse.id}`,
          label: t("dashboard.scheduleTodoRest", { horse: horse.name }),
          href: `/dashboard/horses/${horse.id}`,
        });
      }
    }
    return items.slice(0, 8);
  }, [bookings, horses, t]);

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

  const statusLabel = (status: string) => {
    const key = `dashboard.bookingsStatus_${status}` as const;
    const translated = t(key);
    return translated === key ? status : translated;
  };

  const formatMonthTitle = (year: number, month: number) =>
    new Date(year, month, 1).toLocaleDateString(dateLocale, {
      month: "long",
      year: "numeric",
    });

  const formatEventWhen = (b: Booking) => {
    const date = new Date(`${b.bookingDate}T12:00:00`);
    return `${date.toLocaleDateString(dateLocale, {
      month: "short",
      day: "numeric",
    })} · ${timeStr(b.startTime)}–${timeStr(b.endTime)}`;
  };

  const openSlotBlock = (dateStr: string, hour?: number) => {
    const start = hour != null ? `${String(hour).padStart(2, "0")}:00` : "09:00";
    const end = hour != null ? `${String(hour).padStart(2, "0")}:45` : "09:45";
    setBlockForm({ blockedDate: dateStr, startTime: start, endTime: end, reason: "" });
    setShowBlockModal(true);
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

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const weeks = monthMatrix(viewMonth.year, viewMonth.month);
  const weekdayLabels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.UTC(2024, 0, 1 + i)); // Mon–Sun
    return d.toLocaleDateString(dateLocale, { weekday: "short", timeZone: "UTC" });
  });

  const tourSteps: GuidedTourStep[] = [
    {
      id: "tabs",
      title: t("dashboard.scheduleTourTabsTitle"),
      description: t("dashboard.scheduleTourTabsDesc"),
      selector: '[data-tour="schedule-tabs"]',
    },
    {
      id: "calendar",
      title: t("dashboard.scheduleTourCalendarTitle"),
      description: t("dashboard.scheduleTourCalendarDesc"),
      selector: '[data-tour="schedule-calendar"]',
    },
    {
      id: "events",
      title: t("dashboard.scheduleTourEventsTitle"),
      description: t("dashboard.scheduleTourEventsDesc"),
      selector: '[data-tour="schedule-events"]',
    },
  ];

  const formInput =
    "w-full px-4 py-3 bg-white/[0.04] border border-white/15 text-white placeholder-white/35 focus:border-white/40 focus:outline-none rounded-xl";
  const btnPrimary =
    "su-chip inline-flex items-center justify-center px-4 py-2.5 min-h-[42px] text-sm font-medium rounded-full hover:opacity-90 transition su-focus-ring";
  const btnGhost =
    "inline-flex items-center justify-center px-3 py-2 min-h-[42px] text-sm text-white/60 hover:text-white rounded-full hover:bg-white/[0.06] transition su-focus-ring";

  const tabs: { id: TabId; label: string }[] = [
    { id: "overview", label: t("dashboard.scheduleTabOverview") },
    { id: "calendar", label: t("dashboard.scheduleTabCalendar") },
    { id: "week", label: t("dashboard.scheduleTabWeek") },
  ];

  const CalendarPanel = ({ compact = false }: { compact?: boolean }) => (
    <div data-tour="schedule-calendar" className={compact ? "" : "h-full"}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-base font-semibold text-white tracking-tight">
          {formatMonthTitle(viewMonth.year, viewMonth.month)}
        </h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className={btnGhost}
            onClick={() =>
              setViewMonth((m) => {
                const d = new Date(m.year, m.month - 1, 1);
                return { year: d.getFullYear(), month: d.getMonth() };
              })
            }
            aria-label={t("dashboard.schedulePrevMonth")}
          >
            ‹
          </button>
          <button
            type="button"
            className={btnGhost}
            onClick={() => {
              const now = new Date();
              setViewMonth({ year: now.getFullYear(), month: now.getMonth() });
              setSelectedDate(now);
            }}
          >
            {t("dashboard.scheduleToday")}
          </button>
          <button
            type="button"
            className={btnGhost}
            onClick={() =>
              setViewMonth((m) => {
                const d = new Date(m.year, m.month + 1, 1);
                return { year: d.getFullYear(), month: d.getMonth() };
              })
            }
            aria-label={t("dashboard.scheduleNextMonth")}
          >
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekdayLabels.map((label) => (
          <div key={label} className="text-center text-[0.65rem] uppercase tracking-wider text-white/40 py-1">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weeks.flatMap((week, wi) =>
          week.map((day, di) => {
            if (!day) return <div key={`e-${wi}-${di}`} className="h-10" />;
            const key = toDateKey(day);
            const isSelected = key === toDateKey(selectedDate);
            const isToday = key === toDateKey(new Date());
            const hasEvents = bookingDates.has(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setSelectedDate(day);
                  if (tab === "overview") setTab("calendar");
                }}
                className={`relative h-10 w-full rounded-full text-sm font-medium transition-colors su-focus-ring flex items-center justify-center ${
                  isSelected
                    ? "su-chip"
                    : isToday
                      ? "bg-white/[0.1] text-white"
                      : "text-white/75 hover:bg-white/[0.06]"
                }`}
              >
                {day.getDate()}
                {hasEvents && !isSelected && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white" />
                )}
              </button>
            );
          })
        )}
      </div>
      {loading && (
        <p className="mt-4 text-sm text-white/40">{t("common.loading")}</p>
      )}
    </div>
  );

  const EventsPanel = ({
    items,
    title,
  }: {
    items: Booking[];
    title: string;
  }) => (
    <div data-tour="schedule-events" className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-base font-semibold text-white tracking-tight">{title}</h2>
        <div className="flex items-center gap-2">
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value as EventFilter)}
            className="text-sm bg-transparent border border-white/10 rounded-full px-3 py-1.5 text-white/70 su-focus-ring"
          >
            <option value="all">{t("dashboard.scheduleFilterAll")}</option>
            <option value="scheduled">{t("dashboard.bookingsStatus_scheduled")}</option>
            <option value="pending">{t("dashboard.bookingsStatus_pending")}</option>
            <option value="cancelled">{t("dashboard.bookingsStatus_cancelled")}</option>
            <option value="declined">{t("dashboard.bookingsStatus_declined")}</option>
          </select>
          <Link href="/dashboard/bookings" className={btnPrimary}>
            {t("dashboard.scheduleAddNew")}
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-white/[0.06]">
        {items.length === 0 && (
          <p className="py-8 text-sm text-white/45">{t("dashboard.scheduleNoEvents")}</p>
        )}
        {items.map((b) => {
          const date = new Date(`${b.bookingDate}T12:00:00`);
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => {
                setShowRescheduleModal(b);
                setRescheduleForm({
                  bookingDate: b.bookingDate,
                  startTime: timeStr(b.startTime),
                  endTime: timeStr(b.endTime),
                });
              }}
              className="w-full text-start py-4 flex gap-4 hover:bg-white/[0.02] transition-colors rounded-xl px-1 su-focus-ring"
            >
              <div className="w-12 shrink-0 text-center">
                <p className="text-xl font-semibold text-white leading-none">{date.getDate()}</p>
                <p className="text-[0.65rem] uppercase tracking-wider text-white/40 mt-1">
                  {date.toLocaleDateString(dateLocale, { weekday: "short" })}
                </p>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <p className="font-semibold text-white truncate">
                    {b.horse?.name ?? "—"}
                    {b.rider?.name ? ` · ${b.rider.name}` : ""}
                  </p>
                  <StatusBadge status={b.status} label={statusLabel(b.status)} />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/50">
                  <span className="inline-flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatEventWhen(b)}
                  </span>
                  {b.trainer?.fullName && (
                    <span className="inline-flex items-center gap-1.5 truncate">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {b.trainer.fullName}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <GuidedTourOverlay
        open={showTour}
        steps={tourSteps}
        onSkip={completeTour}
        onComplete={completeTour}
      />

      <div className="bg-base text-white rounded-3xl border border-white/10 overflow-hidden">
        {/* Board header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2" data-tour="schedule-tabs">
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors su-focus-ring ${
                  tab === item.id
                    ? "bg-white/15 text-white"
                    : "text-white/45 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openSlotBlock(toDateKey(selectedDate))}
              className={btnPrimary}
              data-tour="schedule-block-slot"
            >
              {t("dashboard.scheduleBlockSlot")}
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6">
          {tab === "overview" && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-white/[0.08] p-4 sm:p-5">
                <CalendarPanel compact />
              </div>
              <div className="rounded-2xl border border-white/[0.08] p-4 sm:p-5 min-h-[22rem]">
                <EventsPanel items={filteredEvents} title={t("dashboard.scheduleYourEvents")} />
              </div>
              <div className="rounded-2xl border border-white/[0.08] p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-white tracking-tight">
                    {t("dashboard.scheduleActivityFeed")}
                  </h2>
                  <Link href="/dashboard/activity" className="text-sm text-white/45 hover:text-white">
                    {t("dashboard.scheduleFilterAll")}
                  </Link>
                </div>
                <div className="space-y-4">
                  {recentActivity.length === 0 && (
                    <p className="text-sm text-white/45 py-6">{t("dashboard.scheduleNoSessions")}</p>
                  )}
                  {recentActivity.map((s) => (
                    <div key={s.id} className="flex items-start gap-3">
                      <HorseAvatar photoUrl={s.horse?.photoUrl} name={s.horse?.name || "—"} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="font-medium text-white truncate">{s.horse?.name || "—"}</p>
                          <span className="text-[0.7rem] text-white/35 shrink-0">
                            {new Date(s.createdAt).toLocaleTimeString(dateLocale, {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-white/50 truncate">
                          {punchLabel(s.punchType)}
                          {s.duration > 0
                            ? ` · ${t("dashboard.trainingHistoryDurationMin", { minutes: String(s.duration) })}`
                            : ` · ${t("dashboard.scheduleRestLabel")}`}
                          {s.rider ? ` · ${s.rider}` : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-white/[0.08] p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-white tracking-tight">
                    {t("dashboard.scheduleTodoTitle")}
                  </h2>
                  <Link href="/dashboard/bookings" className={btnPrimary}>
                    {t("dashboard.scheduleAddNew")}
                  </Link>
                </div>
                <ul className="space-y-3">
                  {todos.length === 0 && (
                    <p className="text-sm text-white/45 py-6">{t("dashboard.scheduleTodoEmpty")}</p>
                  )}
                  {todos.map((todo) => {
                    const done = !!doneTodos[todo.id];
                    return (
                      <li key={todo.id} className="flex items-start gap-3 px-1 py-1 rounded-xl hover:bg-white/[0.02]">
                        <button
                          type="button"
                          onClick={() =>
                            setDoneTodos((prev) => ({ ...prev, [todo.id]: !prev[todo.id] }))
                          }
                          className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors su-focus-ring ${
                            done ? "su-chip" : "border-white/25 text-white"
                          }`}
                          aria-pressed={done}
                          aria-label={t("dashboard.scheduleTodoToggle")}
                        >
                          {done && (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                        {todo.href ? (
                          <Link
                            href={todo.href}
                            className={`flex-1 text-sm su-focus-ring rounded-sm ${
                              done ? "text-white/35 line-through" : "text-white"
                            }`}
                          >
                            {todo.label}
                          </Link>
                        ) : (
                          <span className={`flex-1 text-sm ${done ? "text-white/35 line-through" : "text-white"}`}>
                            {todo.label}
                          </span>
                        )}
                        {todo.meta && (
                          <span className="text-[0.65rem] uppercase tracking-wider text-white/35 shrink-0">
                            {todo.meta.slice(5)}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}

          {tab === "calendar" && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-white/[0.08] p-4 sm:p-5">
                <CalendarPanel />
              </div>
              <div className="rounded-2xl border border-white/[0.08] p-4 sm:p-5 min-h-[22rem]">
                <EventsPanel
                  items={selectedDayEvents}
                  title={t("dashboard.scheduleDayEvents", {
                    date: selectedDate.toLocaleDateString(dateLocale, {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    }),
                  })}
                />
              </div>
            </div>
          )}

          {tab === "week" && (
            <div className="space-y-4" data-tour="schedule-week-nav">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-white/50">
                  {new Date(weekStartStr + "T12:00:00").toLocaleDateString(dateLocale, {
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  –{" "}
                  {new Date(weekEndStr + "T12:00:00").toLocaleDateString(dateLocale, {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className={btnGhost}
                    onClick={() => {
                      const d = new Date(weekStart);
                      d.setDate(d.getDate() - 7);
                      setWeekStart(d);
                    }}
                  >
                    {t("dashboard.schedulePrevWeek")}
                  </button>
                  <button
                    type="button"
                    className={btnGhost}
                    onClick={() => setWeekStart(startOfWeek(new Date()))}
                  >
                    {t("dashboard.scheduleToday")}
                  </button>
                  <button
                    type="button"
                    className={btnGhost}
                    onClick={() => {
                      const d = new Date(weekStart);
                      d.setDate(d.getDate() + 7);
                      setWeekStart(d);
                    }}
                  >
                    {t("dashboard.scheduleNextWeek")}
                  </button>
                </div>
              </div>

              <div
                className="rounded-2xl border border-white/[0.08] overflow-x-auto"
                data-tour="schedule-grid"
              >
                {loading ? (
                  <p className="p-8 text-sm text-white/40">{t("common.loading")}</p>
                ) : (
                  <div className="min-w-[820px] p-2">
                    <div
                      className="grid gap-px bg-white/10"
                      style={{ gridTemplateColumns: `56px repeat(7, 1fr)` }}
                    >
                      <div className="bg-transparent p-2" />
                      {days.map((d) => (
                        <div
                          key={d.toISOString()}
                          className="bg-transparent p-2 text-center text-sm font-medium text-white/80"
                        >
                          {d.toLocaleDateString(dateLocale, {
                            weekday: "short",
                            day: "numeric",
                          })}
                        </div>
                      ))}
                      {HOURS.flatMap((hour) => [
                        <div key={`h-${hour}`} className="bg-transparent p-2 text-white/40 text-xs">
                          {hour}:00
                        </div>,
                        ...days.map((day) => {
                          const dateStr = toDateKey(day);
                          const slotBookings = getBookingsForSlot(dateStr, hour);
                          const slotBlocked = getBlockedForSlot(dateStr, hour);
                          return (
                            <div
                              key={`${dateStr}-${hour}`}
                              className="min-h-[56px] bg-transparent p-1"
                            >
                              {slotBlocked.length > 0 ? (
                                <div className="h-full flex flex-col gap-1">
                                  {slotBlocked.map((b) => (
                                    <div
                                      key={b.id}
                                      className="flex items-center justify-between gap-1 px-2 py-1 text-xs rounded-lg bg-white/[0.04]"
                                    >
                                      <span className="text-white/55 truncate">
                                        {t("dashboard.scheduleBlockedLabel")}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveBlock(b.id)}
                                        className="text-white/35 hover:text-white"
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
                                  className="w-full h-full min-h-[48px] rounded-lg text-white/20 hover:bg-white/[0.04] hover:text-white/50 transition"
                                  title={t("dashboard.scheduleSlotBook")}
                                >
                                  +
                                </button>
                              ) : (
                                slotBookings.map((b) => (
                                  <button
                                    key={b.id}
                                    type="button"
                                    onClick={() => {
                                      setShowRescheduleModal(b);
                                      setRescheduleForm({
                                        bookingDate: b.bookingDate,
                                        startTime: timeStr(b.startTime),
                                        endTime: timeStr(b.endTime),
                                      });
                                    }}
                                    className="w-full text-left px-2 py-1.5 text-xs rounded-lg bg-white/[0.05] hover:bg-white/[0.08] mb-1 last:mb-0"
                                  >
                                    <span className="font-medium text-white block truncate">
                                      {b.horse?.name || "—"}
                                    </span>
                                    <span className="text-white/45 truncate block">
                                      {b.rider?.name || statusLabel(b.status)}
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
            </div>
          )}
        </div>
      </div>

      {showBlockModal && (
        <div
          className="fixed inset-0 bg-white/70 flex items-center justify-center p-4 z-50"
          onClick={() => setShowBlockModal(false)}
        >
          <div
            className="bg-[#0a0a0a] text-white border border-white/10 p-5 sm:p-6 w-full max-w-md rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-2">{t("dashboard.scheduleBlockModalTitle")}</h2>
            <p className="text-white/55 text-sm mb-4">{t("dashboard.scheduleBlockModalLead")}</p>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/45 uppercase tracking-widest block mb-2">
                  {t("dashboard.bookingsLabelDate")}
                </label>
                <input
                  type="date"
                  value={blockForm.blockedDate}
                  onChange={(e) => setBlockForm((f) => ({ ...f, blockedDate: e.target.value }))}
                  className={formInput}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/45 uppercase tracking-widest block mb-2">
                    {t("dashboard.bookingsLabelStart")}
                  </label>
                  <input
                    type="time"
                    value={blockForm.startTime}
                    onChange={(e) => setBlockForm((f) => ({ ...f, startTime: e.target.value }))}
                    className={formInput}
                  />
                </div>
                <div>
                  <label className="text-xs text-white/45 uppercase tracking-widest block mb-2">
                    {t("dashboard.bookingsLabelEnd")}
                  </label>
                  <input
                    type="time"
                    value={blockForm.endTime}
                    onChange={(e) => setBlockForm((f) => ({ ...f, endTime: e.target.value }))}
                    className={formInput}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-white/45 uppercase tracking-widest block mb-2">
                  {t("dashboard.scheduleReasonOptional")}
                </label>
                <input
                  type="text"
                  value={blockForm.reason}
                  onChange={(e) => setBlockForm((f) => ({ ...f, reason: e.target.value }))}
                  placeholder={t("dashboard.scheduleReasonPlaceholder")}
                  className={formInput}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button type="button" onClick={() => setShowBlockModal(false)} className={`flex-1 ${btnGhost} border border-white/10`}>
                {t("dashboard.bookingsCancel")}
              </button>
              <button type="button" onClick={handleBlockSlot} className={`flex-1 ${btnPrimary}`}>
                {t("dashboard.scheduleBlockSubmit")}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRescheduleModal && (
        <div
          className="fixed inset-0 bg-white/70 flex items-center justify-center p-4 z-50"
          onClick={() => setShowRescheduleModal(null)}
        >
          <div
            className="bg-[#0a0a0a] text-white border border-white/10 p-5 sm:p-6 w-full max-w-md rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-1">{t("dashboard.scheduleRescheduleTitle")}</h2>
            <p className="text-white/55 text-sm mb-4">
              {showRescheduleModal.horse?.name} · {showRescheduleModal.rider?.name}
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/45 uppercase tracking-widest block mb-2">
                  {t("dashboard.bookingsLabelDate")}
                </label>
                <input
                  type="date"
                  value={rescheduleForm.bookingDate}
                  onChange={(e) =>
                    setRescheduleForm((f) => ({ ...f, bookingDate: e.target.value }))
                  }
                  className={formInput}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/45 uppercase tracking-widest block mb-2">
                    {t("dashboard.bookingsLabelStart")}
                  </label>
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
                  <label className="text-xs text-white/45 uppercase tracking-widest block mb-2">
                    {t("dashboard.bookingsLabelEnd")}
                  </label>
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
              <button
                type="button"
                onClick={() => setShowRescheduleModal(null)}
                className={`flex-1 ${btnGhost} border border-white/10`}
              >
                {t("dashboard.bookingsCancel")}
              </button>
              <button type="button" onClick={handleReschedule} className={`flex-1 ${btnPrimary}`}>
                {t("dashboard.scheduleRescheduleTitle")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
