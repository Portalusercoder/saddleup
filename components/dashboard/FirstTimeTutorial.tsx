"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";

type TutorialStep = {
  title: string;
  description: string;
};

interface FirstTimeTutorialProps {
  role: string | undefined;
  open: boolean;
  saving?: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

function getSteps(role: string | undefined, t: (path: string) => string): TutorialStep[] {
  if (role === "owner") {
    return [
      { title: t("dashboard.tutorialOwnerWelcomeTitle"), description: t("dashboard.tutorialOwnerWelcomeDesc") },
      { title: t("dashboard.tutorialOwnerInviteTitle"), description: t("dashboard.tutorialOwnerInviteDesc") },
      { title: t("dashboard.tutorialOwnerHorseTitle"), description: t("dashboard.tutorialOwnerHorseDesc") },
      { title: t("dashboard.tutorialOwnerSessionsTitle"), description: t("dashboard.tutorialOwnerSessionsDesc") },
    ];
  }
  if (role === "trainer") {
    return [
      { title: t("dashboard.tutorialTrainerWelcomeTitle"), description: t("dashboard.tutorialTrainerWelcomeDesc") },
      { title: t("dashboard.tutorialTrainerHorseTitle"), description: t("dashboard.tutorialTrainerHorseDesc") },
      { title: t("dashboard.tutorialTrainerSessionsTitle"), description: t("dashboard.tutorialTrainerSessionsDesc") },
    ];
  }
  if (role === "student") {
    return [
      { title: t("dashboard.tutorialStudentWelcomeTitle"), description: t("dashboard.tutorialStudentWelcomeDesc") },
      { title: t("dashboard.tutorialStudentBookingsTitle"), description: t("dashboard.tutorialStudentBookingsDesc") },
      { title: t("dashboard.tutorialStudentProgressTitle"), description: t("dashboard.tutorialStudentProgressDesc") },
    ];
  }
  return [];
}

export default function FirstTimeTutorial({
  role,
  open,
  saving = false,
  onComplete,
  onSkip,
}: FirstTimeTutorialProps) {
  const { t } = useLanguage();
  const steps = getSteps(role, t);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!open) return;
    setIndex(0);
  }, [open]);

  if (!open || steps.length === 0) return null;

  const current = steps[index];
  const atLast = index === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[80] bg-black/45 flex items-center justify-center p-4">
      <div className="w-full max-w-xl border border-black/20 bg-base text-black p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.25em] text-black/45">
          {t("dashboard.tutorialQuickTour")}
        </p>
        <h2 className="mt-2 font-serif text-2xl sm:text-3xl">{current.title}</h2>
        <p className="mt-4 text-black/70 leading-relaxed">{current.description}</p>

        <div className="mt-6 flex items-center gap-2">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-7 ${i === index ? "bg-accent" : "bg-black/15"}`}
            />
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onSkip}
            disabled={saving}
            className="px-4 py-2.5 border border-black/20 text-sm uppercase tracking-wider hover:border-black/35 transition disabled:opacity-50"
          >
            {t("tour.skip")}
          </button>
          <div className="flex items-center gap-3">
            {index > 0 ? (
              <button
                type="button"
                onClick={() => setIndex((v) => Math.max(0, v - 1))}
                disabled={saving}
                className="px-4 py-2.5 border border-black/20 text-sm uppercase tracking-wider hover:border-black/35 transition disabled:opacity-50"
              >
                {t("tour.back")}
              </button>
            ) : null}
            {atLast ? (
              <button
                type="button"
                onClick={onComplete}
                disabled={saving}
                className="px-4 py-2.5 bg-accent text-white text-sm uppercase tracking-wider hover:opacity-95 transition disabled:opacity-50"
              >
                {saving ? t("tour.saving") : t("tour.finish")}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIndex((v) => Math.min(steps.length - 1, v + 1))}
                disabled={saving}
                className="px-4 py-2.5 bg-accent text-white text-sm uppercase tracking-wider hover:opacity-95 transition disabled:opacity-50"
              >
                {t("tour.next")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
