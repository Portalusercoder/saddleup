"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useProfile } from "@/components/providers/ProfileProvider";
import UpgradePlanModal from "@/components/dashboard/UpgradePlanModal";
import { IdCardUpload } from "@/components/dashboard/IdCardUpload";
import TeamMemberAvatar from "@/components/ui/TeamMemberAvatar";
import HorseStatusPill from "@/components/ui/HorseStatusPill";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import TableSkeleton from "@/components/ui/TableSkeleton";
import GuidedTourOverlay, { type GuidedTourStep } from "@/components/dashboard/GuidedTourOverlay";
import { usePageTour } from "@/components/dashboard/usePageTour";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface Rider {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  level: string | null;
  goals: string | null;
  notes: string | null;
  instructor_feedback: string | null;
  id_card_url?: string | null;
  last_session_at?: string | null;
}

const formInput = "w-full px-4 py-3 bg-base border border-black/10 text-black placeholder-black/40 focus:border-black/30 focus:outline-none";
const labelClass = "block text-xs uppercase tracking-widest text-black/50 mb-2";
const btnPrimary = "px-4 py-2.5 bg-accent text-white font-medium text-sm uppercase tracking-wider hover:opacity-95 transition";
const btnSecondary = "px-4 py-2.5 border border-black/10 text-black text-sm uppercase tracking-wider hover:border-black/30 transition";

