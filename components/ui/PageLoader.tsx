"use client";

import HorseLoader from "@/components/ui/HorseLoader";

interface PageLoaderProps {
  /** Shown under the horse; omit for horse only */
  message?: string | null;
  className?: string;
  minHeight?: string;
  size?: "sm" | "md" | "lg";
}

/** Centered galloping horse for dashboard / auth pages that only show “Loading…”. */
export default function PageLoader({
  message = "Loading…",
  className = "",
  minHeight = "min-h-[40vh]",
  size = "md",
}: PageLoaderProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-5 ${minHeight} ${className}`}
    >
      <HorseLoader size={size} />
      {message ? (
        <p className="text-xs uppercase tracking-[0.28em] text-black/45 dark:text-white/45">
          {message}
        </p>
      ) : null}
    </div>
  );
}
