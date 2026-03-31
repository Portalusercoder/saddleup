"use client";

const SIZE_MAP = { sm: 32, md: 44, lg: 56 };

export interface HorseLoaderProps {
  /** Pixel-ish width; height scales with viewBox aspect */
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Visually hidden label for assistive tech */
  label?: string;
}

/**
 * Small galloping horse silhouette — use inside LoadingScreen or inline page loaders.
 */
export default function HorseLoader({
  size = "md",
  className = "",
  label = "Loading",
}: HorseLoaderProps) {
  const w = SIZE_MAP[size];
  const h = Math.round(w * 0.58);

  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      role="status"
      aria-label={label}
    >
      <svg
        width={w}
        height={h}
        viewBox="0 0 100 60"
        xmlns="http://www.w3.org/2000/svg"
        className="text-black/80 dark:text-white/80"
        aria-hidden
      >
        <g
          className="animate-horse-gallop"
          style={{ transformOrigin: "52px 44px" }}
        >
          <ellipse cx="54" cy="38" rx="30" ry="12" fill="currentColor" />
          <path
            fill="currentColor"
            d="M26 38c-4-10 4-20 14-20 5 0 9 2 12 6l8 12c2 5-2 11-8 12l-16 2-10-12z"
          />
          <ellipse cx="16" cy="28" rx="9" ry="10" fill="currentColor" />
          <path fill="currentColor" d="M80 34l16-14 5 4-12 18z" />
          <path
            fill="currentColor"
            d="M36 46l-5 12-7 2 3-12 9-2zm14 2l-4 10-6 1 3-10 7-1z"
            opacity="0.92"
          />
        </g>
      </svg>
    </span>
  );
}
