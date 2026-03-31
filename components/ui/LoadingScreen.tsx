"use client";

import HorseLoader from "@/components/ui/HorseLoader";

interface LoadingScreenProps {
  /** Optional message below the icon */
  message?: string;
  /** Full-page overlay (default) or inline */
  fullPage?: boolean;
  /** Horse size */
  size?: "sm" | "md" | "lg";
}

/** Full-page or inline loader with a galloping horse */
export default function LoadingScreen({
  message,
  fullPage = true,
  size = "md",
}: LoadingScreenProps) {
  return (
    <div
      className={
        fullPage
          ? "min-h-screen bg-base flex flex-col items-center justify-center text-black dark:text-white"
          : "flex flex-col items-center justify-center py-16 text-black dark:text-white"
      }
    >
      <HorseLoader size={size} />
      {message && (
        <p
          className={`uppercase tracking-[0.25em] text-black/40 dark:text-white/40 font-sans ${
            size === "sm" ? "mt-3 text-[0.6rem]" : "mt-6 text-[0.65rem]"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
