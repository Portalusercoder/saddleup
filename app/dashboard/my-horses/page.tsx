"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HorseAvatar } from "@/components/HorseAvatar";
import TableSkeleton from "@/components/ui/TableSkeleton";

interface Session {
  id: number;
  duration: number;
  intensity: string;
  punchType?: string;
  createdAt: string;
}

interface Horse {
  id: string | number;
  name: string;
  gender: string;
  age: number | null;
  breed: string | null;
  temperament?: string | null;
  skillLevel?: string | null;
  photoUrl?: string | null;
  ridingSuitability?: string | null;
  sessions: Session[];
}

export default function MyHorsesPage() {
  const [horses, setHorses] = useState<Horse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/horses")
      .then((r) => r.json())
      .then((data) => {
        setHorses(Array.isArray(data) ? data : []);
      })
      .catch(() => setHorses([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-3xl md:text-4xl font-normal text-black">
        My Horses
      </h1>
      <p className="text-black/60 text-sm max-w-xl">
        Horses assigned to you by your trainer.{" "}
        <Link href="/dashboard/training-history" className="text-black/80 hover:text-black underline">
          View training history
        </Link>
      </p>

      {loading ? (
        <TableSkeleton rows={6} cols={3} showBottomBar={false} />
      ) : horses.length === 0 ? (
        <div className="border border-black/10 p-8 text-center">
          <p className="text-black/60 mb-2">No horses assigned yet</p>
          <p className="text-black/40 text-sm">
            Ask your trainer to assign horses to your rider profile.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {horses.map((horse) => (
            <Link
              key={horse.id}
              href={`/dashboard/horses/${horse.id}`}
              className="block border border-black/10 p-6 hover:border-black/20 transition"
            >
              <div className="flex items-start gap-4">
                <HorseAvatar
                  photoUrl={horse.photoUrl}
                  name={horse.name}
                  size="lg"
                />
                <div className="flex-1 min-w-0">
                  <h2 className="font-serif text-lg text-black">{horse.name}</h2>
                  <p className="text-black/60 text-sm mt-1">
                    {horse.breed || horse.gender} {horse.age ? `• ${horse.age}y` : ""}
                  </p>
                  <p className="text-black/50 text-xs mt-2 uppercase tracking-wider">
                    {horse.skillLevel || "—"} • {horse.temperament || "—"}
                  </p>
                  {horse.ridingSuitability && (
                    <p className="text-black/40 text-xs mt-1">
                      Suitability: {horse.ridingSuitability}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
