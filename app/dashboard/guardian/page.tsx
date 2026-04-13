"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HorseAvatar } from "@/components/HorseAvatar";
import TableSkeleton from "@/components/ui/TableSkeleton";
import { useLanguage } from "@/components/providers/LanguageProvider";

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

export default function GuardianPage() {
  const { t, lang } = useLanguage();
  const dateLocale = lang === "ar" ? "ar-SA" : "en-US";
  const [children, setChildren] = useState<Child[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [sessionsByRider, setSessionsByRider] = useState<Record<string, Session[]>>({});
  const [loading, setLoading] = useState(true);

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
    new Date(d).toLocaleDateString(dateLocale, {
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
      <div className="space-y-6">
        <h1 className="font-serif text-3xl md:text-4xl font-normal text-black">
          {t("dashboard.guardianTitle")}
        </h1>
        <TableSkeleton rows={6} cols={4} />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-3xl md:text-4xl font-normal text-black">
          {t("dashboard.guardianTitle")}
        </h1>
        <p className="text-black/60 text-sm max-w-xl mt-2">
          {t("dashboard.guardianPortalLead")}
        </p>
      </div>

      {children.length === 0 ? (
        <div className="border border-black/10 p-8 text-center">
          <p className="text-black/60 mb-2">{t("dashboard.guardianNoChildrenTitle")}</p>
          <p className="text-black/40 text-sm">
            {t("dashboard.guardianNoChildrenBody")}
          </p>
        </div>
      ) : (
        <>
          <div className="border border-black/10 p-6">
            <h2 className="font-serif text-lg text-black mb-4">{t("dashboard.guardianMyChildren")}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {children.map((child) => (
                <div
                  key={child.id}
                  className="border border-black/10 p-4"
                >
                  <h3 className="font-medium text-black">{child.name}</h3>
                  <p className="text-black/50 text-sm mt-1">
                    {child.level || "—"} • {child.email || child.phone || t("dashboard.riderDetailNoContact")}
                  </p>
                  {sessionsByRider[child.id]?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-black/40 text-xs uppercase tracking-wider mb-2">
                        {t("dashboard.guardianRecentSessions")}
                      </p>
                      <ul className="space-y-1">
                        {sessionsByRider[child.id].map((s) => (
                          <li
                            key={s.id}
                            className="text-sm text-black/70"
                          >
                            {formatDate(s.punchDate)} • {punchLabel(s.punchType)}{" "}
                            {s.duration > 0 &&
                              t("dashboard.guardianSessionMinutes", { minutes: String(s.duration) })}{" "}
                            {s.horse &&
                              t("dashboard.guardianSessionOnHorse", { horse: s.horse.name })}
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
            <div className="border border-black/10 p-6">
              <h2 className="font-serif text-lg text-black mb-4">
                {t("dashboard.guardianUpcomingLessons")}
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
                      className="flex items-center gap-4 border border-black/10 px-4 py-3"
                    >
                      {b.horse && (
                        <HorseAvatar
                          photoUrl={b.horse.photoUrl}
                          name={b.horse.name}
                          size="sm"
                        />
                      )}
                      <div>
                        <span className="font-medium text-black">
                          {b.horse?.name ?? t("dashboard.guardianLessonFallback")}
                        </span>
                        <span className="text-black/50 text-sm ml-2">
                          {formatDate(b.bookingDate)} •{" "}
                          {formatTime(b.startTime)}–{formatTime(b.endTime)}
                        </span>
                        {b.rider && (
                          <span className="text-black/40 text-xs block">
                            {b.rider.name}
                          </span>
                        )}
                        {b.status === "pending" && (
                          <span className="text-black/60 text-xs block">
                            {t("dashboard.bookingsPendingApproval")}
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
