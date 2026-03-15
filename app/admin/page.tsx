"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AdminStable, AdminUser } from "@/app/api/admin/overview/route";

type Overview = {
  stables: AdminStable[];
  users: AdminUser[];
  subscriptionCounts: Record<string, number>;
  totalStables: number;
  totalUsers: number;
};

export default function AdminPage() {
  const router = useRouter();
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/overview")
      .then((res) => {
        if (res.status === 401) {
          router.replace("/login?redirect=/admin");
          return null;
        }
        if (res.status === 403) {
          setError("Access denied. Only admins can view this page.");
          return null;
        }
        return res.json();
      })
      .then((json) => {
        if (json) setData(json);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load");
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-black/60">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="text-red-600">{error}</p>
        <Link href="/dashboard" className="mt-4 inline-block text-sm underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  if (!data) return null;

  const { stables, users, subscriptionCounts, totalStables, totalUsers } = data;

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-8">
        <h1 className="font-serif text-2xl md:text-3xl text-black">
          Admin dashboard
        </h1>
        <Link
          href="/dashboard"
          className="text-sm uppercase tracking-wider text-black/60 hover:text-black"
        >
          ← Dashboard
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="border border-black/10 p-4">
          <p className="text-xs uppercase tracking-wider text-black/50">Stables</p>
          <p className="text-2xl font-semibold text-black">{totalStables}</p>
        </div>
        <div className="border border-black/10 p-4">
          <p className="text-xs uppercase tracking-wider text-black/50">Users</p>
          <p className="text-2xl font-semibold text-black">{totalUsers}</p>
        </div>
        <div className="border border-black/10 p-4">
          <p className="text-xs uppercase tracking-wider text-black/50">Trialing</p>
          <p className="text-2xl font-semibold text-black">{subscriptionCounts.trialing ?? 0}</p>
        </div>
        <div className="border border-black/10 p-4">
          <p className="text-xs uppercase tracking-wider text-black/50">Active</p>
          <p className="text-2xl font-semibold text-black">{subscriptionCounts.active ?? 0}</p>
        </div>
      </div>

      {/* Stables table */}
      <section className="mb-12">
        <h2 className="font-serif text-lg text-black mb-4">Stables</h2>
        <div className="overflow-x-auto border border-black/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/10 bg-black/5">
                <th className="text-left p-3 font-medium">Name</th>
                <th className="text-left p-3 font-medium">Tier</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">Trial ends</th>
                <th className="text-right p-3 font-medium">Members</th>
                <th className="text-right p-3 font-medium">Horses</th>
                <th className="text-left p-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {stables.map((s) => (
                <tr key={s.id} className="border-b border-black/5 hover:bg-black/5">
                  <td className="p-3 font-medium">{s.name}</td>
                  <td className="p-3 text-black/80">{s.subscription_tier}</td>
                  <td className="p-3">
                    <span
                      className={
                        s.subscription_status === "active"
                          ? "text-green-700"
                          : s.subscription_status === "trialing"
                            ? "text-amber-700"
                            : "text-black/70"
                      }
                    >
                      {s.subscription_status}
                    </span>
                  </td>
                  <td className="p-3 text-black/70">
                    {s.trial_ends_at
                      ? new Date(s.trial_ends_at).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="p-3 text-right">{s.member_count}</td>
                  <td className="p-3 text-right">{s.horse_count}</td>
                  <td className="p-3 text-black/60">
                    {new Date(s.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {stables.length === 0 && (
          <p className="text-black/50 py-6 text-center">No stables yet.</p>
        )}
      </section>

      {/* Users table */}
      <section>
        <h2 className="font-serif text-lg text-black mb-4">Users (by stable)</h2>
        <div className="overflow-x-auto border border-black/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/10 bg-black/5">
                <th className="text-left p-3 font-medium">Name</th>
                <th className="text-left p-3 font-medium">Email</th>
                <th className="text-left p-3 font-medium">Role</th>
                <th className="text-left p-3 font-medium">Stable</th>
                <th className="text-left p-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-black/5 hover:bg-black/5">
                  <td className="p-3 font-medium">{u.full_name || "—"}</td>
                  <td className="p-3 text-black/80">{u.email || "—"}</td>
                  <td className="p-3 capitalize">{u.role}</td>
                  <td className="p-3 text-black/70">{u.stable_name || "—"}</td>
                  <td className="p-3 text-black/60">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && (
          <p className="text-black/50 py-6 text-center">No users yet.</p>
        )}
      </section>
    </div>
  );
}
