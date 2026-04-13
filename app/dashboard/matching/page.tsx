"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProfile } from "@/components/providers/ProfileProvider";
import TableSkeleton from "@/components/ui/TableSkeleton";
import GuidedTourOverlay, { type GuidedTourStep } from "@/components/dashboard/GuidedTourOverlay";
import { usePageTour } from "@/components/dashboard/usePageTour";
import { useLanguage } from "@/components/providers/LanguageProvider";

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

const btnPrimary = "px-4 py-2.5 bg-accent text-white font-medium text-sm uppercase tracking-wider hover:opacity-95 transition";

function ScoreBadge({ score, label }: { score: number; label: string }) {
  const color =
    score >= 80 ? "border-black/30 text-black" :
    score >= 60 ? "border-black/20 text-black/80" :
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
  const { t } = useLanguage();
  const [data, setData] = useState<MatchingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [activeTab, setActiveTab] = useState<"riders" | "horses">("riders");
  const { open: showTour, complete: completeTour } = usePageTour(
    "saddleup_tour_matching_v1",
    !loading && !locked && Boolean(data)
  );

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
      <div className="space-y-6">
        <h1 className="font-serif text-2xl md:text-3xl font-normal text-black">
          {t("dashboard.matchingPageTitle")}
        </h1>
        <TableSkeleton rows={6} cols={4} />
      </div>
    );
  }

  if (locked) {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-2xl md:text-3xl font-normal text-black">
          {t("dashboard.matchingPageTitle")}
        </h1>
        <div className="border border-black/10 p-8 text-center">
          <p className="text-black/70 mb-4">
            {t("dashboard.matchingLockedLead")}
          </p>
          <Link href="/dashboard/settings" className={btnPrimary}>
            {t("dashboard.upgradePlanCta")}
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-2xl md:text-3xl font-normal text-black">
          {t("dashboard.matchingPageTitle")}
        </h1>
        <p className="text-black/50">{t("dashboard.matchingLoadFailed")}</p>
      </div>
    );
  }

  const tourSteps: GuidedTourStep[] = [
    {
      id: "tabs",
      title: t("dashboard.matchingTourTabsTitle"),
      description: t("dashboard.matchingTourTabsDesc"),
      selector: '[data-tour="matching-tabs"]',
    },
    {
      id: "list",
      title: t("dashboard.matchingTourListTitle"),
      description: t("dashboard.matchingTourListDesc"),
      selector: '[data-tour="matching-list"]',
    },
  ];

  return (
    <div className="space-y-8">
      <GuidedTourOverlay
        open={showTour}
        steps={tourSteps}
        onSkip={completeTour}
        onComplete={completeTour}
      />
      <h1 className="font-serif text-2xl md:text-3xl font-normal text-black">
        {t("dashboard.matchingPageTitle")}
      </h1>
      <p className="text-black/60 text-sm max-w-xl">
        {t("dashboard.matchingLead")}
      </p>

      <nav className="flex gap-2 border-b border-black/10 pb-2" data-tour="matching-tabs">
        <button
          onClick={() => setActiveTab("riders")}
          className={`px-4 py-2 text-sm font-medium uppercase tracking-wider transition ${
            activeTab === "riders"
              ? "text-black border-b-2 border-black -mb-[10px] pb-2"
              : "text-black/50 hover:text-black"
          }`}
        >
          {t("dashboard.matchingTabRiders")}
        </button>
        <button
          onClick={() => setActiveTab("horses")}
          className={`px-4 py-2 text-sm font-medium uppercase tracking-wider transition ${
            activeTab === "horses"
              ? "text-black border-b-2 border-black -mb-[10px] pb-2"
              : "text-black/50 hover:text-black"
          }`}
        >
          {t("dashboard.matchingTabHorses")}
        </button>
      </nav>

      {activeTab === "riders" && (
        <div className="space-y-6" data-tour="matching-list">
          <h2 className="font-serif text-lg text-black">{t("dashboard.matchingRidersSection")}</h2>
          {data.riderSuggestions.length === 0 ? (
            <p className="text-black/50">{t("dashboard.matchingEmptyAddBoth")}</p>
          ) : (
            <div className="space-y-4">
              {data.riderSuggestions.map((r) => (
                <div key={r.riderId} className="border border-black/10 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Link
                      href={`/dashboard/team/riders/${r.riderId}`}
                      className="font-serif text-lg text-black hover:underline"
                    >
                      {r.riderName}
                    </Link>
                    <span className="text-black/50 text-sm capitalize">{r.riderLevel || "—"}</span>
                  </div>
                  {r.assigned.length > 0 && (
                    <div className="mb-4">
                      <p className="text-black/50 text-xs uppercase tracking-widest mb-2">{t("dashboard.matchingAssigned")}</p>
                      <div className="flex flex-wrap gap-2">
                        {r.assigned.map((a) => (
                          <Link
                            key={a.horseId}
                            href={`/dashboard/horses/${a.horseId}`}
                            className="px-3 py-1.5 border border-black/20 text-black/80 text-sm hover:border-black/40"
                          >
                            {a.horseName}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  {r.suggested.length > 0 ? (
                    <div>
                      <p className="text-black/50 text-xs uppercase tracking-widest mb-2">{t("dashboard.matchingSuggested")}</p>
                      <div className="space-y-2">
                        {r.suggested.map((s) => (
                          <div
                            key={s.horseId}
                            className="flex items-center justify-between border border-black/10 px-4 py-3"
                          >
                            <Link
                              href={`/dashboard/horses/${s.horseId}`}
                              className="font-medium text-black hover:underline"
                            >
                              {s.horseName}
                            </Link>
                            <div className="flex items-center gap-3">
                              <ScoreBadge score={s.score} label={s.label} />
                              <span className="text-black/50 text-xs max-w-[200px] truncate" title={s.reason}>
                                {s.reason}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-black/50 text-sm">{t("dashboard.matchingAllHorsesAssigned")}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "horses" && (
        <div className="space-y-6" data-tour="matching-list">
          <h2 className="font-serif text-lg text-black">{t("dashboard.matchingHorsesSection")}</h2>
          {data.horseSuggestions.length === 0 ? (
            <p className="text-black/50">{t("dashboard.matchingEmptyAddBothHorses")}</p>
          ) : (
            <div className="space-y-4">
              {data.horseSuggestions.map((h) => (
                <div key={h.horseId} className="border border-black/10 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Link
                      href={`/dashboard/horses/${h.horseId}`}
                      className="font-serif text-lg text-black hover:underline"
                    >
                      {h.horseName}
                    </Link>
                    <span className="text-black/50 text-sm">
                      {[h.horseTemperament, h.horseSkillLevel].filter(Boolean).join(" • ") || "—"}
                    </span>
                  </div>
                  {h.assigned.length > 0 && (
                    <div className="mb-4">
                      <p className="text-black/50 text-xs uppercase tracking-widest mb-2">{t("dashboard.matchingAssignedTo")}</p>
                      <div className="flex flex-wrap gap-2">
                        {h.assigned.map((a) => (
                          <Link
                            key={a.riderId}
                            href={`/dashboard/team/riders/${a.riderId}`}
                            className="px-3 py-1.5 border border-black/20 text-black/80 text-sm hover:border-black/40"
                          >
                            {a.riderName}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  {h.suggested.length > 0 ? (
                    <div>
                      <p className="text-black/50 text-xs uppercase tracking-widest mb-2">{t("dashboard.matchingSuggestedRidersLabel")}</p>
                      <div className="space-y-2">
                        {h.suggested.map((s) => (
                          <div
                            key={s.riderId}
                            className="flex items-center justify-between border border-black/10 px-4 py-3"
                          >
                            <Link
                              href={`/dashboard/team/riders/${s.riderId}`}
                              className="font-medium text-black hover:underline"
                            >
                              {s.riderName}
                            </Link>
                            <div className="flex items-center gap-3">
                              <span className="text-black/50 text-xs capitalize">{s.riderLevel || "—"}</span>
                              <ScoreBadge score={s.score} label={s.label} />
                              <span className="text-black/50 text-xs max-w-[200px] truncate" title={s.reason}>
                                {s.reason}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-black/50 text-sm">{t("dashboard.matchingAllRidersAssigned")}</p>
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
