"use client";

interface PageLoaderProps {
  /** Shown under the skeleton; omit for skeleton only */
  message?: string | null;
  className?: string;
  minHeight?: string;
}

/** Centered skeleton placeholders for dashboard / auth “Loading…” states. */
export default function PageLoader({
  message = "Loading…",
  className = "",
  minHeight = "min-h-[40vh]",
}: PageLoaderProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-6 ${minHeight} ${className}`}
    >
      <div className="flex w-full max-w-md flex-col gap-3 px-4">
        <div className="skeleton mx-auto h-3 w-2/3" />
        <div className="skeleton h-14 w-full rounded-md" />
        <div className="skeleton mx-auto h-3 w-1/2" />
      </div>
      {message ? (
        <p className="text-xs uppercase tracking-[0.28em] text-black/45 dark:text-white/45">
          {message}
        </p>
      ) : null}
    </div>
  );
}
