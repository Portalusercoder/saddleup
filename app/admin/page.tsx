"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AdminStable, AdminOwner } from "@/app/api/admin/overview/route";
import PageLoader from "@/components/ui/PageLoader";
import { useLanguage } from "@/components/providers/LanguageProvider";

type Overview = {
  stables: AdminStable[];
  owners: AdminOwner[];
  subscriptionCounts: Record<string, number>;
  totalStables: number;
};

type AuditLogRow = {
  id: string;
  action: string;
  stable_name: string | null;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
};

function downloadCsv(filename: string, rows: string[][], headers: string[]) {
  const line = (row: string[]) =>
    row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",");
  const csv = [headers.join(","), ...rows.map((r) => line(r))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function AdminPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const dateLocale = lang === "ar" ? "ar-SA" : "en-US";
  const [data, setData] = useState<Overview | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [ownerSearch, setOwnerSearch] = useState("");
  const [createStableName, setCreateStableName] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createResult, setCreateResult] = useState<{ name: string; inviteCode: string; inviteUrl: string } | null>(null);
  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      trialing: t("dashboard.adminStatusTrialing"),
      active: t("dashboard.adminStatusActive"),
      expired: t("dashboard.adminStatusExpired"),
      past_due: t("dashboard.adminStatusPastDue"),
      cancelled: t("dashboard.adminStatusCancelled"),
    };
    return map[status] ?? status;
  };

  useEffect(() => {
    fetch("/api/admin/overview")
      .then((res) => {
        if (res.status === 401) {
          router.replace("/login?redirect=/admin");
          return null;
        }
        if (res.status === 403) {
          setError(t("dashboard.adminAccessDenied"));
          return null;
        }
        return res.json();
      })
      .then((json) => {
        if (json) setData(json);
        setLoading(false);
      })
      .catch(() => {
        setError(t("dashboard.adminLoadFailed"));
        setLoading(false);
      });
  }, [router, t]);

  useEffect(() => {
    if (!data) return;
    fetch("/api/admin/audit-logs?limit=30")
      .then((r) => r.json())
      .then((json) => (json.logs ? setAuditLogs(json.logs) : []))
      .catch(() => {});
  }, [data]);

  const filteredStables = useMemo(() => {
    if (!data?.stables) return [];
    if (statusFilter === "all") return data.stables;
    return data.stables.filter((s) => s.subscription_status === statusFilter);
  }, [data?.stables, statusFilter]);

  const filteredOwners = useMemo(() => {
    if (!data?.owners) return [];
    const q = ownerSearch.trim().toLowerCase();
    if (!q) return data.owners;
    return data.owners.filter(
      (o) =>
        (o.owner_email ?? "").toLowerCase().includes(q) ||
        (o.owner_name ?? "").toLowerCase().includes(q) ||
        (o.stable_name ?? "").toLowerCase().includes(q)
    );
  }, [data?.owners, ownerSearch]);

  const exportStablesCsv = () => {
    if (!data) return;
    const headers = [
      t("dashboard.adminColName"),
      t("dashboard.adminColTier"),
      t("dashboard.adminColStatus"),
      t("dashboard.adminColTrialEnds"),
      t("dashboard.adminColMembers"),
      t("dashboard.adminColHorses"),
      t("dashboard.adminColCreated"),
      t("dashboard.adminColStripeId"),
    ];
    const rows = data.stables.map((s) => [
      s.name,
      s.subscription_tier,
      s.subscription_status,
      s.trial_ends_at ? new Date(s.trial_ends_at).toLocaleDateString(dateLocale) : "",
      String(s.member_count),
      String(s.horse_count),
      new Date(s.created_at).toLocaleDateString(dateLocale),
      s.stripe_customer_id ?? "",
    ]);
    downloadCsv("stables.csv", rows, headers);
  };

  const exportOwnersCsv = () => {
    if (!data) return;
    const headers = [
      t("dashboard.adminColStable"),
      t("dashboard.adminColOwnerName"),
      t("dashboard.adminColOwnerEmail"),
    ];
    const rows = data.owners.map((o) => [
      o.stable_name,
      o.owner_name ?? "",
      o.owner_email ?? "",
    ]);
    downloadCsv("stables-and-owners.csv", rows, headers);
  };

  const createEnterpriseStable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createStableName.trim()) return;
    setCreateError(null);
    setCreateResult(null);
    setCreateLoading(true);
    try {
      const res = await fetch("/api/admin/stables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: createStableName.trim() }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCreateError(json.error || t("dashboard.adminCreateFailed"));
        setCreateLoading(false);
        return;
      }
      setCreateResult({
        name: json.name,
        inviteCode: json.inviteCode,
        inviteUrl: json.inviteUrl,
      });
      setCreateStableName("");
      if (data) {
        fetch("/api/admin/overview")
          .then((r) => r.json())
          .then((d) => setData(d))
          .catch(() => {});
      }
    } catch {
      setCreateError(t("dashboard.noticeEmailsSomethingWrong"));
    } finally {
      setCreateLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="p-8">
        <PageLoader minHeight="min-h-[55vh]" message={t("common.loading")} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="text-red-600">{error}</p>
        <Link href="/dashboard" className="mt-4 inline-block text-sm underline">
          {t("dashboard.adminBackToDashboard")}
        </Link>
      </div>
    );
  }

  if (!data) return null;

  const { subscriptionCounts, totalStables } = data;

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
        <h1 className="font-serif text-2xl md:text-3xl text-black">
          {t("dashboard.adminPageTitle")}
        </h1>
        <Link
          href="/dashboard"
          className="text-sm uppercase tracking-wider text-black/60 hover:text-black"
        >
          {t("dashboard.adminBackDashboardShort")}
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="border border-black/10 p-4">
          <p className="text-xs uppercase tracking-wider text-black/50">{t("dashboard.adminCardStables")}</p>
          <p className="text-2xl font-semibold text-black">{totalStables}</p>
        </div>
        <div className="border border-black/10 p-4">
          <p className="text-xs uppercase tracking-wider text-black/50">{t("dashboard.adminCardPastDue")}</p>
          <p className="text-2xl font-semibold text-black">{subscriptionCounts.past_due ?? 0}</p>
        </div>
        <div className="border border-black/10 p-4">
          <p className="text-xs uppercase tracking-wider text-black/50">{t("dashboard.adminCardTrialing")}</p>
          <p className="text-2xl font-semibold text-black">{subscriptionCounts.trialing ?? 0}</p>
        </div>
        <div className="border border-black/10 p-4">
          <p className="text-xs uppercase tracking-wider text-black/50">{t("dashboard.adminCardActive")}</p>
          <p className="text-2xl font-semibold text-black">{subscriptionCounts.active ?? 0}</p>
        </div>
      </div>

      {/* Create enterprise stable */}
      <section className="mb-12 border border-black/10 p-6">
        <h2 className="font-serif text-lg text-black mb-2">{t("dashboard.adminCreateTitle")}</h2>
        <p className="text-black/60 text-sm mb-4">
          {t("dashboard.adminCreateLead")}
        </p>
        <form onSubmit={createEnterpriseStable} className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="createStableName" className="block text-xs uppercase tracking-widest text-black/50 mb-1">
              {t("dashboard.adminCreateStableName")}
            </label>
            <input
              id="createStableName"
              type="text"
              value={createStableName}
              onChange={(e) => setCreateStableName(e.target.value)}
              placeholder={t("dashboard.adminCreatePlaceholder")}
              className="px-3 py-2 border border-black/20 bg-base text-black text-sm min-w-[220px]"
            />
          </div>
          <button
            type="submit"
            disabled={createLoading || !createStableName.trim()}
            className="px-4 py-2 bg-accent text-white text-sm font-medium uppercase tracking-wider hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createLoading ? t("dashboard.adminCreating") : t("dashboard.adminCreateButton")}
          </button>
        </form>
        {createError && <p className="text-red-600 text-sm mt-2">{createError}</p>}
        {createResult && (
          <div className="mt-4 p-4 bg-black/5 border border-black/10">
            <p className="text-black/70 text-sm mb-2">
              {t("dashboard.adminCreatedForCustomer", { name: createResult.name })}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                readOnly
                value={createResult.inviteUrl}
                className="flex-1 min-w-[200px] px-3 py-2 border border-black/10 bg-base text-black text-sm"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(createResult.inviteUrl)}
                className="px-3 py-2 border border-black/20 text-black text-sm uppercase tracking-wider hover:bg-black/5"
              >
                {t("dashboard.adminCopyLink")}
              </button>
            </div>
            <p className="text-black/50 text-xs mt-2">
              {t("dashboard.adminInviteCode")} <strong className="text-black/70">{createResult.inviteCode}</strong>
              <button
                type="button"
                onClick={() => copyToClipboard(createResult.inviteCode)}
                className="ml-2 text-black/60 hover:text-black text-xs underline"
              >
                {t("dashboard.adminCopyCode")}
              </button>
            </p>
          </div>
        )}
      </section>

      {/* Stables table */}
      <section className="mb-12">
        <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
          <h2 className="font-serif text-lg text-black">{t("dashboard.adminStablesTitle")}</h2>
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-black/20 bg-base text-black text-sm"
            >
              <option value="all">{t("dashboard.adminStatusAll")}</option>
              <option value="trialing">{t("dashboard.adminStatusTrialing")}</option>
              <option value="active">{t("dashboard.adminStatusActive")}</option>
              <option value="expired">{t("dashboard.adminStatusExpired")}</option>
              <option value="past_due">{t("dashboard.adminStatusPastDue")}</option>
              <option value="cancelled">{t("dashboard.adminStatusCancelled")}</option>
            </select>
            <button
              type="button"
              onClick={exportStablesCsv}
              className="px-3 py-1.5 border border-black/20 text-black text-sm hover:bg-black/5 uppercase tracking-wider"
            >
              {t("dashboard.adminExportCsv")}
            </button>
          </div>
        </div>
        <div className="overflow-x-auto border border-black/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/10 bg-black/5">
                <th className="text-left p-3 font-medium">{t("dashboard.adminColName")}</th>
                <th className="text-left p-3 font-medium">{t("dashboard.adminColTier")}</th>
                <th className="text-left p-3 font-medium">{t("dashboard.adminColStatus")}</th>
                <th className="text-left p-3 font-medium">{t("dashboard.adminColTrialEnds")}</th>
                <th className="text-right p-3 font-medium">{t("dashboard.adminColMembers")}</th>
                <th className="text-right p-3 font-medium">{t("dashboard.adminColHorses")}</th>
                <th className="text-left p-3 font-medium">{t("dashboard.adminColCreated")}</th>
                <th className="text-left p-3 font-medium">{t("dashboard.adminColStripe")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredStables.map((s) => (
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
                            : s.subscription_status === "past_due"
                              ? "text-red-700"
                              : "text-black/70"
                      }
                    >
                      {statusLabel(s.subscription_status)}
                    </span>
                  </td>
                  <td className="p-3 text-black/70">
                    {s.trial_ends_at
                      ? new Date(s.trial_ends_at).toLocaleDateString(dateLocale)
                      : "—"}
                  </td>
                  <td className="p-3 text-right">{s.member_count}</td>
                  <td className="p-3 text-right">{s.horse_count}</td>
                  <td className="p-3 text-black/60">
                    {new Date(s.created_at).toLocaleDateString(dateLocale)}
                  </td>
                  <td className="p-3">
                    {s.stripe_customer_id ? (
                      <a
                        href={`https://dashboard.stripe.com/customers/${s.stripe_customer_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-black/70 hover:text-black underline"
                      >
                        {t("dashboard.adminView")}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredStables.length === 0 && (
          <p className="text-black/50 py-6 text-center">
            {statusFilter === "all"
              ? t("dashboard.adminNoStables")
              : t("dashboard.adminNoStablesWithStatus", { status: statusFilter })}
          </p>
        )}
      </section>

      {/* Stables & owners (contact only – no internal stable data) */}
      <section className="mb-12">
        <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
          <h2 className="font-serif text-lg text-black">{t("dashboard.adminOwnersTitle")}</h2>
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="search"
              placeholder={t("dashboard.adminOwnersSearchPlaceholder")}
              value={ownerSearch}
              onChange={(e) => setOwnerSearch(e.target.value)}
              className="px-3 py-1.5 border border-black/20 bg-base text-black text-sm min-w-[200px]"
            />
            <button
              type="button"
              onClick={exportOwnersCsv}
              className="px-3 py-1.5 border border-black/20 text-black text-sm hover:bg-black/5 uppercase tracking-wider"
            >
              {t("dashboard.adminExportCsv")}
            </button>
          </div>
        </div>
        <div className="overflow-x-auto border border-black/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/10 bg-black/5">
                <th className="text-left p-3 font-medium">{t("dashboard.adminColStable")}</th>
                <th className="text-left p-3 font-medium">{t("dashboard.adminColOwnerName")}</th>
                <th className="text-left p-3 font-medium">{t("dashboard.adminColOwnerEmail")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredOwners.map((o) => (
                <tr key={o.stable_id} className="border-b border-black/5 hover:bg-black/5">
                  <td className="p-3 font-medium">{o.stable_name}</td>
                  <td className="p-3 text-black/80">{o.owner_name || "—"}</td>
                  <td className="p-3 text-black/80">{o.owner_email || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredOwners.length === 0 && (
          <p className="text-black/50 py-6 text-center">
            {ownerSearch ? t("dashboard.adminNoOwnersMatch") : t("dashboard.adminNoStables")}
          </p>
        )}
      </section>

      {/* Platform events only (subscription, deletion, reactivation – no stable-internal data) */}
      <section>
        <h2 className="font-serif text-lg text-black mb-4">{t("dashboard.adminEventsTitle")}</h2>
        <div className="overflow-x-auto border border-black/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/10 bg-black/5">
                <th className="text-left p-3 font-medium">{t("dashboard.adminColTime")}</th>
                <th className="text-left p-3 font-medium">{t("dashboard.adminColAction")}</th>
                <th className="text-left p-3 font-medium">{t("dashboard.adminColStable")}</th>
                <th className="text-left p-3 font-medium">{t("dashboard.adminColEntity")}</th>
                <th className="text-left p-3 font-medium">{t("dashboard.adminColDetails")}</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((l) => (
                <tr key={l.id} className="border-b border-black/5 hover:bg-black/5">
                  <td className="p-3 text-black/60 whitespace-nowrap">
                    {new Date(l.created_at).toLocaleString(dateLocale)}
                  </td>
                  <td className="p-3 font-medium">{l.action}</td>
                  <td className="p-3 text-black/70">{l.stable_name || "—"}</td>
                  <td className="p-3 text-black/70">
                    {l.entity_type && l.entity_id
                      ? `${l.entity_type} ${l.entity_id.slice(0, 8)}…`
                      : "—"}
                  </td>
                  <td className="p-3 text-black/60 max-w-[200px] truncate">
                    {l.details && Object.keys(l.details).length > 0
                      ? JSON.stringify(l.details)
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {auditLogs.length === 0 && (
          <p className="text-black/50 py-6 text-center">{t("dashboard.adminNoAuditEntries")}</p>
        )}
      </section>
    </div>
  );
}
