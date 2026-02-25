"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProfile } from "@/components/providers/ProfileProvider";

interface SuggestedHorse {
  horseId: string;
  horseName: string;
  score: number;
  label: string;
  reason: string;
}

interface RiderSuggestion {
  riderId: string;
  riderName: string;
  riderLevel: string | null;
  assigned: { horseId: string; horseName: string }[];
  suggested: SuggestedHorse[];
}

interface SuggestedRider {
  riderId: string;
  riderName: string;
  riderLevel: string | null;
  score: number;
  label: string;
  reason: string;
}

interface HorseSuggestion {
  horseId: string;
  horseName: string;
  horseTemperament: string | null;
  horseSkillLevel: string | null;
  assigned: { riderId: string; riderName: string }[];
  suggested: SuggestedRider[];
}

interface MatchingData {
  riderSuggestions: RiderSuggestion[];
  horseSuggestions: HorseSuggestion[];
}

const btnPrimary = "px-4 py-2.5 bg-white text-black font-medium text-sm uppercase tracking-wider hover:opacity-95 transition";

function ScoreBadge({ score, label }: { score: number; label: string }) {
  const color =
    score >= 80 ? "border-white/30 text-white" :
    score >= 60 ? "border-white/20 text-white/80" :
    score >= 40 ? "border-amber-500/50 text-amber-400" :
    "border-red-500/30 text-red-400";
  return (
    <span className={`inline-block px-2 py-0.5 border text-xs uppercase tracking-wider ${color}`}>
      {label}
    </span>
  );
}