export default function TeamRidersPage() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingRider, setEditingRider] = useState<Rider | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    level: "beginner",
    goals: "",
    notes: "",
    instructor_feedback: "",
  });
  const ridersBaseUrl = "/dashboard/team/riders";
  const [subscription, setSubscription] = useState<{ canAddRider: boolean } | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const { profile } = useProfile();
  const { t, lang } = useLanguage();
  const dateLocale = lang === "ar" ? "ar-SA" : "en-US";
  const { open: showTour, complete: completeTour } = usePageTour(
    "saddleup_tour_team_v1",
    !loading && profile?.role !== "student"
  );

  const tourSteps: GuidedTourStep[] = [
    {
      id: "search",
      title: t("dashboard.teamRidersTourSearchTitle"),
      description: t("dashboard.teamRidersTourSearchDesc"),
      selector: '[data-tour="team-search"]',
    },
    {
      id: "add",
      title: t("dashboard.teamRidersTourAddTitle"),
      description: t("dashboard.teamRidersTourAddDesc"),
      selector: '[data-tour="team-add-rider"]',
    },
    {
      id: "list",
      title: t("dashboard.teamRidersTourListTitle"),
      description: t("dashboard.teamRidersTourListDesc"),
      selector: '[data-tour="team-riders-table"]',
    },
  ];

  const fetchRiders = () => {
    fetch("/api/riders")
      .then((res) => res.json())
      .then((data) => setRiders(Array.isArray(data) ? data : []))
      .catch(() => setRiders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!profile) return;
    if (profile.role === "student") return;
    fetchRiders();
    fetch("/api/subscription")
      .then((r) => r.json())
      .then((d) => setSubscription(d))
      .catch(() => setSubscription(null));
  }, [profile]);

  useEffect(() => {
    const handler = () => fetchRiders();
    window.addEventListener("team-refresh", handler);
    return () => window.removeEventListener("team-refresh", handler);
  }, []);

  const filtered = riders.filter(
    (r) =>
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.email?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    if (subscription && !subscription.canAddRider) {
      setShowUpgradeModal(true);
      return;
    }
    setEditingRider(null);
    setForm({
      name: "",
      email: "",
      phone: "",
      level: "beginner",
      goals: "",
      notes: "",
      instructor_feedback: "",
    });
    setShowModal(true);
  };

  const openEdit = (r: Rider) => {
    setEditingRider(r);
    setForm({
      name: r.name || "",
      email: r.email || "",
      phone: r.phone || "",
      level: r.level || "beginner",
      goals: r.goals || "",
      notes: r.notes || "",
      instructor_feedback: r.instructor_feedback || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const url = editingRider ? `/api/riders/${editingRider.id}` : "/api/riders";
      const method = editingRider ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "LIMIT_REACHED") {
          setShowModal(false);
          setShowUpgradeModal(true);
        } else {
          setToast(data.error || t("dashboard.teamRidersToastWrong"));
        }
        return;
      }
      setToast(editingRider ? t("dashboard.teamRidersToastUpdated") : t("dashboard.teamRidersToastAdded"));
      setShowModal(false);
      fetchRiders();
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("dashboard.teamRidersConfirmDelete"))) return;
    const res = await fetch(`/api/riders/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setToast(data.error || t("dashboard.teamRidersToastDeleteFailed"));
      return;
    }
    setToast(t("dashboard.teamRidersToastDeleted"));
    fetchRiders();
  };

  const levelLabel = (level: string | null) => {
    const map: Record<string, string> = {
      beginner: t("dashboard.teamRidersLevelBeginner"),
      intermediate: t("dashboard.teamRidersLevelIntermediate"),
      advanced: t("dashboard.teamRidersLevelAdvanced"),
    };
    return level ? map[level] ?? level : null;
  };

  const formatLastSession = (iso: string | null | undefined) => {
    if (!iso) return t("dashboard.teamRidersNoSession");
    return new Date(iso).toLocaleDateString(dateLocale, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const iconBtn =
    "inline-flex h-9 w-9 items-center justify-center border border-black/15 text-black/70 hover:bg-black/[0.04] dark:border-white/20 dark:text-white/70";

  return (
    <>
      <GuidedTourOverlay
        open={showTour}
        steps={tourSteps}
        onSkip={completeTour}
        onComplete={completeTour}
      />
      <div className="sticky top-0 z-10 -mx-1 px-1 py-3 mb-2 bg-base/95 backdrop-blur-sm border-b border-black/10 dark:border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {subscription && !subscription.canAddRider && (
            <Link
              href="/dashboard/plans"
              className="text-black/60 hover:text-black text-xs uppercase tracking-wider dark:text-white/60"
            >
              {t("dashboard.teamRidersUpgradeLink")}
            </Link>
          )}
          <div className="flex flex-col sm:flex-row gap-2 sm:ml-auto w-full sm:w-auto">
            <input
              type="search"
              placeholder={t("dashboard.teamRidersSearchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-tour="team-search"
              className="w-full sm:min-w-[280px] px-4 py-2.5 bg-base border border-black/10 text-black placeholder-black/40 focus:border-black/30 focus:outline-none text-sm dark:border-white/15 dark:text-white"
            />
            <button onClick={openAdd} className={`${btnPrimary} shrink-0`} data-tour="team-add-rider">
              {t("dashboard.teamRidersAdd")}
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div className="px-4 py-2 border border-black/10 text-black text-sm mb-4 dark:border-white/15 dark:text-white" role="alert">
          {toast}
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={6} cols={3} />
      ) : filtered.length === 0 ? (
        <p className="text-black/50 dark:text-white/50">
          {search ? t("dashboard.teamRidersEmptySearch") : t("dashboard.teamRidersEmpty")}
        </p>
      ) : (
        <div className="border border-black/10 overflow-hidden dark:border-white/10" data-tour="team-riders-table">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-black/10 text-black/50 text-xs uppercase tracking-widest dark:border-white/10 dark:text-white/50">
              <tr>
                <th className="px-6 py-4 font-medium">{t("dashboard.teamRidersColName")}</th>
                <th className="px-6 py-4 font-medium">{t("dashboard.teamRidersColLevel")}</th>
                <th className="px-6 py-4 font-medium">{t("dashboard.teamRidersColLastSession")}</th>
                <th className="px-6 py-4 font-medium w-32">{t("dashboard.teamRidersColActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 dark:divide-white/10">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <TeamMemberAvatar name={r.name} />
                      <div className="min-w-0">
                        <Link
                          href={`${ridersBaseUrl}/${r.id}`}
                          className="text-black font-medium hover:underline dark:text-white block truncate"
                        >
                          {r.name}
                        </Link>
                        <p className="text-black/50 text-xs truncate dark:text-white/50">
                          {r.email || "—"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {levelLabel(r.level) ? (
                      <HorseStatusPill label={levelLabel(r.level)!} tone="accent" />
                    ) : (
                      <span className="text-black/40 dark:text-white/40">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-black/60 dark:text-white/60">
                    {formatLastSession(r.last_session_at)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1.5 items-center">
                      <IdCardUpload
                        type="rider"
                        id={r.id}
                        idCardUrl={r.id_card_url}
                        canUpload={profile?.role === "owner"}
                        onSuccess={fetchRiders}
                        iconOnly
                      />
                      <button
                        type="button"
                        onClick={() => openEdit(r)}
                        className={iconBtn}
                        title={t("dashboard.teamRidersEdit")}
                        aria-label={t("dashboard.teamRidersEdit")}
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(r.id)}
                        className={iconBtn}
                        title={t("dashboard.teamRidersDelete")}
                        aria-label={t("dashboard.teamRidersDelete")}
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto sm:items-center">
          <div className="bg-base border border-black/10 max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="font-serif text-xl text-black mb-6">
              {editingRider ? t("dashboard.teamRidersModalEdit") : t("dashboard.teamRidersModalAdd")}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>{t("dashboard.teamRidersLabelName")}</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  className={formInput}
                />
              </div>
              <div>
                <label className={labelClass}>{t("common.email")}</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className={formInput}
                />
              </div>
              <div>
                <label className={labelClass}>{t("dashboard.teamRidersLabelPhone")}</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className={formInput}
                />
              </div>
              <div>
                <label className={labelClass}>{t("dashboard.teamRidersColLevel")}</label>
                <select
                  value={form.level}
                  onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
                  className={formInput}
                >
                  <option value="beginner">{t("dashboard.teamRidersLevelBeginner")}</option>
                  <option value="intermediate">{t("dashboard.teamRidersLevelIntermediate")}</option>
                  <option value="advanced">{t("dashboard.teamRidersLevelAdvanced")}</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>{t("dashboard.teamRidersLabelGoals")}</label>
                <textarea
                  value={form.goals}
                  onChange={(e) => setForm((f) => ({ ...f, goals: e.target.value }))}
                  rows={2}
                  className={`${formInput} resize-none`}
                />
              </div>
              <div>
                <label className={labelClass}>{t("dashboard.teamRidersLabelNotes")}</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  className={`${formInput} resize-none`}
                />
              </div>
              {editingRider && (
                <div>
                  <label className={labelClass}>{t("dashboard.teamRidersLabelInstructorFeedback")}</label>
                  <textarea
                    value={form.instructor_feedback}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, instructor_feedback: e.target.value }))
                    }
                    rows={2}
                    className={`${formInput} resize-none`}
                  />
                </div>
              )}
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
                      {editingRider ? t("dashboard.teamRidersSaving") : t("dashboard.teamRidersAdding")}
                    </>
                  ) : (
                    editingRider ? t("dashboard.teamRidersSave") : t("dashboard.teamRidersAdd")
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        type="riders"
      />
    </>
  );
}
