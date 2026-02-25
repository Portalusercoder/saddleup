"use client";

import { useEffect, useState } from "react";
import { useProfile } from "@/components/providers/ProfileProvider";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface Worker {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string;
  notes: string | null;
}

const formInput = "w-full px-4 py-3 bg-black border border-white/10 text-white placeholder-white/40 focus:border-white/30 focus:outline-none";
const labelClass = "block text-xs uppercase tracking-widest text-white/50 mb-2";
const btnPrimary = "px-4 py-2.5 bg-white text-black font-medium text-sm uppercase tracking-wider hover:opacity-95 transition";
const btnSecondary = "px-4 py-2.5 border border-white/10 text-white text-sm uppercase tracking-wider hover:border-white/30 transition";

export default function TeamWorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [workerForm, setWorkerForm] = useState({ name: "", email: "", phone: "", role: "", notes: "" });
  const [toast, setToast] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const { profile } = useProfile();

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
      <p className="text-white/50">Only stable owners can manage workers.</p>
    );
  }

  return (
    <>
      <p className="text-white/50 text-sm mb-4">
        Track staff without accounts. Add names and custom roles (e.g. Groom, Farrier, Vet).
      </p>

      <button
        onClick={() => {
          setEditingWorker(null);
          setWorkerForm({ name: "", email: "", phone: "", role: "", notes: "" });
          setShowModal(true);
        }}
        className={btnPrimary}
      >
        + Add worker
      </button>

      {toast && (
        <div className="px-4 py-2 border border-white/10 text-white text-sm mt-4" role="alert">
          {toast}
        </div>
      )}

      {workers.length > 0 && (
        <div className="mt-6 border border-white/10 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-white/50 text-xs uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {workers.map((w) => (
                <tr key={w.id} className="hover:bg-white/[0.02]">
                  <td className="px-6 py-4 font-medium text-white">{w.name}</td>
                  <td className="px-6 py-4 text-white/60">{w.role}</td>
                  <td className="px-6 py-4 text-white/60">{w.email || w.phone || "—"}</td>
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
                        className="text-white hover:underline text-sm uppercase tracking-wider"
                      >
                        Edit
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm(`Remove ${w.name}?`)) return;
                          const res = await fetch(`/api/workers/${w.id}`, { method: "DELETE" });
                          if (!res.ok) {
                            const d = await res.json();
                            setToast(d.error || "Failed");
                            return;
                          }
                          setToast("Worker removed");
                          fetchWorkers();
                        }}
                        className="text-white/60 hover:text-white text-sm uppercase tracking-wider"
                      >
                        Delete
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
          <div className="bg-black border border-white/10 max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="font-serif text-xl text-white mb-6">
              {editingWorker ? "Edit worker" : "Add worker"}
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
                    setToast(data.error || "Failed");
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
                <label className={labelClass}>Name *</label>
                <input
                  type="text"
                  value={workerForm.name}
                  onChange={(e) => setWorkerForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  className={formInput}
                />
              </div>
              <div>
                <label className={labelClass}>Role *</label>
                <input
                  type="text"
                  value={workerForm.role}
                  onChange={(e) => setWorkerForm((f) => ({ ...f, role: e.target.value }))}
                  required
                  placeholder="e.g. Groom, Farrier, Vet"
                  className={formInput}
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  value={workerForm.email}
                  onChange={(e) => setWorkerForm((f) => ({ ...f, email: e.target.value }))}
                  className={formInput}
                />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input
                  type="tel"
                  value={workerForm.phone}
                  onChange={(e) => setWorkerForm((f) => ({ ...f, phone: e.target.value }))}
                  className={formInput}
                />
              </div>
              <div>
                <label className={labelClass}>Notes</label>
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
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className={`${btnPrimary} disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                >
                  {submitLoading ? (
                    <>
                      <LoadingSpinner size={16} className="text-black" />
                      {editingWorker ? "Saving…" : "Adding…"}
                    </>
                  ) : (
                    editingWorker ? "Save" : "Add"
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
