"use client";

import { useEffect, useMemo, useState } from "react";

export type GuidedTourStep = {
  id: string;
  title: string;
  description: string;
  selector: string;
};

interface GuidedTourOverlayProps {
  open: boolean;
  steps: GuidedTourStep[];
  saving?: boolean;
  onSkip: () => void;
  onComplete: () => void;
}

export default function GuidedTourOverlay({
  open,
  steps,
  saving = false,
  onSkip,
  onComplete,
}: GuidedTourOverlayProps) {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!open) return;
    setIndex(0);
  }, [open]);

  const current = useMemo(() => steps[index] ?? null, [steps, index]);

  useEffect(() => {
    if (!open || !current) return;
    const el = document.querySelector(current.selector) as HTMLElement | null;
    if (!el) {
      // Skip forward when an anchor is missing, but never auto-finish: that was
      // incorrectly marking onboarding / tours "done" without user action.
      if (index < steps.length - 1) {
        setIndex((v) => Math.min(v + 1, steps.length - 1));
      }
      return;
    }

    el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });

    const update = () => {
      const nextEl = document.querySelector(current.selector) as HTMLElement | null;
      if (!nextEl) {
        setRect(null);
        return;
      }
      setRect(nextEl.getBoundingClientRect());
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, current, index, steps.length]);

  if (!open || !current || steps.length === 0) return null;

  const atLast = index === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[95]">
      {!rect ? <div className="absolute inset-0 bg-black/65" /> : null}

      {rect ? (
        <div
          className="fixed rounded-sm border-2 border-accent pointer-events-none"
          style={{
            top: Math.max(0, rect.top - 8),
            left: Math.max(0, rect.left - 8),
            width: rect.width + 16,
            height: rect.height + 16,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.65)",
          }}
        />
      ) : null}

      <div className="fixed left-1/2 -translate-x-1/2 bottom-4 w-[calc(100vw-1.5rem)] sm:w-[30rem] border border-black/20 bg-base text-black p-4 sm:p-5">
        <p className="text-xs uppercase tracking-[0.22em] text-black/45">
          Step {index + 1} / {steps.length}
        </p>
        <h3 className="mt-2 font-serif text-xl">{current.title}</h3>
        <p className="mt-2 text-sm text-black/70 leading-relaxed">{current.description}</p>

        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onSkip}
            disabled={saving}
            className="px-3 py-2 border border-black/20 text-xs uppercase tracking-wider hover:border-black/35 transition disabled:opacity-50"
          >
            Skip
          </button>
          <div className="flex items-center gap-2">
            {index > 0 ? (
              <button
                type="button"
                onClick={() => setIndex((v) => Math.max(0, v - 1))}
                disabled={saving}
                className="px-3 py-2 border border-black/20 text-xs uppercase tracking-wider hover:border-black/35 transition disabled:opacity-50"
              >
                Back
              </button>
            ) : null}
            {atLast ? (
              <button
                type="button"
                onClick={onComplete}
                disabled={saving}
                className="px-3 py-2 bg-accent text-white text-xs uppercase tracking-wider hover:opacity-95 transition disabled:opacity-50"
              >
                {saving ? "Saving..." : "Finish"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIndex((v) => Math.min(v + 1, steps.length - 1))}
                disabled={saving}
                className="px-3 py-2 bg-accent text-white text-xs uppercase tracking-wider hover:opacity-95 transition disabled:opacity-50"
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
