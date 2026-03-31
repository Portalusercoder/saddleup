"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProfile } from "@/components/providers/ProfileProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import TableSkeleton from "@/components/ui/TableSkeleton";
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
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);

  const chart = {
    grid: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
    axis: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
    tick: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.7)",
    tooltipBg: isDark ? "#1a1a1a" : "#f3efe8",
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
  }, [profile, router]);

  if (profile?.role === "student") return null;

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-2xl md:text-3xl font-normal text-black">
          Analytics
        </h1>
        <TableSkeleton rows={6} cols={4} />
      </div>
    );
  }

  if (locked) {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-2xl md:text-3xl font-normal text-black">
          Analytics
        </h1>
        <div className="border border-black/10 p-8 text-center">
          <p className="text-black/70 mb-4">
            Upgrade to Starter or higher to access workload analytics and insights.
          </p>
          <Link
            href="/dashboard/settings"
            className="inline-block px-4 py-2.5 bg-accent text-white font-medium text-sm uppercase tracking-wider hover:opacity-95 transition"
          >
            Upgrade plan
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-2xl md:text-3xl font-normal text-black">
          Analytics
        </h1>
        <p className="text-black/50">Failed to load analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <h1 className="font-serif text-2xl md:text-3xl font-normal text-black">
        Analytics
      </h1>
      <p className="text-black/60 text-sm max-w-xl">
        Workload trends, session breakdown, and top horses. Data from the last 8 weeks.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
        <div className="border border-black/10 p-4">
          <p className="text-black/50 text-xs uppercase tracking-widest">Total sessions</p>
          <p className="text-2xl font-serif text-black mt-1">{data.totalSessions}</p>
        </div>
        <div className="border border-black/10 p-4">
          <p className="text-black/50 text-xs uppercase tracking-widest">Total minutes</p>
          <p className="text-2xl font-serif text-black mt-1">{data.totalMinutes}</p>
        </div>
        <div className="border border-black/10 p-4">
          <p className="text-black/50 text-xs uppercase tracking-widest">Total care cost</p>
          <p className="text-2xl font-serif text-black mt-1">
            ${(data.totalCareCost ?? 0).toFixed(2)}
          </p>
        </div>
        <div className="border border-black/10 p-4">
          <p className="text-black/50 text-xs uppercase tracking-widest">Upcoming lessons</p>
          <p className="text-2xl font-serif text-black mt-1">{data.bookingsCount.upcoming}</p>
        </div>
        <div className="border border-black/10 p-4">
          <p className="text-black/50 text-xs uppercase tracking-widest">Completed lessons</p>
          <p className="text-2xl font-serif text-black mt-1">{data.bookingsCount.completed}</p>
        </div>
      </div>

      <div className="border border-black/10 p-6">
        <h2 className="font-serif text-lg text-black mb-4">Workload by week</h2>
        <p className="text-black/50 text-sm mb-4">
          Training minutes logged per week (excluding rest days).
        </p>
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
                formatter={(value: number | undefined) => [value ?? 0, "Minutes"]}
                labelFormatter={(label) => `Week of ${label}`}
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
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="border border-black/10 p-6">
          <h2 className="font-serif text-lg text-black mb-4">Session types</h2>
          <p className="text-black/50 text-sm mb-4">
            Breakdown by punch type (lessons, training, competition, etc.).
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
                  formatter={(value: number | undefined) => [value ?? 0, "Sessions"]}
                />
                <Bar dataKey="count" fill={chart.bar} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border border-black/10 p-6">
          <h2 className="font-serif text-lg text-black mb-4">Top horses by workload</h2>
          <p className="text-black/50 text-sm mb-4">
            Most active horses in the last 4 weeks.
          </p>
          {data.horseWorkload.length === 0 ? (
            <p className="text-black/50 text-sm">No training data yet.</p>
          ) : (
            <div className="h-48 sm:h-64 min-h-[12rem]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.horseWorkload} layout="vertical" margin={{ left: 20, right: 20 }}>
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
                    formatter={(value: number | undefined) => [value ?? 0, "Minutes"]}
                  />
                  <Bar dataKey="minutes" fill={chart.bar} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="border border-black/10 p-6">
        <h2 className="font-serif text-lg text-black mb-4">Cost per horse</h2>
        <p className="text-black/50 text-sm mb-4">
          Total care costs (vet, farrier, vaccinations, etc.) from health records.
        </p>
        {(data.horseCosts ?? []).length === 0 ? (
          <p className="text-black/50 text-sm">No health costs logged yet.</p>
        ) : (
          <div className="h-48 sm:h-64 min-h-[12rem]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.horseCosts ?? []}
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
                  formatter={(value: number | undefined) => [`$${Number(value ?? 0).toFixed(2)}`, "Cost"]}
                />
                <Bar dataKey="cost" fill={chart.bar} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
