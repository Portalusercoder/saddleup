"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useProfile } from "@/components/providers/ProfileProvider";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import TableSkeleton from "@/components/ui/TableSkeleton";
import IncidentDetailDrawer from "@/components/dashboard/IncidentDetailDrawer";
import DashboardEmptyState from "@/components/ui/DashboardEmptyState";
import GuidedTourOverlay, { type GuidedTourStep } from "@/components/dashboard/GuidedTourOverlay";
import { usePageTour } from "@/components/dashboard/usePageTour";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface IncidentReport {
  id: string;
  incidentDate: string;
  description: string;
  witnesses?: string | null;
  location?: string | null;
  severity?: string | null;
  followUpNotes?: string | null;
  horseId: string;
  riderId?: string | null;
  riderName?: string | null;
  horse: { id: string; name: string } | null;
}

interface Horse {
  id: string;
  name: string;
}

interface Rider {
  id: string;
  name: string;
}

const formInput =
  "w-full px-4 py-3 bg-base border border-black/10 text-black placeholder-black/40 focus:border-black/30 focus:outline-none";
const labelClass = "block text-xs uppercase tracking-widest text-black/50 mb-2";
const btnPrimary =
  "px-4 py-2.5 bg-accent text-white font-medium text-sm uppercase tracking-wider hover:opacity-95 transition";
const btnSecondary =
  "px-4 py-2.5 border border-black/10 text-black text-sm uppercase tracking-wider hover:border-black/30 transition";

