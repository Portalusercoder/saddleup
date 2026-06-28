"use client";

import { useEffect, useState } from "react";
import { useProfile } from "@/components/providers/ProfileProvider";
import Link from "next/link";
import ShareInviteCode from "@/components/dashboard/ShareInviteCode";
import WeekAtAGlance, { type GlanceItem } from "@/components/dashboard/WeekAtAGlance";
import SmartQuickActions, { type QuickAction } from "@/components/dashboard/SmartQuickActions";
import StatCard from "@/components/dashboard/StatCard";
import { HorseAvatar } from "@/components/HorseAvatar";
import GuidedTourOverlay, {
  type GuidedTourStep,
} from "@/components/dashboard/GuidedTourOverlay";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface Horse {
  id: number;
  name: string;
  gender: string;
  age: number | null;
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
      (s) => new Date(s.createdAt) >= sevenDaysAgo && s.punchType !== "rest" && s.punchType !== "medical_rest"
    ) ?? [];

  const totalMinutes = recentSessions.reduce((sum, s) => sum + s.duration, 0);
  const hardSessions = recentSessions.filter((s) => s.intensity === "Hard").length;

  const warning =
    recentSessions.length > 5 || hardSessions >= 3 || totalMinutes >= 300;

  return { sessionsCount: recentSessions.length, totalMinutes, hardSessions, warning };
}

