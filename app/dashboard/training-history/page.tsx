"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HorseAvatar } from "@/components/HorseAvatar";
import { useProfile } from "@/components/providers/ProfileProvider";
import { useRouter } from "next/navigation";
import TableSkeleton from "@/components/ui/TableSkeleton";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface Session {
  id: string;
  punchType: string;
  duration: number;
  intensity?: string;
  discipline?: string;
  rider?: string;
  createdAt: string;
}

interface Horse {
  id: string | number;
  name: string;
  photoUrl?: string | null;
  sessions: Session[];
}

export default function TrainingHistoryPage() {
  const router = useRouter();
  const { profile } = useProfile();
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
      year: "numeric",
    });
  const [horses, setHorses] = useState<Horse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.role !== "student") {
      router.replace("/dashboard");
      return;
    }
    fetch("/api/horses")
      .then((r) => r.json())
      .then((data) => setHorses(Array.isArray(data) ? data : []))
      .catch(() => setHorses([]))
      .finally(() => setLoading(false));
  }, [profile?.role, router]);

  const allSessions = horses.flatMap((h) =>
    (h.sessions || []).map((s) => ({
      ...s,
      horse: { id: h.id, name: h.name, photoUrl: h.photoUrl },
    }))
  );

  const sortedSessions = [...allSessions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (profile?.role !== "student") {
    return null;
  }

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-3xl md:text-4xl font-normal text-black">
        {t("dashboard.trainingHistoryTitle")}
      </h1>
      <p className="text-black/60 text-sm max-w-xl">
        {t("dashboard.trainingHistoryIntro")}
      </p>

      {loading ? (
        <TableSkeleton rows={6} cols={4} showBottomBar={false} />
      ) : sortedSessions.length === 0 ? (
        <div className="border border-black/10 p-8 text-center">
          <p className="text-black/60 mb-2">{t("dashboard.trainingHistoryEmptyTitle")}</p>
          <p className="text-black/40 text-sm">
            {t("dashboard.trainingHistoryEmptyBody")}
          </p>
          <Link
            href="/dashboard/my-horses"
            className="inline-block mt-4 text-black/60 hover:text-black text-sm uppercase tracking-wider"
          >
            {t("dashboard.trainingHistoryViewMyHorses")}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedSessions.map((s) => (
            <Link
              key={s.id}
              href={`/dashboard/horses/${s.horse.id}`}
              className="block border border-black/10 p-4 hover:border-black/20 transition"
            >
              <div className="flex items-center gap-4">
                <HorseAvatar
                  photoUrl={s.horse.photoUrl}
                  name={s.horse.name}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-black">{s.horse.name}</p>
                  <p className="text-black/60 text-sm mt-0.5">
                    {punchLabel(s.punchType)}
                    {s.duration > 0 &&
                      ` • ${t("dashboard.trainingHistoryDurationMin", { minutes: String(s.duration) })}`}
                    {s.rider && ` • ${s.rider}`}
                    {s.discipline && ` • ${s.discipline}`}
                  </p>
                </div>
                <span className="text-black/50 text-sm whitespace-nowrap">
                  {formatDate(s.createdAt)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
