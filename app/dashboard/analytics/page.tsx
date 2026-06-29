"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProfile } from "@/components/providers/ProfileProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import TableSkeleton from "@/components/ui/TableSkeleton";
import DashboardEmptyState from "@/components/ui/DashboardEmptyState";
import GuidedTourOverlay, { type GuidedTourStep } from "@/components/dashboard/GuidedTourOverlay";
import AddHealthRecordModal from "@/components/dashboard/AddHealthRecordModal";
import { usePageTour } from "@/components/dashboard/usePageTour";
import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface AnalyticsData {
  sessionsByWeek: { week: string; label: string; minutes: number; count: number }[];
  punchTypeBreakdown: { type: string; count: number }[];
  horseWorkload: { horseId: string; horseName: string; minutes: number }[];
  horseCosts: { horseId: string; horseName: string; cost: number }[];
  totalCareCost: number;
  bookingsCount: { upcoming: number; completed: number };
  totalSessions: number;
  totalMinutes: number;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { profile } = useProfile();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [horseFilter, setHorseFilter] = useState<string>("all");
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [horses, setHorses] = useState<{ id: string; name: string }[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const { open: showTour, complete: completeTour } = usePageTour(
    "saddleup_tour_analytics_v1",
    !loading && !locked && Boolean(data)
  );

  const chart = {
    grid: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
    axis: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
    tick: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.7)",
    tooltipBg: isDark ? "#1a1a1a" : "#FFFBF0",
    tooltipBorder: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.15)",
    tooltipText: isDark ? "#fff" : "#000",
    line: isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.85)",
    dot: isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.8)",
    bar: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.6)",
  };

  useEffect(() => {
    if (!profile) return;
    if (profile.role === "student") {
      router.replace("/dashboard");
      return;
    }
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((res) => {
        if (res.code === "ANALYTICS_LOCKED") {
          setLocked(true);
          setData(null);
        } else if (res.error) {
          setData(null);
        } else {
          setData(res);
        }
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));

    fetch("/api/horses")
      .then((r) => r.json())
      .then((list) => {
        if (Array.isArray(list)) {
          setHorses(list.map((h: { id: string | number; name: string }) => ({
            id: String(h.id),
            name: h.name,
          })));
        }
      })
      .catch(() => setHorses([]));
  }, [profile, router]);

  const refreshAnalytics = () => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((res) => {
        if (!res.error && res.code !== "ANALYTICS_LOCKED") {
          setData(res);
        }
      })
      .catch(() => {});
  };

  if (profile?.role === "student") return null;

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-2xl md:text-3xl font-normal text-black">
          {t("dashboard.analyticsTitle")}
        </h1>
        <TableSkeleton rows={6} cols={4} />
      </div>
    );
  }

  if (locked) {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-2xl md:text-3xl font-normal text-black">
          {t("dashboard.analyticsTitle")}
        </h1>
        <div className="border border-black/10 p-8 text-center">
          <p className="text-black/70 mb-4">
            {t("dashboard.analyticsLockedLead")}
          </p>
          <Link
            href="/dashboard/settings"
            className="inline-block px-4 py-2.5 bg-accent text-white font-medium text-sm uppercase tracking-wider hover:opacity-95 transition"
          >
            {t("dashboard.upgradePlanCta")}
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-2xl md:text-3xl font-normal text-black">
          {t("dashboard.analyticsTitle")}
        </h1>
        <p className="text-black/50">{t("dashboard.analyticsLoadFailed")}</p>
      </div>
    );
  }

  const horseOptions = Array.from(
    new Map(
      [...data.horseWorkload, ...(data.horseCosts ?? [])].map((h) => [
        h.horseId,
        h.horseName,
      ])
    ).entries()
  ).sort((a, b) => a[1].localeCompare(b[1]));

  const filteredHorseWorkload =
    horseFilter === "all"
      ? data.horseWorkload
      : data.horseWorkload.filter((h) => h.horseId === horseFilter);

  const filteredHorseCosts =
    horseFilter === "all"
      ? (data.horseCosts ?? [])
      : (data.horseCosts ?? []).filter((h) => h.horseId === horseFilter);

  const hasTrainingData = data.totalSessions > 0 || data.totalMinutes > 0;

  const tourSteps: GuidedTourStep[] = [
    {
      id: "kpis",
      title: t("dashboard.analyticsTourKpisTitle"),
      description: t("dashboard.analyticsTourKpisDesc"),
      selector: '[data-tour="analytics-kpis"]',
    },
    {
      id: "workload",
      title: t("dashboard.analyticsTourWorkloadTitle"),
      description: t("dashboard.analyticsTourWorkloadDesc"),
      selector: '[data-tour="analytics-workload"]',
    },
    {
      id: "breakdown",
      title: t("dashboard.analyticsTourBreakdownTitle"),
      description: t("dashboard.analyticsTourBreakdownDesc"),
      selector: '[data-tour="analytics-breakdown"]',
    },
  ];

  return (
    <div className="space-y-10">
      {toast ? (
        <div className="px-4 py-2 border border-black/10 dark:border-white/15 text-black dark:text-white text-sm">
          {toast}
        </div>
      ) : null}
      <GuidedTourOverlay
        open={showTour}
        steps={tourSteps}
        onSkip={completeTour}
        onComplete={completeTour}
      />
      <h1 className="font-serif text-2xl md:text-3xl font-normal text-black">
        {t("dashboard.analyticsTitle")}
      </h1>
      <p className="text-black/60 text-sm max-w-xl">
        {t("dashboard.analyticsLead")}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4" data-tour="analytics-kpis">
        <div className="border border-black/10 p-4">
          <p className="text-black/50 text-xs uppercase tracking-widest">{t("dashboard.analyticsKpiSessions")}</p>
          <p className="text-2xl font-serif text-black mt-1">{data.totalSessions}</p>
        </div>
        <div className="border border-black/10 p-4">
          <p className="text-black/50 text-xs uppercase tracking-widest">{t("dashboard.analyticsKpiMinutes")}</p>
          <p className="text-2xl font-serif text-black mt-1">{data.totalMinutes}</p>
        </div>
        <div className="border border-black/10 p-4">
          <p className="text-black/50 text-xs uppercase tracking-widest">{t("dashboard.analyticsKpiCareCost")}</p>
          <p className="text-2xl font-serif text-black mt-1">
            ${(data.totalCareCost ?? 0).toFixed(2)}
          </p>
        </div>
        <div className="border border-black/10 p-4">
          <p className="text-black/50 text-xs uppercase tracking-widest">{t("dashboard.analyticsKpiUpcoming")}</p>
          <p className="text-2xl font-serif text-black mt-1">{data.bookingsCount.upcoming}</p>
        </div>
        <div className="border border-black/10 p-4">
          <p className="text-black/50 text-xs uppercase tracking-widest">{t("dashboard.analyticsKpiCompleted")}</p>
          <p className="text-2xl font-serif text-black mt-1">{data.bookingsCount.completed}</p>
        </div>
      </div>

      <div className="border border-black/10 p-6 dark:border-white/10" data-tour="analytics-workload">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="font-serif text-lg text-black dark:text-white">
            {t("dashboard.analyticsWorkloadWeek")}
          </h2>
          {horseOptions.length > 0 && (
            <label className="flex items-center gap-2 text-sm text-black/60 dark:text-white/60">
              <span className="text-xs uppercase tracking-widest">
                {t("dashboard.analyticsHorseFilter")}
              </span>
              <select
                value={horseFilter}
                onChange={(e) => setHorseFilter(e.target.value)}
                className="px-3 py-1.5 bg-base border border-black/10 text-black text-sm focus:outline-none dark:border-white/15 dark:text-white"
              >
                <option value="all">{t("dashboard.analyticsHorseFilterAll")}</option>
                {horseOptions.map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
        <p className="text-black/50 text-sm mb-4 dark:text-white/50">
          {t("dashboard.analyticsWorkloadWeekLead")}
        </p>
        {!hasTrainingData ? (
          <DashboardEmptyState
            title={t("dashboard.analyticsEmptyTrainingTitle")}
            description={t("dashboard.analyticsEmptyTrainingBody")}
            actionLabel={t("dashboard.analyticsEmptyTrainingCta")}
            actionHref="/dashboard/horses"
          />
        ) : (
          <div className="h-48 sm:h-64 min-h-[12rem]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.sessionsByWeek}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                <XAxis
                  dataKey="label"
                  stroke={chart.axis}
                  tick={{ fill: chart.tick, fontSize: 11 }}
                />
                <YAxis
                  stroke={chart.axis}
                  tick={{ fill: chart.tick, fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: chart.tooltipBg, border: `1px solid ${chart.tooltipBorder}` }}
                  labelStyle={{ color: chart.tooltipText }}
                  formatter={(value: number | undefined) => [value ?? 0, t("dashboard.analyticsTooltipMinutes")]}
                  labelFormatter={(label) => t("dashboard.analyticsTooltipWeekOf", { week: String(label) })}
                />
                <Line
                  type="monotone"
                  dataKey="minutes"
                  stroke={chart.line}
                  strokeWidth={2}
                  dot={{ fill: chart.dot }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="border border-black/10 p-6">
          <h2 className="font-serif text-lg text-black mb-4">{t("dashboard.analyticsSessionTypes")}</h2>
          <p className="text-black/50 text-sm mb-4">
            {t("dashboard.analyticsSessionTypesLead")}
          </p>
          <div className="h-48 sm:h-64 min-h-[12rem]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.punchTypeBreakdown} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                <XAxis type="number" stroke={chart.axis} tick={{ fill: chart.tick, fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="type"
                  width={80}
                  stroke={chart.axis}
                  tick={{ fill: chart.tick, fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: chart.tooltipBg, border: `1px solid ${chart.tooltipBorder}` }}
                  formatter={(value: number | undefined) => [value ?? 0, t("dashboard.analyticsTooltipSessions")]}
                />
                <Bar dataKey="count" fill={chart.bar} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border border-black/10 p-6">
          <h2 className="font-serif text-lg text-black mb-4">{t("dashboard.analyticsTopHorses")}</h2>
          <p className="text-black/50 text-sm mb-4">
            {t("dashboard.analyticsTopHorsesLead")}
          </p>
          {filteredHorseWorkload.length === 0 ? (
            <DashboardEmptyState
              title={t("dashboard.analyticsEmptyTrainingTitle")}
              description={t("dashboard.analyticsEmptyTrainingBody")}
              actionLabel={t("dashboard.analyticsEmptyTrainingCta")}
              actionHref="/dashboard/horses"
            />
          ) : (
            <div className="h-48 sm:h-64 min-h-[12rem]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredHorseWorkload} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                  <XAxis type="number" stroke={chart.axis} tick={{ fill: chart.tick, fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="horseName"
                    width={100}
                    stroke={chart.axis}
                    tick={{ fill: chart.tick, fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: chart.tooltipBg, border: `1px solid ${chart.tooltipBorder}` }}
                    formatter={(value: number | undefined) => [value ?? 0, t("dashboard.analyticsTooltipMinutes")]}
                  />
                  <Bar dataKey="minutes" fill={chart.bar} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="border border-black/10 p-6" data-tour="analytics-breakdown">
        <h2 className="font-serif text-lg text-black mb-4">{t("dashboard.analyticsCostPerHorse")}</h2>
        <p className="text-black/50 text-sm mb-4">
          {t("dashboard.analyticsCostPerHorseLead")}
        </p>
        {(filteredHorseCosts ?? []).length === 0 ? (
          <DashboardEmptyState
            title={t("dashboard.analyticsEmptyCostsTitle")}
            description={t("dashboard.analyticsEmptyCostsBody")}
            actionLabel={t("dashboard.analyticsEmptyCostsCta")}
            {...(horses.length > 0
              ? { onAction: () => setShowHealthModal(true) }
              : { actionHref: "/dashboard/horses" })}
          />
        ) : (
          <div className="h-48 sm:h-64 min-h-[12rem]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredHorseCosts ?? []}
                layout="vertical"
                margin={{ left: 20, right: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                <XAxis
                  type="number"
                  stroke={chart.axis}
                  tick={{ fill: chart.tick, fontSize: 11 }}
                  tickFormatter={(v) => `$${v}`}
                />
                <YAxis
                  type="category"
                  dataKey="horseName"
                  width={100}
                  stroke={chart.axis}
                  tick={{ fill: chart.tick, fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: chart.tooltipBg, border: `1px solid ${chart.tooltipBorder}` }}
                  formatter={(value: number | undefined) => [`$${Number(value ?? 0).toFixed(2)}`, t("dashboard.analyticsTooltipCost")]}
                />
                <Bar dataKey="cost" fill={chart.bar} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <AddHealthRecordModal
        open={showHealthModal}
        onClose={() => setShowHealthModal(false)}
        horses={horses}
        defaultHorseId={horseFilter !== "all" ? horseFilter : undefined}
        onSuccess={({ cost }) => {
          refreshAnalytics();
          setToast(
            cost != null
              ? t("dashboard.horseHealthAddSuccess")
              : t("dashboard.horseHealthAddSuccessNoCost")
          );
          window.setTimeout(() => setToast(null), 4000);
        }}
      />
    </div>
  );
}
