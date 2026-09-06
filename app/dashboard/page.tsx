"use client";

import { useEffect, useMemo, useState } from "react";
import { useProfile } from "@/components/providers/ProfileProvider";
import Link from "next/link";
import ShareInviteCode from "@/components/dashboard/ShareInviteCode";
import OnboardingChecklist from "@/components/dashboard/OnboardingChecklist";
import { HorseAvatar } from "@/components/HorseAvatar";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface Horse {
  id: number;
  name: string;
  gender: string;
  age: number | null;
  photoUrl?: string | null;
  sessions?: Session[];
}

interface Session {
  id: number;
  duration: number;
  punchType: string;
  intensity: string;
  createdAt: string;
  horse: Horse;
}

function calculateWorkload(horse: Horse) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentSessions =
    horse?.sessions?.filter(
      (s) =>
        new Date(s.createdAt) >= sevenDaysAgo &&
        s.punchType !== "rest" &&
        s.punchType !== "medical_rest"
    ) ?? [];
  const totalMinutes = recentSessions.reduce((sum, s) => sum + s.duration, 0);
  const hardSessions = recentSessions.filter((s) => s.intensity === "Hard").length;
  const warning = recentSessions.length > 5 || hardSessions >= 3 || totalMinutes >= 300;
  return { sessionsCount: recentSessions.length, totalMinutes, hardSessions, warning };
}

