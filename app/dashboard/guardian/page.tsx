"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HorseAvatar } from "@/components/HorseAvatar";

interface Child {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  level: string | null;
  goals: string | null;
}

interface Booking {
  id: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: string;
  horse: { id: string; name: string; photoUrl?: string | null } | null;
  rider: { id: string; name: string } | null;
}

interface Session {
  id: string;
  punchType: string;
  duration: number;
  punchDate: string;
  horse: { id: string; name: string } | null;
}

const PUNCH_LABELS: Record<string, string> = {
  training: "Training",
  lesson: "Lesson",
  free_ride: "Free Ride",
  competition: "Competition",
  rest: "Rest",
  medical_rest: "Medical Rest",
};

export default function GuardianPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [sessionsByRider, setSessionsByRider] = useState<Record<string, Session[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/guardian/children").then((r) => r.json()),
      fetch("/api/bookings").then((r) => r.json()),
    ])
      .then(([childrenData, bookingsData]) => {
        setChildren(Array.isArray(childrenData) ? childrenData : []);
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);

        const riderIds = (Array.isArray(childrenData) ? childrenData : []).map(
          (c: Child) => c.id
        );
        return Promise.all(
          riderIds.map((id: string) =>
            fetch(`/api/riders/${id}/sessions`)
              .then((r) => r.json())
              .then((sessions) => ({ id, sessions: Array.isArray(sessions) ? sessions : [] }))
          )
        );
      })
      .then((results) => {
        const map: Record<string, Session[]> = {};
        results.forEach(({ id, sessions }) => {
          map[id] = sessions.slice(0, 5);
        });
        setSessionsByRider(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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

  const now = new Date();
  const upcomingBookings = bookings.filter(
    (b) =>
      ["scheduled", "pending"].includes(b.status) &&
      new Date(b.bookingDate) >= new Date(now.toDateString())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-white/50">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-3xl md:text-4xl font-normal text-white">
          Parent Portal
        </h1>
        <p className="text-white/60 text-sm max-w-xl mt-2">
          View your children&apos;s lessons and training progress. Read-only access.
        </p>
      </div>

      {children.length === 0 ? (
        <div className="border border-white/10 p-8 text-center">
          <p className="text-white/60 mb-2">No children linked yet</p>
          <p className="text-white/40 text-sm">
            Ask your stable to link your account to your child&apos;s rider profile.
          </p>
        </div>
      ) : (
        <>
          <div className="border border-white/10 p-6">
            <h2 className="font-serif text-lg text-white mb-4">My Children</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {children.map((child) => (
                <div
                  key={child.id}
                  className="border border-white/10 p-4"
                >
                  <h3 className="font-medium text-white">{child.name}</h3>
                  <p className="text-white/50 text-sm mt-1">
                    {child.level || "—"} • {child.email || child.phone || "No contact"}
                  </p>
                  {sessionsByRider[child.id]?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-white/40 text-xs uppercase tracking-wider mb-2">
                        Recent sessions
                      </p>
                      <ul className="space-y-1">
                        {sessionsByRider[child.id].map((s) => (
                          <li
                            key={s.id}
                            className="text-sm text-white/70"
                          >
                            {formatDate(s.punchDate)} • {PUNCH_LABELS[s.punchType] || s.punchType}{" "}
                            {s.duration > 0 && `(${s.duration} min)`}{" "}
                            {s.horse && `on ${s.horse.name}`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {upcomingBookings.length > 0 && (
            <div className="border border-white/10 p-6">
              <h2 className="font-serif text-lg text-white mb-4">
                Upcoming Lessons
              </h2>
              <div className="space-y-3">
                {upcomingBookings
                  .sort(
                    (a, b) =>
                      new Date(a.bookingDate).getTime() -
                      new Date(b.bookingDate).getTime()
                  )
                  .map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center gap-4 border border-white/10 px-4 py-3"
                    >
                      {b.horse && (
                        <HorseAvatar
                          photoUrl={b.horse.photoUrl}
                          name={b.horse.name}
                          size="sm"
                        />
                      )}
                      <div>
                        <span className="font-medium text-white">
                          {b.horse?.name ?? "Lesson"}
                        </span>
                        <span className="text-white/50 text-sm ml-2">
                          {formatDate(b.bookingDate)} •{" "}
                          {formatTime(b.startTime)}–{formatTime(b.endTime)}
                        </span>
                        {b.rider && (
                          <span className="text-white/40 text-xs block">
                            {b.rider.name}
                          </span>
                        )}
                        {b.status === "pending" && (
                          <span className="text-white/60 text-xs block">
                            Pending approval
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