export default function MatchingPage() {
  const router = useRouter();
  const { profile } = useProfile();
  const [data, setData] = useState<MatchingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [activeTab, setActiveTab] = useState<"riders" | "horses">("riders");

  useEffect(() => {
    if (!profile) return;
    if (profile.role === "student") {
      router.replace("/dashboard");
      return;
    }
    fetch("/api/matching")
      .then((r) => r.json())
      .then((res) => {
        if (res.code === "MATCHING_LOCKED") {
          setLocked(true);
          setData(null);
        } else if (res.error) {
          setData(null);
        } else {
          setData(res);
        }
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [profile, router]);

  if (profile?.role === "student") return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-white/50">Loading matching...</p>
      </div>
    );
  }

  if (locked) {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-2xl md:text-3xl font-normal text-white">
          Horse–rider matching
        </h1>
        <div className="border border-white/10 p-8 text-center">
          <p className="text-white/70 mb-4">
            Upgrade to Stable or Enterprise to get horse–rider compatibility suggestions.
          </p>
          <Link href="/dashboard/settings" className={btnPrimary}>
            Upgrade plan
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-2xl md:text-3xl font-normal text-white">
          Horse–rider matching
        </h1>
        <p className="text-white/50">Failed to load matching.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-2xl md:text-3xl font-normal text-white">
        Horse–rider matching
      </h1>
      <p className="text-white/60 text-sm max-w-xl">
        Compatibility suggestions based on rider level, horse temperament, and skill level. Assign horses from the rider detail page.
      </p>

      <nav className="flex gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab("riders")}
          className={`px-4 py-2 text-sm font-medium uppercase tracking-wider transition ${
            activeTab === "riders"
              ? "text-white border-b-2 border-white -mb-[10px] pb-2"
              : "text-white/50 hover:text-white"
          }`}
        >
          By rider
        </button>
        <button
          onClick={() => setActiveTab("horses")}
          className={`px-4 py-2 text-sm font-medium uppercase tracking-wider transition ${
            activeTab === "horses"
              ? "text-white border-b-2 border-white -mb-[10px] pb-2"
              : "text-white/50 hover:text-white"
          }`}
        >
          By horse
        </button>
      </nav>

      {activeTab === "riders" && (
        <div className="space-y-6">
          <h2 className="font-serif text-lg text-white">Suggested horses for each rider</h2>
          {data.riderSuggestions.length === 0 ? (
            <p className="text-white/50">Add riders and horses to see suggestions.</p>
          ) : (
            <div className="space-y-4">
              {data.riderSuggestions.map((r) => (
                <div key={r.riderId} className="border border-white/10 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Link
                      href={`/dashboard/team/riders/${r.riderId}`}
                      className="font-serif text-lg text-white hover:underline"
                    >
                      {r.riderName}
                    </Link>
                    <span className="text-white/50 text-sm capitalize">{r.riderLevel || "—"}</span>
                  </div>
                  {r.assigned.length > 0 && (
                    <div className="mb-4">
                      <p className="text-white/50 text-xs uppercase tracking-widest mb-2">Assigned</p>
                      <div className="flex flex-wrap gap-2">
                        {r.assigned.map((a) => (
                          <Link
                            key={a.horseId}
                            href={`/dashboard/horses/${a.horseId}`}
                            className="px-3 py-1.5 border border-white/20 text-white/80 text-sm hover:border-white/40"
                          >
                            {a.horseName}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  {r.suggested.length > 0 ? (
                    <div>
                      <p className="text-white/50 text-xs uppercase tracking-widest mb-2">Suggested</p>
                      <div className="space-y-2">
                        {r.suggested.map((s) => (
                          <div
                            key={s.horseId}
                            className="flex items-center justify-between border border-white/10 px-4 py-3"
                          >
                            <Link
                              href={`/dashboard/horses/${s.horseId}`}
                              className="font-medium text-white hover:underline"
                            >
                              {s.horseName}
                            </Link>
                            <div className="flex items-center gap-3">
                              <ScoreBadge score={s.score} label={s.label} />
                              <span className="text-white/50 text-xs max-w-[200px] truncate" title={s.reason}>
                                {s.reason}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-white/50 text-sm">All horses are already assigned to this rider.</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "horses" && (
        <div className="space-y-6">
          <h2 className="font-serif text-lg text-white">Suggested riders for each horse</h2>
          {data.horseSuggestions.length === 0 ? (
            <p className="text-white/50">Add horses and riders to see suggestions.</p>
          ) : (
            <div className="space-y-4">
              {data.horseSuggestions.map((h) => (
                <div key={h.horseId} className="border border-white/10 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Link
                      href={`/dashboard/horses/${h.horseId}`}
                      className="font-serif text-lg text-white hover:underline"
                    >
                      {h.horseName}
                    </Link>
                    <span className="text-white/50 text-sm">
                      {[h.horseTemperament, h.horseSkillLevel].filter(Boolean).join(" • ") || "—"}
                    </span>
                  </div>
                  {h.assigned.length > 0 && (
                    <div className="mb-4">
                      <p className="text-white/50 text-xs uppercase tracking-widest mb-2">Assigned to</p>
                      <div className="flex flex-wrap gap-2">
                        {h.assigned.map((a) => (
                          <Link
                            key={a.riderId}
                            href={`/dashboard/team/riders/${a.riderId}`}
                            className="px-3 py-1.5 border border-white/20 text-white/80 text-sm hover:border-white/40"
                          >
                            {a.riderName}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  {h.suggested.length > 0 ? (
                    <div>
                      <p className="text-white/50 text-xs uppercase tracking-widest mb-2">Suggested riders</p>
                      <div className="space-y-2">
                        {h.suggested.map((s) => (
                          <div
                            key={s.riderId}
                            className="flex items-center justify-between border border-white/10 px-4 py-3"
                          >
                            <Link
                              href={`/dashboard/team/riders/${s.riderId}`}
                              className="font-medium text-white hover:underline"
                            >
                              {s.riderName}
                            </Link>
                            <div className="flex items-center gap-3">
                              <span className="text-white/50 text-xs capitalize">{s.riderLevel || "—"}</span>
                              <ScoreBadge score={s.score} label={s.label} />
                              <span className="text-white/50 text-xs max-w-[200px] truncate" title={s.reason}>
                                {s.reason}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-white/50 text-sm">All riders are already assigned to this horse.</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