function startOfWeek(d = new Date()) {
  const x = new Date(d);
  const day = x.getDay();
  const diff = x.getDate() - day + (day === 0 ? -6 : 1);
  x.setDate(diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

export default function DashboardPage() {
  const { t, lang } = useLanguage();
  const dateLocale = lang === "ar" ? "ar-SA" : "en-US";
  const { profile, refetch: refetchProfile } = useProfile();

  const [horses, setHorses] = useState<Horse[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteStable, setInviteStable] = useState<{
    name: string;
    joinCode: string;
    role: string;
  } | null>(null);
  const [bookings, setBookings] = useState<
    {
      id: string;
      bookingDate: string;
      startTime: string;
      status?: string;
      horse?: { name: string; photoUrl?: string | null };
    }[]
  >([]);
  const [careReminders, setCareReminders] = useState<
    { id: string; typeLabel: string; nextDue: string; horseName: string; horseId: string; overdue: boolean }[]
  >([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [savingTutorial, setSavingTutorial] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!profile || loading) return;
    if (profile.onboardingCompleted || profile.role === "guardian") return;
    setShowOnboarding(true);
  }, [profile, loading]);

  const finishTutorial = async () => {
    if (!profile || savingTutorial) return;
    setSavingTutorial(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboardingCompleted: true }),
      });
      if (!res.ok) return;
      setShowOnboarding(false);
      await refetchProfile();
    } finally {
      setSavingTutorial(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    const safeJson = async (res: Response | null, fallback: unknown) => {
      if (!res) return fallback;
      try {
        return await res.json();
      } catch {
        return fallback;
      }
    };
    try {
      const [horsesRes, sessionsRes, bookingsRes, careRes, stableRes] = await Promise.all([
        fetch("/api/horses"),
        fetch("/api/sessions"),
        fetch("/api/bookings").catch(() => null),
        fetch("/api/care-reminders").catch(() => null),
        fetch("/api/stable").catch(() => null),
      ]);
      const [horsesData, sessionsData, bookingsData, careData, stableData] = await Promise.all([
        safeJson(horsesRes, []),
        safeJson(sessionsRes, []),
        safeJson(bookingsRes, []),
        safeJson(careRes, []),
        safeJson(stableRes, null),
      ]);
      setHorses(Array.isArray(horsesData) ? horsesData : []);
      setSessions(Array.isArray(sessionsData) ? sessionsData : []);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setCareReminders(Array.isArray(careData) ? careData : []);
      setInviteStable(
        stableData &&
          typeof stableData === "object" &&
          "joinCode" in stableData &&
          typeof (stableData as { joinCode?: unknown }).joinCode === "string"
          ? {
              name:
                typeof (stableData as { name?: unknown }).name === "string"
                  ? (stableData as { name: string }).name
                  : t("dashboard.shareInvite.defaultStableName"),
              joinCode: (stableData as { joinCode: string }).joinCode,
              role:
                typeof (stableData as { role?: unknown }).role === "string"
                  ? (stableData as { role: string }).role
                  : "owner",
            }
          : null
      );
    } finally {
      setLoading(false);
    }
  };

  const weekStart = useMemo(() => startOfWeek(), []);
  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        return d;
      }),
    [weekStart]
  );

  const activeSessions = useMemo(
    () =>
      sessions.filter((s) => s.punchType !== "rest" && s.punchType !== "medical_rest"),
    [sessions]
  );

  const sessionsThisWeek = useMemo(
    () =>
      activeSessions.filter((s) => {
        const date = new Date(s.createdAt);
        return date >= weekStart;
      }),
    [activeSessions, weekStart]
  );

  const sessionsByWeekday = useMemo(() => {
    const counts = Array(7).fill(0) as number[];
    for (const s of sessionsThisWeek) {
      const d = new Date(s.createdAt);
      const idx = (d.getDay() + 6) % 7; // Mon=0
      counts[idx] += 1;
    }
    return counts;
  }, [sessionsThisWeek]);

  const maxDaySessions = Math.max(1, ...sessionsByWeekday);
  const peakDayIndex = sessionsByWeekday.indexOf(Math.max(...sessionsByWeekday));

  const avgDuration =
    activeSessions.filter((s) => s.duration > 0).length > 0
      ? (
          activeSessions
            .filter((s) => s.duration > 0)
            .reduce((sum, s) => sum + s.duration, 0) /
          activeSessions.filter((s) => s.duration > 0).length
        ).toFixed(0)
      : "0";

  const upcomingBookings = bookings.filter(
    (b) =>
      b.status !== "cancelled" &&
      b.status !== "declined" &&
      new Date(b.bookingDate) >= new Date(new Date().toDateString())
  );
  const pendingBookings = bookings.filter(
    (b) =>
      b.status === "pending" &&
      new Date(b.bookingDate) >= new Date(new Date().toDateString())
  );
  const overdueCareCount = careReminders.filter((r) => r.overdue).length;
  const overworkedHorses = horses.filter((h) => calculateWorkload(h).warning);

  const heatDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = 4; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      days.push(d);
    }
    return days;
  }, []);

  const horseHeat = useMemo(() => {
    return horses.slice(0, 6).map((horse) => {
      const cells = heatDays.map((day) => {
        const next = new Date(day);
        next.setDate(next.getDate() + 1);
        const daySessions =
          horse.sessions?.filter((s) => {
            const t0 = new Date(s.createdAt);
            return (
              t0 >= day &&
              t0 < next &&
              s.punchType !== "rest" &&
              s.punchType !== "medical_rest"
            );
          }) ?? [];
        const minutes = daySessions.reduce((sum, s) => sum + (s.duration || 0), 0);
        return { count: daySessions.length, minutes };
      });
      return { horse, cells };
    });
  }, [horses, heatDays]);

  const heatLevel = (minutes: number, count: number) => {
    if (count === 0 && minutes === 0) return "bg-white/[0.06]";
    if (minutes >= 90 || count >= 3) return "bg-white";
    if (minutes >= 45 || count >= 2) return "bg-white/55";
    return "bg-white/25";
  };

  const isStudent = profile?.role === "student";
  const isOwner = profile?.role === "owner";
  const isGuardian = profile?.role === "guardian";
  const isFirstRun = showOnboarding && !profile?.onboardingCompleted;

  const rangeLabel = `${weekDays[0].toLocaleDateString(dateLocale, {
    day: "numeric",
    month: "short",
  })} – ${weekDays[6].toLocaleDateString(dateLocale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;

  if (isGuardian) {
    return (
      <div className="space-y-8">
        <h1 className="font-serif text-3xl font-medium text-white">{t("dashboard.pageTitle")}</h1>
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <p className="text-white/70 mb-4">{t("dashboard.guardianLead")}</p>
          <Link href="/dashboard/guardian" className="su-chip inline-flex px-4 py-2.5 rounded-full text-sm font-medium">
            {t("dashboard.guardianOpenPortal")}
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="skeleton h-10 w-64 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="skeleton h-36 rounded-3xl" />
          <div className="skeleton h-36 rounded-3xl" />
          <div className="skeleton h-36 rounded-3xl" />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="skeleton h-64 rounded-3xl" />
          <div className="skeleton h-64 rounded-3xl" />
        </div>
      </div>
    );
  }

  const kpis = isStudent
    ? [
        {
          label: t("dashboard.statUpcomingLessons"),
          value: String(upcomingBookings.length),
          sub: t("dashboard.dashKpiUpcomingSub"),
          featured: true,
          href: "/dashboard/bookings",
        },
        {
          label: t("dashboard.statAssignedHorses"),
          value: String(horses.length),
          sub: t("dashboard.dashKpiHorsesSub"),
          href: "/dashboard/my-horses",
        },
        {
          label: t("dashboard.statSessionsThisWeek"),
          value: String(sessionsThisWeek.length),
          sub: t("dashboard.dashKpiWeekSub"),
          href: "/dashboard/training-history",
        },
      ]
    : [
        {
          label: t("dashboard.statSessionsThisWeek"),
          value: String(sessionsThisWeek.length),
          sub: t("dashboard.dashKpiWeekSubDetail", { avg: avgDuration }),
          featured: true,
          href: "/dashboard/schedule",
        },
        {
          label: t("dashboard.glanceUpcomingBookings"),
          value: String(upcomingBookings.length),
          sub: t("dashboard.dashKpiBookingsSub"),
          href: "/dashboard/bookings",
        },
        {
          label: pendingBookings.length > 0
            ? t("dashboard.glancePendingApprovals")
            : t("dashboard.statTotalHorses"),
          value: String(pendingBookings.length > 0 ? pendingBookings.length : horses.length),
          sub:
            pendingBookings.length > 0
              ? t("dashboard.dashKpiPendingSub")
              : t("dashboard.dashKpiHorsesSub"),
          href: pendingBookings.length > 0 ? "/dashboard/bookings" : "/dashboard/horses",
        },
      ];

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Title row */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.2em] text-white/40 mb-2">
            {inviteStable?.name || t("dashboard.pageTitle")}
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-white tracking-tight">
            {t("dashboard.dashAnalysisTitle")}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3.5 py-2 text-sm text-white/70">
            <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {rangeLabel}
          </span>
          <Link
            href="/dashboard/schedule"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3.5 py-2 text-sm text-white/70 hover:text-white hover:bg-white/[0.05] transition"
          >
            {t("dashboard.viewSchedule")}
          </Link>
          {!isStudent && (
            <Link href="/dashboard/analytics" className="su-chip inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium">
              {t("dashboard.dashExportCta")}
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M7 7h10v10" />
              </svg>
            </Link>
          )}
        </div>
      </div>

      {showOnboarding && (
        <OnboardingChecklist
          role={profile?.role}
          horseCount={horses.length}
          joinCode={inviteStable?.joinCode}
          saving={savingTutorial}
          onComplete={finishTutorial}
          onDismiss={finishTutorial}
        />
      )}

      {isOwner && !isFirstRun && <ShareInviteCode stable={inviteStable} />}

      {!isFirstRun && (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {kpis.map((kpi) => (
              <Link
                key={kpi.label}
                href={kpi.href}
                className={`group relative rounded-[1.75rem] p-5 md:p-6 min-h-[8.5rem] transition-transform hover:-translate-y-0.5 su-focus-ring ${
                  kpi.featured
                    ? "su-chip"
                    : "bg-white/[0.04] border border-white/10 text-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className={`text-sm ${kpi.featured ? "text-black/55" : "text-white/50"}`}>
                    {kpi.label}
                  </p>
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      kpi.featured ? "bg-black text-white" : "bg-white/10 text-white"
                    }`}
                    aria-hidden
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M7 7h10v10" />
                    </svg>
                  </span>
                </div>
                <p className={`mt-4 font-serif text-4xl md:text-5xl tracking-tight ${kpi.featured ? "text-black" : "text-white"}`}>
                  {kpi.value}
                </p>
                <p className={`mt-3 text-sm ${kpi.featured ? "text-black/45" : "text-white/40"}`}>
                  {kpi.sub}
                </p>
              </Link>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 md:gap-4">
            <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 md:p-6">
              <div className="flex items-center justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-base font-semibold text-white">{t("dashboard.dashSessionsChartTitle")}</h2>
                  <p className="text-sm text-white/40 mt-1">{t("dashboard.dashSessionsChartSub")}</p>
                </div>
                <span className="text-xs uppercase tracking-wider text-white/35 border border-white/10 rounded-full px-3 py-1">
                  {t("dashboard.dashPeriodWeek")}
                </span>
              </div>
              <div className="flex items-end gap-2 sm:gap-3 h-44 pt-6">
                {sessionsByWeekday.map((count, i) => {
                  const height = Math.max(8, Math.round((count / maxDaySessions) * 100));
                  const isPeak = i === peakDayIndex && count > 0;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                      {isPeak && (
                        <span className="su-chip text-[0.65rem] font-semibold px-2 py-0.5 rounded-full mb-1">
                          {count}
                        </span>
                      )}
                      <div
                        className={`w-full max-w-[2.5rem] rounded-t-2xl rounded-b-md transition-all ${
                          isPeak ? "bg-white" : "bg-white/20"
                        }`}
                        style={{ height: `${height}%` }}
                        title={`${count}`}
                      />
                      <span className="text-[0.65rem] uppercase tracking-wider text-white/40">
                        {weekDays[i].toLocaleDateString(dateLocale, { weekday: "short" })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 md:p-6">
              <div className="flex items-center justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-base font-semibold text-white">{t("dashboard.dashHeatTitle")}</h2>
                  <p className="text-sm text-white/40 mt-1">{t("dashboard.dashHeatSub")}</p>
                </div>
                <Link href="/dashboard/horses" className="text-xs uppercase tracking-wider text-white/45 hover:text-white">
                  {t("dashboard.dashViewAll")}
                </Link>
              </div>

              {horseHeat.length === 0 ? (
                <p className="text-sm text-white/40 py-10">{t("dashboard.noSessionsYet")}</p>
              ) : (
                <div className="space-y-3">
                  <div className="grid gap-2" style={{ gridTemplateColumns: `7rem repeat(5, 1fr)` }}>
                    <div />
                    {heatDays.map((d) => (
                      <div key={d.toISOString()} className="text-center text-[0.6rem] uppercase tracking-wider text-white/35">
                        {d.toLocaleDateString(dateLocale, { weekday: "short" })}
                      </div>
                    ))}
                  </div>
                  {horseHeat.map(({ horse, cells }) => (
                    <div
                      key={horse.id}
                      className="grid gap-2 items-center"
                      style={{ gridTemplateColumns: `7rem repeat(5, 1fr)` }}
                    >
                      <Link
                        href={`/dashboard/horses/${horse.id}`}
                        className="flex items-center gap-2 min-w-0 text-sm text-white/80 hover:text-white"
                      >
                        <HorseAvatar photoUrl={horse.photoUrl} name={horse.name} size="sm" />
                        <span className="truncate">{horse.name}</span>
                      </Link>
                      {cells.map((cell, i) => (
                        <div
                          key={`${horse.id}-${i}`}
                          className={`h-9 rounded-xl ${heatLevel(cell.minutes, cell.count)}`}
                          title={`${cell.count} · ${cell.minutes}m`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Attention + activity */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 md:gap-4">
            <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 md:p-6">
              <h2 className="text-base font-semibold text-white mb-4">{t("dashboard.dashAttentionTitle")}</h2>
              <ul className="space-y-3">
                {!isStudent && pendingBookings.length > 0 && (
                  <li>
                    <Link href="/dashboard/bookings" className="flex items-center justify-between gap-3 rounded-2xl bg-white/[0.04] px-4 py-3 hover:bg-white/[0.07] transition">
                      <span className="text-sm text-white">{t("dashboard.actionReviewPending")}</span>
                      <span className="su-chip text-xs font-semibold px-2.5 py-1 rounded-full">{pendingBookings.length}</span>
                    </Link>
                  </li>
                )}
                {!isStudent && overdueCareCount > 0 && (
                  <li>
                    <Link href="/dashboard/horses" className="flex items-center justify-between gap-3 rounded-2xl bg-white/[0.04] px-4 py-3 hover:bg-white/[0.07] transition">
                      <span className="text-sm text-white">{t("dashboard.actionCareDue")}</span>
                      <span className="su-chip text-xs font-semibold px-2.5 py-1 rounded-full">{overdueCareCount}</span>
                    </Link>
                  </li>
                )}
                {!isStudent && overworkedHorses.length > 0 && (
                  <li>
                    <Link href="/dashboard/schedule" className="flex items-center justify-between gap-3 rounded-2xl bg-white/[0.04] px-4 py-3 hover:bg-white/[0.07] transition">
                      <span className="text-sm text-white">{t("dashboard.glanceOverworkedHorses")}</span>
                      <span className="su-chip text-xs font-semibold px-2.5 py-1 rounded-full">{overworkedHorses.length}</span>
                    </Link>
                  </li>
                )}
                {isStudent && upcomingBookings.slice(0, 4).map((b) => (
                  <li key={b.id}>
                    <Link href="/dashboard/bookings" className="flex items-center gap-3 rounded-2xl bg-white/[0.04] px-4 py-3 hover:bg-white/[0.07] transition">
                      {b.horse && <HorseAvatar photoUrl={b.horse.photoUrl} name={b.horse.name} size="sm" />}
                      <div className="min-w-0">
                        <p className="text-sm text-white truncate">{b.horse?.name ?? t("dashboard.lessonFallback")}</p>
                        <p className="text-xs text-white/40">
                          {new Date(b.bookingDate).toLocaleDateString(dateLocale, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          · {String(b.startTime).slice(0, 5)}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
                {((!isStudent &&
                  pendingBookings.length === 0 &&
                  overdueCareCount === 0 &&
                  overworkedHorses.length === 0) ||
                  (isStudent && upcomingBookings.length === 0)) && (
                  <p className="text-sm text-white/40 py-4">{t("dashboard.dashAttentionEmpty")}</p>
                )}
              </ul>
            </section>

            <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-white">
                  {isStudent ? t("dashboard.recentMySessions") : t("dashboard.recentSessions")}
                </h2>
                <Link
                  href={isStudent ? "/dashboard/training-history" : "/dashboard/activity"}
                  className="text-xs uppercase tracking-wider text-white/40 hover:text-white"
                >
                  {t("dashboard.dashViewAll")}
                </Link>
              </div>
              <div className="space-y-1">
                {sessions.slice(0, 5).map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between gap-3 py-3 border-b border-white/[0.06] last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{session.horse?.name}</p>
                      <p className="text-xs text-white/40">
                        {session.punchType === "training"
                          ? t("dashboard.punchTraining")
                          : session.punchType === "lesson"
                            ? t("dashboard.punchLesson")
                            : session.punchType === "free_ride"
                              ? t("dashboard.punchFreeRide")
                              : session.punchType === "competition"
                                ? t("dashboard.punchCompetition")
                                : session.punchType === "rest"
                                  ? t("dashboard.punchRest")
                                  : session.punchType === "medical_rest"
                                    ? t("dashboard.punchMedicalRest")
                                    : session.punchType}
                      </p>
                    </div>
                    <span className="text-sm text-white/45 shrink-0">
                      {session.duration > 0
                        ? `${session.duration} ${t("dashboard.minShort")}`
                        : t("dashboard.restSession")}
                    </span>
                  </div>
                ))}
                {sessions.length === 0 && (
                  <p className="text-sm text-white/40 py-4">{t("dashboard.noSessionsYet")}</p>
                )}
              </div>
            </section>
          </div>

          {/* Bottom strip */}
          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] px-5 py-4 md:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-white">
                {t("dashboard.dashStripTitle", {
                  count: String(isStudent ? upcomingBookings.length : bookings.length),
                })}
              </p>
              <p className="text-xs text-white/40 mt-1">{t("dashboard.dashStripSub")}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {!isStudent && (
                <Link href="/dashboard/horses?add=1" className="rounded-full border border-white/15 px-3.5 py-2 text-sm text-white/70 hover:text-white hover:bg-white/[0.05]">
                  {t("dashboard.addHorse")}
                </Link>
              )}
              <Link href="/dashboard/bookings" className="su-chip inline-flex px-4 py-2 rounded-full text-sm font-medium">
                {isStudent ? t("navRole.myBookings") : t("dashboard.scheduleLinkBookings")}
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
