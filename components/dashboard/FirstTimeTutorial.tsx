"use client";

import { useEffect, useState } from "react";

type TutorialStep = {
  title: string;
  description: string;
};

const OWNER_STEPS: TutorialStep[] = [
  {
    title: "Welcome to Saddle Up",
    description:
      "This dashboard gives you a quick view of horses, sessions, reminders, and team activity.",
  },
  {
    title: "Invite Your Team",
    description:
      "Use the invite code card to let trainers and students join your stable during signup.",
  },
  {
    title: "Add Your First Horse",
    description:
      "Go to Horses and create horse profiles to unlock sessions, reminders, and workload tracking.",
  },
  {
    title: "Log Sessions Regularly",
    description:
      "Add training sessions often. The app uses this data for weekly metrics and workload alerts.",
  },
];

const TRAINER_STEPS: TutorialStep[] = [
  {
    title: "Welcome to Saddle Up",
    description:
      "Your dashboard shows recent sessions, care reminders, and quick actions for daily work.",
  },
  {
    title: "Start with Horse Profiles",
    description:
      "Add horse details first so you can track workload, care reminders, and training quality.",
  },
  {
    title: "Log Sessions Every Day",
    description:
      "Each session updates weekly metrics and helps detect horses that may need rest.",
  },
];

const STUDENT_STEPS: TutorialStep[] = [
  {
    title: "Welcome to Your Dashboard",
    description:
      "You can view assigned horses, upcoming lessons, and your recent training sessions here.",
  },
  {
    title: "Check Upcoming Bookings",
    description:
      "Use My Bookings to track lesson dates and times and stay ready for your next ride.",
  },
  {
    title: "Review Progress",
    description:
      "Use My Horses and Training History to follow your recent sessions and consistency.",
  },
];

interface FirstTimeTutorialProps {
  role: string | undefined;
  open: boolean;
  saving?: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

function getSteps(role: string | undefined): TutorialStep[] {
  if (role === "owner") return OWNER_STEPS;
  if (role === "trainer") return TRAINER_STEPS;
  if (role === "student") return STUDENT_STEPS;
  return [];
}

export default function FirstTimeTutorial({
  role,
  open,
  saving = false,
  onComplete,
  onSkip,
}: FirstTimeTutorialProps) {
  const steps = getSteps(role);
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
          Quick tour
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
            Skip
          </button>
          <div className="flex items-center gap-3">
            {index > 0 ? (
              <button
                type="button"
                onClick={() => setIndex((v) => Math.max(0, v - 1))}
                disabled={saving}
                className="px-4 py-2.5 border border-black/20 text-sm uppercase tracking-wider hover:border-black/35 transition disabled:opacity-50"
              >
                Back
              </button>
            ) : null}
            {atLast ? (
              <button
                type="button"
                onClick={onComplete}
                disabled={saving}
                className="px-4 py-2.5 bg-accent text-white text-sm uppercase tracking-wider hover:opacity-95 transition disabled:opacity-50"
              >
                {saving ? "Saving..." : "Finish"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIndex((v) => Math.min(steps.length - 1, v + 1))}
                disabled={saving}
                className="px-4 py-2.5 bg-accent text-white text-sm uppercase tracking-wider hover:opacity-95 transition disabled:opacity-50"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
