"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useProfile } from "@/components/providers/ProfileProvider";
import UpgradePlanModal from "@/components/dashboard/UpgradePlanModal";
import { IdCardUpload } from "@/components/dashboard/IdCardUpload";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import TableSkeleton from "@/components/ui/TableSkeleton";

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
}

const formInput = "w-full px-4 py-3 bg-black border border-white/10 text-white placeholder-white/40 focus:border-white/30 focus:outline-none";
const labelClass = "block text-xs uppercase tracking-widest text-white/50 mb-2";
const btnPrimary = "px-4 py-2.5 bg-white text-black font-medium text-sm uppercase tracking-wider hover:opacity-95 transition";
const btnSecondary = "px-4 py-2.5 border border-white/10 text-white text-sm uppercase tracking-wider hover:border-white/30 transition";

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
          setToast(data.error || "Something went wrong");
        }
        return;
      }
      setToast(editingRider ? "Rider updated" : "Rider added");
      setShowModal(false);
      fetchRiders();
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this rider?")) return;
    const res = await fetch(`/api/riders/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setToast(data.error || "Failed to delete");
      return;
    }
    setToast("Rider deleted");
    fetchRiders();
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        {subscription && !subscription.canAddRider && (
          <Link
            href="/dashboard/settings"
            className="text-white/60 hover:text-white text-xs uppercase tracking-wider"
          >
            Upgrade to add more riders →
          </Link>
        )}
        <div className="flex flex-wrap gap-2 items-center ml-auto">
          <input
            type="search"
            placeholder="Search riders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2.5 bg-black border border-white/10 text-white placeholder-white/40 focus:border-white/30 focus:outline-none text-sm"
          />
          <button onClick={openAdd} className={btnPrimary}>
            Add rider
          </button>
        </div>
      </div>

      {toast && (
        <div className="px-4 py-2 border border-white/10 text-white text-sm mb-4" role="alert">
          {toast}
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={6} cols={3} />
      ) : filtered.length === 0 ? (
        <p className="text-white/50">
          {search ? "No riders match your search." : "No riders yet. Add one or use Add member by personal ID above."}
        </p>
      ) : (
        <div className="border border-white/10 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-white/50 text-xs uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Level</th>
                <th className="px-6 py-4 font-medium w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-white/[0.02]">
                  <td className="px-6 py-4">
                    <Link
                      href={`${ridersBaseUrl}/${r.id}`}
                      className="text-white font-medium hover:underline"
                    >
                      {r.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-white/60">{r.email || "—"}</td>
                  <td className="px-6 py-4 text-white/60 capitalize">{r.level || "—"}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3 items-center">
                      <IdCardUpload
                        type="rider"
                        id={r.id}
                        idCardUrl={r.id_card_url}
                        canUpload={profile?.role === "owner"}
                        onSuccess={fetchRiders}
                      />
                      <button
                        onClick={() => openEdit(r)}
                        className="text-white hover:underline text-sm uppercase tracking-wider"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-white/60 hover:text-white hover:underline text-sm uppercase tracking-wider"
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
              {editingRider ? "Edit rider" : "Add rider"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  className={formInput}
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className={formInput}
                />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className={formInput}
                />
              </div>
              <div>
                <label className={labelClass}>Level</label>
                <select
                  value={form.level}
                  onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
                  className={formInput}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Goals</label>
                <textarea
                  value={form.goals}
                  onChange={(e) => setForm((f) => ({ ...f, goals: e.target.value }))}
                  rows={2}
                  className={`${formInput} resize-none`}
                />
              </div>
              <div>
                <label className={labelClass}>Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  className={`${formInput} resize-none`}
                />
              </div>
              {editingRider && (
                <div>
                  <label className={labelClass}>Instructor feedback</label>
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
                      {editingRider ? "Saving…" : "Adding…"}
                    </>
                  ) : (
                    editingRider ? "Save" : "Add"
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
