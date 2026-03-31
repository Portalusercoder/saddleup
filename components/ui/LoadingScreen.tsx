"use client";

interface LoadingScreenProps {
  /** Optional message below the skeleton */
  message?: string;
  /** Full-page overlay (default) or inline */
  fullPage?: boolean;
}

/** Full-page or inline loader with skeleton placeholders */
export default function LoadingScreen({
  message,
  fullPage = true,
}: LoadingScreenProps) {
  return (
    <div
      className={
        fullPage
          ? "min-h-screen bg-base flex flex-col items-center justify-center text-black dark:text-white px-6"
          : "flex flex-col items-center justify-center py-16 text-black dark:text-white px-6"
      }
    >
      <div className="flex w-full max-w-lg flex-col gap-4">
        <div className="skeleton mx-auto h-4 w-1/2 max-w-xs" />
        <div className="skeleton h-24 w-full rounded-md" />
        <div className="flex gap-3">
          <div className="skeleton h-10 flex-1 rounded-md" />
          <div className="skeleton h-10 w-28 rounded-md" />
        </div>
        <div className="skeleton h-3 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
      </div>
      {message && (
        <p className="mt-8 uppercase tracking-[0.25em] text-black/40 dark:text-white/40 font-sans text-[0.65rem]">
          {message}
        </p>
      )}
    </div>
  );
}
