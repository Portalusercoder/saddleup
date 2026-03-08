"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";

interface LanguageToggleProps {
  /** Use light text/border for use on dark backgrounds (e.g. hero) */
  variant?: "light" | "dark";
}

export default function LanguageToggle({ variant = "dark" }: LanguageToggleProps) {
  const { lang, toggle } = useLanguage();
  const isLight = variant === "light";

  return (
    <button
      type="button"
      onClick={toggle}
      className={`flex items-center gap-1 px-2 py-1 text-[0.7rem] uppercase tracking-[0.18em] border transition ${
        isLight
          ? "border-white/40 text-white/80 hover:text-white hover:border-white/60"
          : "border-black/20 text-black/70 hover:text-black hover:border-black/40"
      }`}
      aria-label={lang === "en" ? "Switch to Arabic" : "Switch to English"}
    >
      <span className={lang === "en" ? "font-semibold" : isLight ? "text-white/70" : "text-black/60"}>
        EN
      </span>
      <span className={isLight ? "text-white/50" : "text-black/40"}>/</span>
      <span className={lang === "ar" ? "font-semibold" : isLight ? "text-white/70" : "text-black/60"}>
        AR
      </span>
    </button>
  );
}

