"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HorseAvatar } from "@/components/HorseAvatar";
import { useProfile } from "@/components/providers/ProfileProvider";
import { useRouter } from "next/navigation";
import TableSkeleton from "@/components/ui/TableSkeleton";

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

const PUNCH_LABELS: Record<string, string> = {
  training: "Training",
  lesson: "Lesson",
  free_ride: "Free Ride",
  competition: "Competition",
  rest: "Rest",
  medical_rest: "Medical Rest",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function TrainingHistoryPage() {
  const router = useRouter();
  const { profile } = useProfile();
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
        Training History
      </h1>
      <p className="text-black/60 text-sm max-w-xl">
        Sessions logged by your trainer for horses you&apos;re assigned to.
      </p>

      {loading ? (
        <TableSkeleton rows={6} cols={4} showBottomBar={false} />
      ) : sortedSessions.length === 0 ? (
        <div className="border border-black/10 p-8 text-center">
          <p className="text-black/60 mb-2">No training sessions yet</p>
          <p className="text-black/40 text-sm">
            When your trainer logs sessions for your horses, they&apos;ll appear here.
          </p>
          <Link
            href="/dashboard/my-horses"
            className="inline-block mt-4 text-black/60 hover:text-black text-sm uppercase tracking-wider"
          >
            View My Horses →
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
                    {PUNCH_LABELS[s.punchType] || s.punchType}
                    {s.duration > 0 && ` • ${s.duration} min`}
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
