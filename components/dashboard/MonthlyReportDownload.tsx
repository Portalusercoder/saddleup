"use client";

import { useState } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

export default function MonthlyReportDownload() {
  const { t, lang } = useLanguage();
  const now = new Date();
  const monthLocale = lang === "ar" ? "ar-SA" : "en-US";
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/reports/monthly?year=${year}&month=${month}`
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || t("dashboard.monthlyReportDownloadFailed"));
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `monthly-report-${year}-${String(month).padStart(2, "0")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("dashboard.monthlyReportDownloadFailed"));
    } finally {
      setLoading(false);
    }
  };

  const years = Array.from(Array(5), (_, i) => now.getFullYear() - i);

  return (
    <div className="border border-black/10 p-6">
      <h2 className="font-serif text-lg text-black mb-2">{t("dashboard.monthlyReportTitle")}</h2>
      <p className="text-black/60 text-sm mb-4">
        {t("dashboard.monthlyReportLead")}
      </p>
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs uppercase tracking-widest text-black/50 mb-1">
            {t("dashboard.monthlyReportMonth")}
          </label>
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value, 10))}
            className="w-full sm:w-auto px-4 py-2.5 bg-base border border-black/10 text-black focus:border-black/30 focus:outline-none"
          >
            {MONTHS.map((m) => (
              <option key={m} value={m}>
                {new Date(2026, m - 1, 1).toLocaleString(monthLocale, { month: "long" })}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-black/50 mb-1">
            {t("dashboard.monthlyReportYear")}
          </label>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value, 10))}
            className="w-full sm:w-auto px-4 py-2.5 bg-base border border-black/10 text-black focus:border-black/30 focus:outline-none"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div>
          <button
            onClick={handleDownload}
            disabled={loading}
            className="px-4 py-2.5 bg-accent text-white font-medium text-sm uppercase tracking-wider hover:opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t("dashboard.monthlyReportGenerating") : t("dashboard.monthlyReportDownload")}
          </button>
        </div>
      </div>
      {error && (
        <p className="mt-3 text-sm text-amber-400">{error}</p>
      )}
    </div>
  );
}
