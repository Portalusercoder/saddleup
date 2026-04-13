"use client";

import { useEffect, useState } from "react";
import { useProfile } from "@/components/providers/ProfileProvider";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import GuidedTourOverlay, { type GuidedTourStep } from "@/components/dashboard/GuidedTourOverlay";
import { usePageTour } from "@/components/dashboard/usePageTour";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface Worker {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string;
  notes: string | null;
}

const formInput = "w-full px-4 py-3 bg-base border border-black/10 text-black placeholder-black/40 focus:border-black/30 focus:outline-none";
const labelClass = "block text-xs uppercase tracking-widest text-black/50 mb-2";
const btnPrimary = "px-4 py-2.5 bg-accent text-white font-medium text-sm uppercase tracking-wider hover:opacity-95 transition";
const btnSecondary = "px-4 py-2.5 border border-black/10 text-black text-sm uppercase tracking-wider hover:border-black/30 transition";

export default function TeamWorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [workerForm, setWorkerForm] = useState({ name: "", email: "", phone: "", role: "", notes: "" });
  const [toast, setToast] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const { profile } = useProfile();
  const { t } = useLanguage();
  const { open: showTour, complete: completeTour } = usePageTour(
    "saddleup_tour_team_workers_v1",
    Boolean(profile) && profile?.role === "owner"
  );
  const tourSteps: GuidedTourStep[] = [
    {
      id: "worker-add",
      title: t("dashboard.teamWorkersTourAddTitle"),
      description: t("dashboard.teamWorkersTourAddDesc"),
      selector: '[data-tour="workers-add"]',
    },
    {
      id: "worker-list",
      title: t("dashboard.teamWorkersTourListTitle"),
      description: t("dashboard.teamWorkersTourListDesc"),
      selector: '[data-tour="workers-list"]',
    },
  ];

  const fetchWorkers = () => {
    fetch("/api/workers")
      .then((r) => r.json())
      .then((d) => setWorkers(Array.isArray(d) ? d : []))
      .catch(() => setWorkers([]));
  };

  useEffect(() => {
    if (!profile || profile.role !== "owner") return;
    fetchWorkers();
  }, [profile]);

  if (profile?.role !== "owner") {
    return (
      <p className="text-black/50">{t("dashboard.teamWorkersOwnerOnly")}</p>
    );
  }

  return (
    <>
      <GuidedTourOverlay
        open={showTour}
        steps={tourSteps}
        onSkip={completeTour}
        onComplete={completeTour}
      />
      <p className="text-black/50 text-sm mb-4">
        {t("dashboard.teamWorkersLead")}
      </p>

      <button
        onClick={() => {
          setEditingWorker(null);
          setWorkerForm({ name: "", email: "", phone: "", role: "", notes: "" });
          setShowModal(true);
        }}
        className={btnPrimary}
        data-tour="workers-add"
      >
        {t("dashboard.teamWorkersAdd")}
      </button>

      {toast && (
        <div className="px-4 py-2 border border-black/10 text-black text-sm mt-4" role="alert">
          {toast}
        </div>
      )}

      {workers.length > 0 && (
        <div className="mt-6 border border-black/10 overflow-hidden" data-tour="workers-list">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-black/10 text-black/50 text-xs uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4 font-medium">{t("dashboard.teamWorkersColName")}</th>
                <th className="px-6 py-4 font-medium">{t("dashboard.teamWorkersColRole")}</th>
                <th className="px-6 py-4 font-medium">{t("dashboard.teamWorkersColContact")}</th>
                <th className="px-6 py-4 font-medium w-32">{t("dashboard.teamWorkersColActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {workers.map((w) => (
                <tr key={w.id} className="hover:bg-black/[0.02]">
                  <td className="px-6 py-4 font-medium text-black">{w.name}</td>
                  <td className="px-6 py-4 text-black/60">{w.role}</td>
                  <td className="px-6 py-4 text-black/60">{w.email || w.phone || "—"}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setEditingWorker(w);
                          setWorkerForm({
                            name: w.name,
                            email: w.email || "",
                            phone: w.phone || "",
                            role: w.role,
                            notes: w.notes || "",
                          });
                          setShowModal(true);
                        }}
                        className="text-black hover:underline text-sm uppercase tracking-wider"
                      >
                        {t("dashboard.teamWorkersEdit")}
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm(t("dashboard.teamWorkersRemoveConfirm", { name: w.name }))) return;
                          const res = await fetch(`/api/workers/${w.id}`, { method: "DELETE" });
                          if (!res.ok) {
                            const d = await res.json();
                            setToast(d.error || t("dashboard.teamWorkersFailed"));
                            return;
                          }
                          setToast(t("dashboard.teamWorkersRemoved"));
                          fetchWorkers();
                        }}
                        className="text-black/60 hover:text-black text-sm uppercase tracking-wider"
                      >
                        {t("dashboard.teamWorkersDelete")}
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
              {editingWorker ? t("dashboard.teamWorkersModalEdit") : t("dashboard.teamWorkersModalAdd")}
            </h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSubmitLoading(true);
                try {
                  const url = editingWorker ? `/api/workers/${editingWorker.id}` : "/api/workers";
                  const method = editingWorker ? "PUT" : "POST";
                  const res = await fetch(url, {
                    method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(workerForm),
                  });
                  const data = await res.json();
                  if (!res.ok) {
                    setToast(data.error || t("dashboard.teamWorkersFailed"));
                    return;
                  }
                  setShowModal(false);
                  fetchWorkers();
                } finally {
                  setSubmitLoading(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className={labelClass}>{t("dashboard.teamWorkersLabelName")}</label>
                <input
                  type="text"
                  value={workerForm.name}
                  onChange={(e) => setWorkerForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  className={formInput}
                />
              </div>
              <div>
                <label className={labelClass}>{t("dashboard.teamWorkersLabelRole")}</label>
                <input
                  type="text"
                  value={workerForm.role}
                  onChange={(e) => setWorkerForm((f) => ({ ...f, role: e.target.value }))}
                  required
                  placeholder={t("dashboard.teamWorkersRolePlaceholder")}
                  className={formInput}
                />
              </div>
              <div>
                <label className={labelClass}>{t("common.email")}</label>
                <input
                  type="email"
                  value={workerForm.email}
                  onChange={(e) => setWorkerForm((f) => ({ ...f, email: e.target.value }))}
                  className={formInput}
                />
              </div>
              <div>
                <label className={labelClass}>{t("dashboard.teamRidersLabelPhone")}</label>
                <input
                  type="tel"
                  value={workerForm.phone}
                  onChange={(e) => setWorkerForm((f) => ({ ...f, phone: e.target.value }))}
                  className={formInput}
                />
              </div>
              <div>
                <label className={labelClass}>{t("dashboard.teamWorkersLabelNotes")}</label>
                <textarea
                  value={workerForm.notes}
                  onChange={(e) => setWorkerForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  className={`${formInput} resize-none`}
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
                      {editingWorker ? t("dashboard.teamWorkersSaving") : t("dashboard.teamWorkersAdding")}
                    </>
                  ) : (
                    editingWorker ? t("dashboard.teamWorkersSave") : t("dashboard.teamWorkersAddSubmit")
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
