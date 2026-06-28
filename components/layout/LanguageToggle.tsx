"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";

interface LanguageToggleProps {
  /** Use light text/border for use on dark backgrounds (e.g. hero) */
  variant?: "light" | "dark";
  /** Compact pill style for marketing nav */
  compact?: boolean;
}

export default function LanguageToggle({ variant = "dark", compact = false }: LanguageToggleProps) {
  const { lang, toggle, t } = useLanguage();
  const isLight = variant === "light";

  return (
    <button
      type="button"
      onClick={toggle}
      className={`flex items-center gap-1 uppercase tracking-[0.14em] transition ${
        compact ? "px-2.5 py-1.5 text-[0.65rem] rounded-full" : "px-2 py-1 text-[0.7rem] border"
      } ${
        isLight
          ? compact
            ? "text-white/90 hover:text-white bg-white/10 hover:bg-white/15"
            : "border-white/50 text-white/90 hover:text-white hover:border-white/70"
          : compact
            ? "text-[#1d1d1f]/70 hover:text-[#1d1d1f] bg-black/[0.04] hover:bg-black/[0.07]"
            : "border-black/20 text-black/70 hover:text-black hover:border-black/40"
      }`}
      aria-label={lang === "en" ? t("languageToggle.toArabic") : t("languageToggle.toEnglish")}
    >
      <span className={lang === "en" ? "font-semibold text-current" : isLight ? "text-white/55" : "text-[#1d1d1f]/45"}>
        EN
      </span>
      <span className={isLight ? "text-white/40" : "text-[#1d1d1f]/30"}>/</span>
      <span className={lang === "ar" ? "font-semibold text-current" : isLight ? "text-white/55" : "text-[#1d1d1f]/45"}>
        AR
      </span>
    </button>
  );
}

