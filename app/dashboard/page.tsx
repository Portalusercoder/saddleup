"use client";

import { useEffect, useState } from "react";
import { useProfile } from "@/components/providers/ProfileProvider";
import Link from "next/link";
import ShareInviteCode from "@/components/dashboard/ShareInviteCode";
import { HorseAvatar } from "@/components/HorseAvatar";

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
  const [bookings, setBookings] = useState<
    { id: string; bookingDate: string; startTime: string; status?: string; horse?: { name: string; photoUrl?: string | null } }[]
  >([]);
  const [careReminders, setCareReminders] = useState<
    { id: string; typeLabel: string; nextDue: string; horseName: string; horseId: string; overdue: boolean }[]
  >([]);
  const { profile } = useProfile();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [horsesRes, sessionsRes, bookingsRes, careRes] = await Promise.all([
      fetch("/api/horses"),
      fetch("/api/sessions"),
      fetch("/api/bookings").catch(() => ({ json: async () => [] })),
      fetch("/api/care-reminders").catch(() => ({ json: async () => [] })),
    ]);
    const bookingsData = await bookingsRes.json();
    const careData = await careRes.json();
    setHorses(await horsesRes.json());
    setSessions(await sessionsRes.json());
    setBookings(Array.isArray(bookingsData) ? bookingsData : []);
    setCareReminders(Array.isArray(careData) ? careData : []);
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

  return (
    <div className="space-y-10">
      <h1 className="font-serif text-3xl md:text-4xl font-normal text-black">
        Dashboard
      </h1>

      {isOwner && <ShareInviteCode />}

      {/* Student: Upcoming lessons */}
      {isStudent && upcomingBookings.length > 0 && (
        <div className="border border-black/20 p-6">
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
        <div className="border border-black/20 p-6">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <div className="border border-black/10 p-6">
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
          <div className="border border-black/10 p-6">
            <h2 className="font-serif text-lg text-black mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href="/dashboard/horses?add=1"
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
          <div className="border border-black/10 p-6">
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
