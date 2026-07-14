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
      className={`landing-touch-target su-focus-ring flex items-center justify-center gap-1 uppercase tracking-[0.14em] transition ${
        compact
          ? "min-w-[44px] min-h-[44px] px-2.5 py-2 text-[0.65rem] rounded-control"
          : "px-2 py-1 text-[0.7rem] border rounded-control"
      } ${
        isLight
          ? compact
            ? "text-white/90 hover:text-white bg-white/10 hover:bg-white/15"
            : "border-white/50 text-white/90 hover:text-white hover:border-white/70"
          : compact
            ? "text-forest/70 hover:text-forest bg-forest/[0.04] hover:bg-forest/[0.07]"
            : "border-black/20 text-black/70 hover:text-black hover:border-black/40"
      }`}
      aria-label={lang === "en" ? t("languageToggle.toArabic") : t("languageToggle.toEnglish")}
    >
      <span className={lang === "en" ? "font-semibold text-current" : isLight ? "text-white/55" : "text-forest/45"}>
        EN
      </span>
      <span className={isLight ? "text-white/40" : "text-forest/30"}>/</span>
      <span className={lang === "ar" ? "font-semibold text-current" : isLight ? "text-white/55" : "text-forest/45"}>
        AR
      </span>
    </button>
  );
}
