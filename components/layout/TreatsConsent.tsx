"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  TREATS_STORAGE_KEY,
  writeTreatsConsent,
  type TreatsChoice,
} from "@/lib/treatsConsent";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function TreatsConsent() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(TREATS_STORAGE_KEY);
      if (stored !== "all" && stored !== "essential") setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  const choose = (choice: TreatsChoice) => {
    try {
      writeTreatsConsent(choice);
    } catch {
      /* ignore quota / private mode */
    }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[60] px-4 sm:px-6 lg:px-8 pb-4 sm:pb-5 pt-2 pointer-events-none"
      role="dialog"
      aria-labelledby="treats-consent-title"
      aria-describedby="treats-consent-desc"
    >
      <div
        className="pointer-events-auto w-full max-w-7xl mx-auto border border-black/10 dark:border-white/15 bg-[var(--bg-elevated)] text-black dark:text-white shadow-lg"
        style={{ borderRadius: "var(--radius-sm)" }}
      >
        <div className="p-5 sm:p-6 lg:p-7 flex flex-col sm:flex-row sm:items-start gap-5 lg:gap-6">
          <div className="flex-1 min-w-0">
            <h2
              id="treats-consent-title"
              className="font-serif text-lg font-medium text-black dark:text-white mb-2"
            >
              {t("treats.title")}
            </h2>
            <p
              id="treats-consent-desc"
              className="text-sm text-black/70 dark:text-white/70 leading-relaxed"
            >
              {t("treats.description")}{" "}
              <Link
                href="/contact"
                className="underline underline-offset-2 text-black/80 dark:text-white/80 hover:opacity-90"
              >
                {t("treats.contactUs")}
              </Link>{" "}
              {t("treats.questions")}
            </p>
          </div>
          <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => choose("essential")}
              className="w-full sm:w-44 px-4 py-2.5 text-sm font-medium border border-black/20 dark:border-white/25 text-black dark:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors uppercase tracking-wide"
              style={{ borderRadius: "var(--radius-sm)" }}
            >
              {t("treats.essentialsOnly")}
            </button>
            <button
              type="button"
              onClick={() => choose("all")}
              className="w-full sm:w-44 px-4 py-2.5 text-sm font-medium bg-accent text-white hover:opacity-95 transition-opacity uppercase tracking-wide"
              style={{ borderRadius: "var(--radius-sm)" }}
            >
              {t("treats.acceptAll")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
