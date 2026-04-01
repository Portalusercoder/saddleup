"use client";

import { useEffect, useState } from "react";
import { useProfile } from "@/components/providers/ProfileProvider";
import Link from "next/link";
import ShareInviteCode from "@/components/dashboard/ShareInviteCode";
import { HorseAvatar } from "@/components/HorseAvatar";
import GuidedTourOverlay, {
  type GuidedTourStep,
} from "@/components/dashboard/GuidedTourOverlay";

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

const PUNCH_LABELS: Record<string, string> = {
  training: "Training",
  lesson: "Lesson",
  free_ride: "Free Ride",
  competition: "Competition",
  rest: "Rest",
  medical_rest: "Medical Rest",
};

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
                  : "Your Stable",
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
      new Date(b.bookingDate) >= new Date(new Date().toDateString())
  ).slice(0, 5);

  const tourSteps: GuidedTourStep[] = isStudent
    ? [
        {
          id: "notif",
          title: "Notifications",
          description: "Tap the bell to see booking updates and reminders.",
          selector: '[aria-label="Notifications"]',
        },
        {
          id: "upcoming",
          title: "Upcoming Lessons",
          description: "Track your next sessions and stay ready.",
          selector: '[data-tour="upcoming-lessons"]',
        },
        {
          id: "stats",
          title: "Your Stats",
          description: "Quick view of assigned horses and upcoming lessons.",
          selector: '[data-tour="stats-grid"]',
        },
        {
          id: "recent",
          title: "Recent Sessions",
          description: "See your latest training activity here.",
          selector: '[data-tour="recent-sessions"]',
        },
        {
          id: "links",
          title: "Quick Links",
          description: "Jump to horses, bookings, and competitions in one tap.",
          selector: '[data-tour="quick-links"]',
        },
      ]
    : [
        {
          id: "notif",
          title: "Notifications",
          description: "Tap the bell to review booking updates and reminders.",
          selector: '[aria-label="Notifications"]',
        },
        ...(isOwner
          ? [
              {
                id: "invite",
                title: "Invite Your Team",
                description: "Share this code so trainers and students can join your stable.",
                selector: '[data-tour="invite-code"]',
              } as GuidedTourStep,
            ]
          : []),
        {
          id: "care",
          title: "Care Reminders",
          description: "Upcoming care reminders help you stay ahead of horse health tasks.",
          selector: '[data-tour="care-reminders"]',
        },
        {
          id: "stats",
          title: "Stable Stats",
          description: "See total horses, sessions, and weekly performance at a glance.",
          selector: '[data-tour="stats-grid"]',
        },
        {
          id: "recent",
          title: "Recent Sessions",
          description: "Review latest training entries quickly.",
          selector: '[data-tour="recent-sessions"]',
        },
        {
          id: "actions",
          title: "Quick Actions",
          description: "Add horses, log sessions, and manage your schedule from here.",
          selector: '[data-tour="quick-actions"]',
        },
      ];

  if (isGuardian) {
    return (
      <div className="space-y-10">
        <h1 className="font-serif text-3xl md:text-4xl font-normal text-black">
          Dashboard
        </h1>
        <div className="border border-black/20 p-6">
          <p className="text-black/80 mb-4">
            View your children&apos;s lessons and training progress in the Parent Portal.
          </p>
          <Link
            href="/dashboard/guardian"
            className="inline-block px-4 py-2.5 bg-accent text-white font-medium text-sm uppercase tracking-wider hover:opacity-95 transition"
          >
            Open Parent Portal
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-44 border border-black/10" />
        <div className="h-36 border border-black/10" />
        <div className="h-24 border border-black/10" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-24 border border-black/10" />
          <div className="h-24 border border-black/10" />
          <div className="h-24 border border-black/10" />
          <div className="h-24 border border-black/10" />
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

      <h1 className="font-serif text-3xl md:text-4xl font-normal text-black">
        Dashboard
      </h1>

      {isOwner && <ShareInviteCode stable={inviteStable} />}

      {/* Student: Upcoming lessons */}
      {isStudent && upcomingBookings.length > 0 && (
        <div className="border border-black/20 p-6" data-tour="upcoming-lessons">
          <h2 className="font-serif text-lg text-black mb-2">Upcoming Lessons</h2>
          <div className="space-y-2">
            {upcomingBookings.map((b) => (
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
                  <span className="font-medium text-black">{b.horse?.name ?? "Lesson"}</span>
                  <span className="text-black/50 text-sm ml-2">
                    {new Date(b.bookingDate).toLocaleDateString("en-US", {
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
            <span>📋</span> Upcoming Care Reminders
          </h2>
          <p className="text-sm text-black/60 mb-4">
            Vaccinations, farrier, and other care due in the next 30 days.
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
                  {r.overdue ? "Overdue • " : ""}
                  {new Date(r.nextDue).toLocaleDateString("en-US", {
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
            <span>⚠</span> Horse Workload Alerts
          </h2>
          <p className="text-sm text-black/60 mb-4">
            These horses may need a rest day based on recent activity.
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
                    {w.sessionsCount} sessions, {w.totalMinutes} min this week
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
            <StatCard title="Assigned Horses" value={horses.length} />
            <StatCard title="Upcoming Lessons" value={upcomingBookings.length} />
          </>
        ) : (
          <>
            <StatCard title="Total Horses" value={horses.length} />
            <StatCard title="Total Sessions" value={totalSessions} />
            <StatCard title="Sessions This Week" value={sessionsThisWeek} />
            <StatCard title="Avg Duration (min)" value={avgDuration} />
          </>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="border border-black/10 p-6" data-tour="recent-sessions">
          <h2 className="font-serif text-lg text-black mb-4">
            {isStudent ? "My Recent Sessions" : "Recent Sessions"}
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
                    {PUNCH_LABELS[session.punchType] || session.punchType}
                  </span>
                </div>
                <span className="text-black/50 text-sm">
                  {session.duration > 0 ? `${session.duration} min` : "Rest"}
                </span>
              </div>
            ))}
            {sessions.length === 0 && (
              <p className="text-black/50 text-sm">No sessions yet</p>
            )}
          </div>
        </div>

        {!isStudent && (
          <div className="border border-black/10 p-6" data-tour="quick-actions">
            <h2 className="font-serif text-lg text-black mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href="/dashboard/horses?add=1"
                data-tour="add-horse-button"
                className="block w-full px-4 py-3 bg-accent text-white font-medium text-center text-sm uppercase tracking-wider hover:opacity-95 transition"
              >
                + Add Horse
              </Link>
              <Link
                href="/dashboard/horses"
                className="block w-full px-4 py-3 border border-black/10 text-black font-medium text-center text-sm uppercase tracking-wider hover:border-black/30 transition"
              >
                Log Training Session
              </Link>
              <Link
                href="/dashboard/schedule"
                className="block w-full px-4 py-3 border border-black/10 text-black font-medium text-center text-sm uppercase tracking-wider hover:border-black/30 transition"
              >
                View Schedule
              </Link>
            </div>
          </div>
        )}
        {isStudent && (
          <div className="border border-black/10 p-6" data-tour="quick-links">
            <h2 className="font-serif text-lg text-black mb-4">Quick Links</h2>
            <div className="space-y-3">
              <Link
                href="/dashboard/my-horses"
                className="block w-full px-4 py-3 border border-black/10 text-black font-medium text-center text-sm uppercase tracking-wider hover:border-black/30 transition"
              >
                My Horses
              </Link>
              <Link
                href="/dashboard/bookings"
                className="block w-full px-4 py-3 border border-black/10 text-black font-medium text-center text-sm uppercase tracking-wider hover:border-black/30 transition"
              >
                My Bookings
              </Link>
              <Link
                href="/dashboard/competitions"
                className="block w-full px-4 py-3 border border-black/10 text-black font-medium text-center text-sm uppercase tracking-wider hover:border-black/30 transition"
              >
                Competitions
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="border border-black/10 p-6">
      <p className="text-black/50 text-xs uppercase tracking-widest">{title}</p>
      <p className="font-serif text-2xl text-black mt-2">{value}</p>
    </div>
  );
}
