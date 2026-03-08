"use client";

interface LoadingScreenProps {
  /** Optional message below the icon */
  message?: string;
  /** Full-page overlay (default) or inline */
  fullPage?: boolean;
  /** Icon size: sm (24px), md (48px), lg (64px) */
  size?: "sm" | "md" | "lg";
}

const SIZE_MAP = { sm: 24, md: 48, lg: 64 };

/** Circular loader - matches Saddle Up black/white aesthetic */
export default function LoadingScreen({
  message,
  fullPage = true,
  size = "md",
}: LoadingScreenProps) {
  const iconSize = SIZE_MAP[size];

  return (
    <div
      className={
        fullPage
          ? "min-h-screen bg-base flex flex-col items-center justify-center text-black"
          : "flex flex-col items-center justify-center py-16"
      }
    >
      <div className="relative">
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-black/70 animate-spin"
          aria-hidden
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
            strokeOpacity="0.25"
            fill="none"
          />
          <path
            d="M12 2a10 10 0 0 1 10 10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>
      {message && (
        <p
          className={`uppercase tracking-[0.25em] text-black/40 font-sans ${
            size === "sm" ? "mt-3 text-[0.6rem]" : "mt-6 text-[0.65rem]"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