export default function IncidentsPage() {
  const { profile } = useProfile();
  const { t, lang } = useLanguage();
  const dateLocale = lang === "ar" ? "ar-SA" : "en-US";
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [horses, setHorses] = useState<Horse[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReport, setEditingReport] = useState<IncidentReport | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [form, setForm] = useState({
    incidentDate: "",
    horseId: "",
    riderId: "",
    riderName: "",
    description: "",
    witnesses: "",
    location: "",
    severity: "",
    followUpNotes: "",
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterHorseId, setFilterHorseId] = useState<string>("all");
  const [detailReport, setDetailReport] = useState<IncidentReport | null>(null);

  const isTrainerOrOwner =
    profile?.role === "trainer" || profile?.role === "owner";
  const { open: showTour, complete: completeTour } = usePageTour(
    "saddleup_tour_incidents_v1",
    !loading
  );

  const severityLabel = (sev: string) => {
    const map: Record<string, string> = {
      minor: t("dashboard.incidentsSeverityMinor"),
      moderate: t("dashboard.incidentsSeverityModerate"),
      serious: t("dashboard.incidentsSeveritySerious"),
    };
    return map[sev] ?? sev;
  };

  const tourSteps: GuidedTourStep[] = [
    {
      id: "create",
      title: t("dashboard.incidentsTourCreateTitle"),
      description: t("dashboard.incidentsTourCreateDesc"),
      selector: '[data-tour="incidents-create"]',
    },
    {
      id: "history",
      title: t("dashboard.incidentsTourHistoryTitle"),
      description: t("dashboard.incidentsTourHistoryDesc"),
      selector: '[data-tour="incidents-history"]',
    },
  ];

  const fetchReports = () => {
    fetch("/api/incident-reports")
      .then((r) => r.json())
      .then((data) => setReports(Array.isArray(data) ? data : []))
      .catch(() => setReports([]));
  };

  useEffect(() => {
    fetch("/api/incident-reports")
      .then((r) => r.json())
      .then((data) => setReports(Array.isArray(data) ? data : []))
      .catch(() => setReports([]))
      .finally(() => setLoading(false));

    if (isTrainerOrOwner) {
      Promise.all([
        fetch("/api/horses").then((r) => r.json()),
        fetch("/api/riders").then((r) => r.json()),
      ])
        .then(([hData, rData]) => {
          setHorses(Array.isArray(hData) ? hData.map((h: Horse) => ({ id: h.id, name: h.name })) : []);
          setRiders(Array.isArray(rData) ? rData.map((r: Rider) => ({ id: r.id, name: r.name })) : []);
        })
        .catch(() => {});
    }
  }, [isTrainerOrOwner]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(dateLocale, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const filteredReports = reports.filter((r) => {
    if (filterSeverity !== "all" && r.severity !== filterSeverity) return false;
    if (filterHorseId !== "all" && (r.horseId ?? r.horse?.id) !== filterHorseId) return false;
    return true;
  });

  const openAdd = () => {
    setEditingReport(null);
    setForm({
      incidentDate: new Date().toISOString().slice(0, 10),
      horseId: horses[0]?.id ?? "",
      riderId: "",
      riderName: "",
      description: "",
      witnesses: "",
      location: "",
      severity: "",
      followUpNotes: "",
    });
    setShowModal(true);
  };

  const openEdit = (r: IncidentReport) => {
    setEditingReport(r);
    setForm({
      incidentDate: r.incidentDate?.slice(0, 10) ?? "",
      horseId: r.horseId ?? r.horse?.id ?? "",
      riderId: r.riderId ?? "",
      riderName: r.riderName ?? "",
      description: r.description ?? "",
      witnesses: r.witnesses ?? "",
      location: r.location ?? "",
      severity: r.severity ?? "",
      followUpNotes: r.followUpNotes ?? "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.incidentDate || !form.horseId || !form.description.trim()) {
      setToast(t("dashboard.incidentsRequiredFields"));
      return;
    }
    setSubmitLoading(true);
    try {
      const payload = {
        incidentDate: form.incidentDate,
        horseId: form.horseId,
        riderId: form.riderId || undefined,
        riderName: form.riderName || undefined,
        description: form.description.trim(),
        witnesses: form.witnesses || undefined,
        location: form.location || undefined,
        severity: form.severity || undefined,
        followUpNotes: form.followUpNotes || undefined,
      };

      if (editingReport) {
        const res = await fetch(`/api/incident-reports/${editingReport.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed");
        setReports((prev) =>
          prev.map((x) => (x.id === editingReport.id ? data : x))
        );
        setToast(t("dashboard.incidentsUpdated"));
      } else {
        const res = await fetch("/api/incident-reports", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed");
        setReports((prev) => [data, ...prev]);
        setToast(t("dashboard.incidentsAdded"));
      }
      setTimeout(() => setToast(null), 3000);
      setShowModal(false);
    } catch (err) {
      setToast((err as Error).message);
      setTimeout(() => setToast(null), 4000);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("dashboard.incidentsConfirmDelete"))) return;
    try {
      const res = await fetch(`/api/incident-reports/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed");
      }
      setReports((prev) => prev.filter((x) => x.id !== id));
      setToast(t("dashboard.incidentsDeleted"));
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setToast((err as Error).message);
      setTimeout(() => setToast(null), 4000);
    }
  };

  if (profile?.role === "student") {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-2xl md:text-3xl font-normal text-black">
          {t("dashboard.incidentsPageTitle")}
        </h1>
        <p className="text-black/50">
          {t("dashboard.incidentsNoAccess")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <GuidedTourOverlay
        open={showTour}
        steps={tourSteps}
        onSkip={completeTour}
        onComplete={completeTour}
      />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-normal text-black">
            {t("dashboard.incidentsPageTitle")}
          </h1>
          <p className="text-black/60 text-sm max-w-xl mt-2">
            {t("dashboard.incidentsLead")}
          </p>
        </div>
        {isTrainerOrOwner && horses.length > 0 && (
          <button onClick={openAdd} className={btnPrimary} data-tour="incidents-create">
            {t("dashboard.incidentsReportCta")}
          </button>
        )}
      </div>

      {toast && (
        <div
          className="px-4 py-2 border border-black/10 text-black text-sm"
          role="alert"
        >
          {toast}
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={6} cols={4} />
      ) : reports.length === 0 ? (
        <DashboardEmptyState
          title={t("dashboard.incidentsEmptyTitle")}
          description={t("dashboard.incidentsEmpty")}
          actionLabel={isTrainerOrOwner && horses.length > 0 ? t("dashboard.incidentsReportFirst") : undefined}
          onAction={isTrainerOrOwner && horses.length > 0 ? openAdd : undefined}
        />
      ) : (
        <div className="border border-black/10 p-6 dark:border-white/10" data-tour="incidents-history">
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-4">
            <label className="text-sm text-black/60 dark:text-white/60">
              <span className="block text-xs uppercase tracking-widest mb-1">
                {t("dashboard.incidentsFilterSeverity")}
              </span>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-3 py-2 bg-base border border-black/10 text-black text-sm dark:border-white/15 dark:text-white"
              >
                <option value="all">{t("dashboard.incidentsFilterAll")}</option>
                <option value="minor">{t("dashboard.incidentsSeverityMinor")}</option>
                <option value="moderate">{t("dashboard.incidentsSeverityModerate")}</option>
                <option value="serious">{t("dashboard.incidentsSeveritySerious")}</option>
              </select>
            </label>
            <label className="text-sm text-black/60 dark:text-white/60">
              <span className="block text-xs uppercase tracking-widest mb-1">
                {t("dashboard.incidentsFilterHorse")}
              </span>
              <select
                value={filterHorseId}
                onChange={(e) => setFilterHorseId(e.target.value)}
                className="px-3 py-2 bg-base border border-black/10 text-black text-sm dark:border-white/15 dark:text-white"
              >
                <option value="all">{t("dashboard.incidentsFilterAll")}</option>
                {horses.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="space-y-3">
            {filteredReports.length === 0 ? (
              <p className="text-black/50 text-sm dark:text-white/50">
                {t("dashboard.incidentsFilterEmpty")}
              </p>
            ) : (
              filteredReports.map((r) => (
              <div
                key={r.id}
                className="border border-black/10 px-4 py-4 hover:border-black/20 transition cursor-pointer dark:border-white/10"
                onClick={() => setDetailReport(r)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setDetailReport(r);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-black dark:text-white">
                        {formatDate(r.incidentDate)}
                      </span>
                      {r.horse && (
                        <span className="text-black/70 text-sm dark:text-white/70">{r.horse.name}</span>
                      )}
                      {r.severity && (
                        <span
                          className={`text-xs px-2 py-0.5 uppercase tracking-wider ${
                            r.severity === "serious"
                              ? "bg-amber-500/20 text-amber-700 dark:text-amber-400"
                              : r.severity === "moderate"
                                ? "bg-black/5 text-black/80 dark:bg-white/10 dark:text-white/80"
                                : "text-black/50 dark:text-white/50"
                          }`}
                        >
                          {severityLabel(r.severity)}
                        </span>
                      )}
                    </div>
                    <p className="text-black/80 text-sm mt-2 line-clamp-2 dark:text-white/80">
                      {r.description}
                    </p>
                  </div>
                  {isTrainerOrOwner && (
                    <div className="flex gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => openEdit(r)}
                        className="text-black hover:underline text-sm uppercase tracking-wider dark:text-white"
                      >
                        {t("dashboard.teamRidersEdit")}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(r.id)}
                        className="text-black/60 hover:text-black text-sm uppercase tracking-wider dark:text-white/60"
                      >
                        {t("dashboard.teamRidersDelete")}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
            )}
          </div>
        </div>
      )}

      {detailReport ? (
        <IncidentDetailDrawer
          report={detailReport}
          formatDate={formatDate}
          severityLabel={severityLabel}
          onClose={() => setDetailReport(null)}
          onEdit={
            isTrainerOrOwner
              ? () => {
                  setDetailReport(null);
                  openEdit(detailReport);
                }
              : undefined
          }
          labels={{
            title: t("dashboard.incidentsDetailTitle"),
            close: t("common.close"),
            date: t("dashboard.incidentsLabelDate"),
            horse: t("dashboard.bookingsLabelHorse"),
            rider: t("dashboard.bookingsDetailRider"),
            location: t("dashboard.incidentsLabelLocation"),
            severity: t("dashboard.incidentsLabelSeverity"),
            description: t("dashboard.incidentsLabelDescription"),
            witnesses: t("dashboard.incidentsLabelWitnesses"),
            followUp: t("dashboard.incidentsLabelFollowUp"),
            edit: t("dashboard.teamRidersEdit"),
            none: "—",
          }}
        />
      ) : null}

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto sm:items-center sm:py-8">
          <div className="bg-base border border-black/10 max-w-lg w-full p-4 sm:p-6 my-4 sm:my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="font-serif text-xl text-black mb-6">
              {editingReport ? t("dashboard.incidentsModalEdit") : t("dashboard.incidentsModalAdd")}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>{t("dashboard.incidentsLabelDate")}</label>
                <input
                  type="date"
                  value={form.incidentDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, incidentDate: e.target.value }))
                  }
                  required
                  className={formInput}
                />
              </div>
              <div>
                <label className={labelClass}>{t("dashboard.incidentsLabelHorse")}</label>
                <select
                  value={form.horseId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, horseId: e.target.value }))
                  }
                  required
                  className={formInput}
                >
                  <option value="">{t("dashboard.bookingsSelectHorse")}</option>
                  {horses.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>{t("dashboard.incidentsLabelRiderOptional")}</label>
                <select
                  value={form.riderId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, riderId: e.target.value }))
                  }
                  className={formInput}
                >
                  <option value="">{t("dashboard.incidentsRiderSelectHint")}</option>
                  {riders.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>
                  {t("dashboard.incidentsRiderNameExtra")}
                </label>
                <input
                  type="text"
                  value={form.riderName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, riderName: e.target.value }))
                  }
                  className={formInput}
                  placeholder={t("dashboard.incidentsRiderNamePlaceholder")}
                />
              </div>
              <div>
                <label className={labelClass}>{t("dashboard.incidentsLabelDescription")}</label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  required
                  rows={4}
                  className={`${formInput} resize-none`}
                  placeholder={t("dashboard.incidentsDescriptionPlaceholder")}
                />
              </div>
              <div>
                <label className={labelClass}>{t("dashboard.incidentsLabelWitnesses")}</label>
                <input
                  type="text"
                  value={form.witnesses}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, witnesses: e.target.value }))
                  }
                  className={formInput}
                  placeholder={t("dashboard.incidentsWitnessesPlaceholder")}
                />
              </div>
              <div>
                <label className={labelClass}>{t("dashboard.incidentsLabelLocation")}</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, location: e.target.value }))
                  }
                  className={formInput}
                  placeholder={t("dashboard.incidentsLocationPlaceholder")}
                />
              </div>
              <div>
                <label className={labelClass}>{t("dashboard.incidentsLabelSeverity")}</label>
                <select
                  value={form.severity}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, severity: e.target.value }))
                  }
                  className={formInput}
                >
                  <option value="">{t("dashboard.incidentsSeveritySelect")}</option>
                  <option value="minor">{t("dashboard.incidentsSeverityMinor")}</option>
                  <option value="moderate">{t("dashboard.incidentsSeverityModerate")}</option>
                  <option value="serious">{t("dashboard.incidentsSeveritySerious")}</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>{t("dashboard.incidentsLabelFollowUp")}</label>
                <textarea
                  value={form.followUpNotes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, followUpNotes: e.target.value }))
                  }
                  rows={2}
                  className={`${formInput} resize-none`}
                  placeholder={t("dashboard.incidentsFollowUpPlaceholder")}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={btnSecondary}
                >
                  {t("dashboard.bookingsCancel")}
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className={`${btnPrimary} disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                >
                  {submitLoading ? (
                    <>
                      <LoadingSpinner size={16} className="text-black" />
                      {editingReport ? t("dashboard.incidentsSaving") : t("dashboard.incidentsAdding")}
                    </>
                  ) : (
                    editingReport ? t("dashboard.incidentsSave") : t("dashboard.incidentsReportSubmit")
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
