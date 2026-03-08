"use client";

import { useTheme } from "@/components/providers/ThemeProvider";

interface ThemeToggleProps {
  /** Use light border/text when on dark background (e.g. hero) */
  variant?: "light" | "dark";
}

export default function ThemeToggle({ variant = "dark" }: ThemeToggleProps) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  const isLightVariant = variant === "light";

  const buttonClass = isLightVariant
    ? "border-white/40 text-white/80 hover:text-white hover:border-white/60 hover:bg-white/10"
    : "border-black/20 text-black/70 hover:text-black hover:border-black/40 hover:bg-black/5 transition dark:border-white/30 dark:text-white/70 dark:hover:text-white dark:hover:border-white/50 dark:hover:bg-white/10";

  return (
    <button
      type="button"
      onClick={toggle}
      className={`flex items-center justify-center w-9 h-9 rounded border transition ${buttonClass}`}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      {isDark ? (
        <SunIcon className="w-4 h-4" />
      ) : (
        <MoonIcon className="w-4 h-4" />
      )}
    </button>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
      />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
      />
    </svg>
  );
}
