"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";

export default function LanguageToggle() {
  const { lang, toggle } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex items-center gap-1 px-2 py-1 text-[0.7rem] uppercase tracking-[0.18em] border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition"
      aria-label={lang === "en" ? "Switch to Arabic" : "Switch to English"}
    >
      <span className={lang === "en" ? "font-semibold text-white" : "text-white/60"}>
        EN
      </span>
      <span className="text-white/40">/</span>
      <span className={lang === "ar" ? "font-semibold text-white" : "text-white/60"}>
        AR
      </span>
    </button>
  );
}