export default function DashboardPage() {
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

  const [horses, setHorses] = useState<Horse[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteStable, setInviteStable] = useState<{
    name: string;
    joinCode: string;
    role: string;
  } | null>(null);
  const [bookings, setBookings] = useState<
    { id: string; bookingDate: string; startTime: string; status?: string; horse?: { name: string; photoUrl?: string | null } }[]
  >([]);
  const [careReminders, setCareReminders] = useState<
    { id: string; typeLabel: string; nextDue: string; horseName: string; horseId: string; overdue: boolean }[]
  >([]);
  const [showTutorial, setShowTutorial] = useState(false);
  const [savingTutorial, setSavingTutorial] = useState(false);
  const { profile, refetch: refetchProfile } = useProfile();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!profile) return;
    if (loading) return;
    if (profile.onboardingCompleted) return;
    if (profile.role === "guardian") return;
    setShowTutorial(true);
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
      setShowTutorial(false);
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
      const [horsesRes, sessionsRes, bookingsRes, careRes, stableRes] =
        await Promise.all([
          fetch("/api/horses"),
          fetch("/api/sessions"),
          fetch("/api/bookings").catch(() => null),
          fetch("/api/care-reminders").catch(() => null),
          fetch("/api/stable").catch(() => null),
        ]);

      const [horsesData, sessionsData, bookingsData, careData, stableData] =
        await Promise.all([
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

  const totalSessions = sessions.filter(
    (s) => s.punchType !== "rest" && s.punchType !== "medical_rest"
  ).length;

  const sessionsThisWeek = sessions.filter((s) => {
    const date = new Date(s.createdAt);
    const now = new Date();
    return (
      now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000 &&
      s.punchType !== "rest" &&
      s.punchType !== "medical_rest"
    );
  }).length;

  const avgDuration =
    sessions.filter((s) => s.duration > 0).length > 0
      ? (
          sessions
            .filter((s) => s.duration > 0)
            .reduce((sum, s) => sum + s.duration, 0) /
          sessions.filter((s) => s.duration > 0).length
        ).toFixed(1)
      : "0";

  const overworkedHorses = horses.filter((h) => calculateWorkload(h).warning);

  const isStudent = profile?.role === "student";
  const isOwner = profile?.role === "owner";
  const isGuardian = profile?.role === "guardian";

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
  const upcomingBookingsPreview = upcomingBookings.slice(0, 5);

  const glanceItems: GlanceItem[] = isStudent
    ? [
        {
          label: t("dashboard.glanceUpcomingLessons"),
          value: upcomingBookings.length,
          href: "/dashboard/bookings",
        },
        {
          label: t("dashboard.statSessionsThisWeek"),
          value: sessionsThisWeek,
          href: "/dashboard/training-history",
        },
        {
          label: t("dashboard.statAssignedHorses"),
          value: horses.length,
          href: "/dashboard/my-horses",
        },
      ]
    : [
        {
          label: t("dashboard.statSessionsThisWeek"),
          value: sessionsThisWeek,
          href: "/dashboard/schedule",
        },
        {
          label: t("dashboard.glanceUpcomingBookings"),
          value: upcomingBookings.length,
          href: "/dashboard/bookings",
        },
        {
          label: t("dashboard.glancePendingApprovals"),
          value: pendingBookings.length,
          href: "/dashboard/bookings",
          highlight: pendingBookings.length > 0,
        },
        {
          label: t("dashboard.glanceOverdueCare"),
          value: overdueCareCount,
          href: "/dashboard/horses",
          highlight: overdueCareCount > 0,
        },
        {
          label: t("dashboard.glanceOverworkedHorses"),
          value: overworkedHorses.length,
          href: "/dashboard/schedule",
          highlight: overworkedHorses.length > 0,
        },
      ];

  const staffQuickActions: QuickAction[] = [
    ...(pendingBookings.length > 0
      ? [
          {
            label: t("dashboard.actionReviewPending"),
            href: "/dashboard/bookings",
            variant: "primary" as const,
            badge: pendingBookings.length,
            description: t("dashboard.actionReviewPendingDesc"),
          },
        ]
      : []),
    ...(overdueCareCount > 0
      ? [
          {
            label: t("dashboard.actionCareDue"),
            href: careReminders.find((r) => r.overdue)
              ? `/dashboard/horses/${careReminders.find((r) => r.overdue)!.horseId}`
              : "/dashboard/horses",
            variant: pendingBookings.length === 0 ? ("primary" as const) : ("secondary" as const),
            badge: overdueCareCount,
            description: t("dashboard.actionCareDueDesc"),
          },
        ]
      : []),
    {
      label: t("dashboard.addHorse"),
      href: "/dashboard/horses?add=1",
      variant:
        pendingBookings.length === 0 && overdueCareCount === 0
          ? ("primary" as const)
          : ("secondary" as const),
    },
    {
      label: t("dashboard.logTrainingSession"),
      href: "/dashboard/horses",
      variant: "secondary" as const,
    },
    {
      label: t("dashboard.viewSchedule"),
      href: "/dashboard/schedule",
      variant: "secondary" as const,
    },
  ];

  const tourSteps: GuidedTourStep[] = isStudent
    ? [
        {
          id: "notif",
          title: t("tour.student.notifTitle"),
          description: t("tour.student.notifDesc"),
          selector: '[data-tour="notification-bell"]',
        },
        {
          id: "upcoming",
          title: t("tour.student.upcomingTitle"),
          description: t("tour.student.upcomingDesc"),
          selector: '[data-tour="upcoming-lessons"]',
        },
        {
          id: "stats",
          title: t("tour.student.statsTitle"),
          description: t("tour.student.statsDesc"),
          selector: '[data-tour="stats-grid"]',
        },
        {
          id: "recent",
          title: t("tour.student.recentTitle"),
          description: t("tour.student.recentDesc"),
          selector: '[data-tour="recent-sessions"]',
        },
        {
          id: "links",
          title: t("tour.student.linksTitle"),
          description: t("tour.student.linksDesc"),
          selector: '[data-tour="quick-links"]',
        },
      ]
    : [
        {
          id: "notif",
          title: t("tour.staff.notifTitle"),
          description: t("tour.staff.notifDesc"),
          selector: '[data-tour="notification-bell"]',
        },
        ...(isOwner
          ? [
              {
                id: "invite",
                title: t("tour.staff.inviteTitle"),
                description: t("tour.staff.inviteDesc"),
                selector: '[data-tour="invite-code"]',
              } as GuidedTourStep,
            ]
          : []),
        {
          id: "care",
          title: t("tour.staff.careTitle"),
          description: t("tour.staff.careDesc"),
          selector: '[data-tour="care-reminders"]',
        },
        {
          id: "stats",
          title: t("tour.staff.statsTitle"),
          description: t("tour.staff.statsDesc"),
          selector: '[data-tour="stats-grid"]',
        },
        {
          id: "recent",
          title: t("tour.staff.recentTitle"),
          description: t("tour.staff.recentDesc"),
          selector: '[data-tour="recent-sessions"]',
        },
        {
          id: "actions",
          title: t("tour.staff.actionsTitle"),
          description: t("tour.staff.actionsDesc"),
          selector: '[data-tour="quick-actions"]',
        },
      ];

  if (isGuardian) {
    return (
      <div className="space-y-10">
        <h1 className="font-serif text-3xl md:text-4xl font-normal text-black">
          {t("dashboard.pageTitle")}
        </h1>
        <div className="border border-black/20 p-6">
          <p className="text-black/80 mb-4">
            {t("dashboard.guardianLead")}
          </p>
          <Link
            href="/dashboard/guardian"
            className="inline-block px-4 py-2.5 bg-accent text-white font-medium text-sm uppercase tracking-wider hover:opacity-95 transition"
          >
            {t("dashboard.guardianOpenPortal")}
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-10 w-44" />
        <div className="skeleton h-36" />
        <div className="skeleton h-24" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="skeleton h-24" />
          <div className="skeleton h-24" />
          <div className="skeleton h-24" />
          <div className="skeleton h-24" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <GuidedTourOverlay
        open={showTutorial}
        steps={tourSteps}
        saving={savingTutorial}
        onComplete={finishTutorial}
        onSkip={finishTutorial}
      />

      <h1 className="page-title-enter font-serif text-3xl md:text-4xl font-normal text-black dark:text-white">
        {t("dashboard.pageTitle")}
      </h1>

      {isOwner && <ShareInviteCode stable={inviteStable} />}

      <WeekAtAGlance title={t("dashboard.weekAtAGlance")} items={glanceItems} />

      {/* Student: Upcoming lessons */}
      {isStudent && upcomingBookingsPreview.length > 0 && (
        <div className="border border-black/20 p-6 dark:border-white/20" data-tour="upcoming-lessons">
          <h2 className="font-serif text-lg text-black dark:text-white mb-2">{t("dashboard.upcomingLessons")}</h2>
          <div className="space-y-2">
            {upcomingBookingsPreview.map((b) => (
              <Link
                key={b.id}
                href="/dashboard/bookings"
                className="flex items-center gap-3 border border-black/10 px-4 py-3 hover:border-black/20 transition"
              >
                {b.horse && (
                  <HorseAvatar
                    photoUrl={b.horse.photoUrl}
                    name={b.horse.name}
                    size="sm"
                  />
                )}
                <div>
                  <span className="font-medium text-black">{b.horse?.name ?? t("dashboard.lessonFallback")}</span>
                  <span className="text-black/50 text-sm ml-2">
                    {new Date(b.bookingDate).toLocaleDateString(dateLocale, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    • {String(b.startTime).slice(0, 5)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Care Reminders - trainers/owners only */}
      {!isStudent && careReminders.length > 0 && (
        <div className="border border-black/20 p-6" data-tour="care-reminders">
          <h2 className="font-serif text-lg text-black mb-2 flex items-center gap-2">
            <span>📋</span> {t("dashboard.careRemindersTitle")}
          </h2>
          <p className="text-sm text-black/60 mb-4">
            {t("dashboard.careRemindersSub")}
          </p>
          <ul className="space-y-2">
            {careReminders.map((r) => (
              <li key={r.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm">
                <Link
                  href={`/dashboard/horses/${r.horseId}`}
                  className="text-black hover:underline flex items-center gap-2 min-w-0"
                >
                  {r.horseName}
                  <span className="text-black/50 shrink-0">— {r.typeLabel}</span>
                </Link>
                <span
                  className={
                    r.overdue
                      ? "text-amber-400 font-medium"
                      : "text-black/50"
                  }
                >
                  {r.overdue ? t("dashboard.overduePrefix") : ""}
                  {new Date(r.nextDue).toLocaleDateString(dateLocale, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Workload Alerts - trainers/owners only */}
      {!isStudent && overworkedHorses.length > 0 && (
        <div className="border border-black/20 p-6">
          <h2 className="font-serif text-lg text-black mb-2 flex items-center gap-2">
            <span>⚠</span> {t("dashboard.workloadAlertsTitle")}
          </h2>
          <p className="text-sm text-black/60 mb-4">
            {t("dashboard.workloadAlertsSub")}
          </p>
          <ul className="space-y-2">
            {overworkedHorses.map((h) => {
              const w = calculateWorkload(h);
              return (
                <li key={h.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm">
                  <Link
                    href={`/dashboard/horses/${h.id}`}
                    className="text-black hover:underline"
                  >
                    {h.name}
                  </Link>
                  <span className="text-black/50 shrink-0">
                    {t("dashboard.workloadWeekSummary", {
                      count: String(w.sessionsCount),
                      minutes: String(w.totalMinutes),
                    })}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-tour="stats-grid">
        {isStudent ? (
          <>
            <StatCard title={t("dashboard.statAssignedHorses")} value={horses.length} index={0} />
            <StatCard title={t("dashboard.statUpcomingLessons")} value={upcomingBookings.length} index={1} />
          </>
        ) : (
          <>
            <StatCard title={t("dashboard.statTotalHorses")} value={horses.length} index={0} />
            <StatCard title={t("dashboard.statTotalSessions")} value={totalSessions} index={1} />
            <StatCard title={t("dashboard.statSessionsThisWeek")} value={sessionsThisWeek} index={2} />
            <StatCard title={t("dashboard.statAvgDuration")} value={avgDuration} index={3} />
          </>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="border border-black/10 p-6" data-tour="recent-sessions">
          <h2 className="font-serif text-lg text-black mb-4">
            {isStudent ? t("dashboard.recentMySessions") : t("dashboard.recentSessions")}
          </h2>
          <div className="space-y-3">
            {sessions.slice(0, 5).map((session) => (
              <div
                key={session.id}
                className="flex justify-between items-center border border-black/10 px-4 py-3"
              >
                <div>
                  <span className="font-medium text-black">{session.horse?.name}</span>
                  <span className="text-black/50 text-sm ml-2">
                    {punchLabel(session.punchType)}
                  </span>
                </div>
                <span className="text-black/50 text-sm">
                  {session.duration > 0
                    ? `${session.duration} ${t("dashboard.minShort")}`
                    : t("dashboard.restSession")}
                </span>
              </div>
            ))}
            {sessions.length === 0 && (
              <p className="text-black/50 text-sm">{t("dashboard.noSessionsYet")}</p>
            )}
          </div>
        </div>

        {!isStudent && (
          <SmartQuickActions title={t("dashboard.quickActions")} actions={staffQuickActions} />
        )}
        {isStudent && (
          <div className="border border-black/10 p-6" data-tour="quick-links">
            <h2 className="font-serif text-lg text-black mb-4">{t("dashboard.quickLinks")}</h2>
            <div className="space-y-3">
              <Link
                href="/dashboard/my-horses"
                className="block w-full px-4 py-3 border border-black/10 text-black font-medium text-center text-sm uppercase tracking-wider hover:border-black/30 transition"
              >
                {t("navRole.myHorses")}
              </Link>
              <Link
                href="/dashboard/bookings"
                className="block w-full px-4 py-3 border border-black/10 text-black font-medium text-center text-sm uppercase tracking-wider hover:border-black/30 transition"
              >
                {t("navRole.myBookings")}
              </Link>
              <Link
                href="/dashboard/competitions"
                className="block w-full px-4 py-3 border border-black/10 text-black font-medium text-center text-sm uppercase tracking-wider hover:border-black/30 transition"
              >
                {t("navRole.competitions")}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
