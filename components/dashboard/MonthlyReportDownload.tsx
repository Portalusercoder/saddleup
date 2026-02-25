"use client";

import { useState } from "react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function MonthlyReportDownload() {
  const now = new Date();
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
        throw new Error(data.error || "Failed to download report");
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
      setError(err instanceof Error ? err.message : "Failed to download");
    } finally {
      setLoading(false);
    }
  };

  const years = Array.from(Array(5), (_, i) => now.getFullYear() - i);

  return (
    <div className="border border-white/10 p-6">
      <h2 className="font-serif text-lg text-white mb-2">Monthly Report</h2>
      <p className="text-white/60 text-sm mb-4">
        Download a PDF report for any month including classes, new members, riders, training sessions, horses, incidents, and competitions.
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <label className="block text-xs uppercase tracking-widest text-white/50 mb-1">
            Month
          </label>
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value, 10))}
            className="w-full sm:w-auto px-4 py-2.5 bg-black border border-white/10 text-white focus:border-white/30 focus:outline-none"
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-white/50 mb-1">
            Year
          </label>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value, 10))}
            className="w-full sm:w-auto px-4 py-2.5 bg-black border border-white/10 text-white focus:border-white/30 focus:outline-none"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={handleDownload}
            disabled={loading}
            className="px-4 py-2.5 bg-white text-black font-medium text-sm uppercase tracking-wider hover:opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Generating…" : "Download PDF"}
          </button>
        </div>
      </div>
      {error && (
        <p className="mt-3 text-sm text-amber-400">{error}</p>
      )}
    </div>
  );
}
