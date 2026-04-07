"use client";

import { useEffect, useState } from "react";
import { useProfile } from "@/components/providers/ProfileProvider";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import TableSkeleton from "@/components/ui/TableSkeleton";

interface Competition {
  id: string;
  eventName: string;
  eventDate: string;
  location?: string | null;
  discipline?: string | null;
  result?: string | null;
  notes?: string | null;
  horseId?: string;
  horse: { id: string; name: string } | null;
}

interface Horse {
  id: string;
  name: string;
}

const formInput = "w-full px-4 py-3 bg-base border border-black/10 text-black placeholder-black/40 focus:border-black/30 focus:outline-none";
const labelClass = "block text-xs uppercase tracking-widest text-black/50 mb-2";
const btnPrimary = "px-4 py-2.5 bg-accent text-white font-medium text-sm uppercase tracking-wider hover:opacity-95 transition";
const btnSecondary = "px-4 py-2.5 border border-black/10 text-black text-sm uppercase tracking-wider hover:border-black/30 transition";

export default function CompetitionsPage() {
  const { profile } = useProfile();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [horses, setHorses] = useState<Horse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCompetition, setEditingCompetition] = useState<Competition | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [form, setForm] = useState({
    eventName: "",
    eventDate: "",
    horseId: "",
    location: "",
    discipline: "",
    result: "",
    notes: "",
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  const isTrainerOrOwner = profile?.role === "trainer" || profile?.role === "owner";

  const fetchCompetitions = () => {
    fetch("/api/competitions")
      .then((r) => r.json())
      .then((data) => setCompetitions(Array.isArray(data) ? data : []))
      .catch(() => setCompetitions([]));
  };

  useEffect(() => {
    fetch("/api/competitions")
      .then((r) => r.json())
      .then((data) => setCompetitions(Array.isArray(data) ? data : []))
      .catch(() => setCompetitions([]))
      .finally(() => setLoading(false));
    if (isTrainerOrOwner) {
      fetch("/api/horses")
        .then((r) => r.json())
        .then((data) => setHorses(Array.isArray(data) ? data.map((h: Horse) => ({ id: h.id, name: h.name })) : []))
        .catch(() => setHorses([]));
    }
  }, [isTrainerOrOwner]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const openAdd = () => {
    setEditingCompetition(null);
    setForm({
      eventName: "",
      eventDate: new Date().toISOString().slice(0, 10),
      horseId: horses[0]?.id ?? "",
      location: "",
      discipline: "",
      result: "",
      notes: "",
    });
    setShowModal(true);
  };

  const openEdit = (c: Competition) => {
    setEditingCompetition(c);
    setForm({
      eventName: c.eventName || "",
      eventDate: c.eventDate?.slice(0, 10) || "",
      horseId: c.horseId || c.horse?.id || "",
      location: c.location || "",
      discipline: c.discipline || "",
      result: c.result || "",
      notes: c.notes || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.eventName.trim() || !form.eventDate || !form.horseId) {
      setToast("Event name, date, and horse are required");
      return;
    }
    setSubmitLoading(true);
    try {
      if (editingCompetition) {
        const res = await fetch(`/api/competitions/${editingCompetition.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed");
        setCompetitions((prev) =>
          prev.map((x) => (x.id === editingCompetition.id ? data : x))
        );
        setToast("Competition updated");
        setTimeout(() => setToast(null), 3000);
      } else {
        const res = await fetch("/api/competitions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed");
        setCompetitions((prev) => [data, ...prev]);
        setToast("Competition added");
        setTimeout(() => setToast(null), 3000);
      }
      setShowModal(false);
    } catch (err) {
      setToast((err as Error).message);
      setTimeout(() => setToast(null), 4000);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this competition?")) return;
    try {
      const res = await fetch(`/api/competitions/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed");
      }
      setCompetitions((prev) => prev.filter((x) => x.id !== id));
      setToast("Competition deleted");
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setToast((err as Error).message);
      setTimeout(() => setToast(null), 4000);
    }
  };

  const now = new Date();
  const upcoming = competitions.filter((c) => new Date(c.eventDate) >= now);
  const past = competitions.filter((c) => new Date(c.eventDate) < now);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-normal text-black">
            Competitions
          </h1>
          <p className="text-black/60 text-sm max-w-xl mt-2">
            Upcoming and past competition results for horses in your stable.
          </p>
        </div>
        {isTrainerOrOwner && horses.length > 0 && (
          <button onClick={openAdd} className={btnPrimary}>
            + Add competition
          </button>
        )}
      </div>

      {toast && (
        <div className="px-4 py-2 border border-black/10 text-black text-sm" role="alert">
          {toast}
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={6} cols={4} />
      ) : (
        <>
          {upcoming.length > 0 && (
            <div className="border border-black/10 p-6">
              <h2 className="font-serif text-lg text-black mb-4">Upcoming</h2>
              <div className="space-y-3">
                {upcoming.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between border border-black/10 px-4 py-3"
                  >
                    <div>
                      <span className="font-medium text-black">
                        {c.eventName}
                      </span>
                      <span className="text-black/50 text-sm ml-2">
                        {formatDate(c.eventDate)}
                        {c.location && ` • ${c.location}`}
                      </span>
                      {c.horse && (
                        <span className="text-black/40 text-xs block">
                          Horse: {c.horse.name}
                        </span>
                      )}
                    </div>
                    {isTrainerOrOwner && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(c)}
                          className="text-black hover:underline text-sm uppercase tracking-wider"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="text-black/60 hover:text-black text-sm uppercase tracking-wider"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div className="border border-black/10 p-6">
              <h2 className="font-serif text-lg text-black mb-4">Past Results</h2>
              <div className="space-y-3">
                {past.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between border border-black/10 px-4 py-3"
                  >
                    <div>
                      <span className="font-medium text-black">
                        {c.eventName}
                      </span>
                      <span className="text-black/50 text-sm ml-2">
                        {formatDate(c.eventDate)}
                        {c.location && ` • ${c.location}`}
                      </span>
                      {c.horse && (
                        <span className="text-black/40 text-xs block">
                          Horse: {c.horse.name}
                        </span>
                      )}
                      {c.result && (
                        <span className="text-black/60 text-xs block mt-1">
                          Result: {c.result}
                        </span>
                      )}
                    </div>
                    {isTrainerOrOwner && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(c)}
                          className="text-black hover:underline text-sm uppercase tracking-wider"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="text-black/60 hover:text-black text-sm uppercase tracking-wider"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {upcoming.length === 0 && past.length === 0 && (
            <div className="border border-black/10 p-8 text-center">
              <p className="text-black/60">No competitions recorded yet.</p>
              {isTrainerOrOwner && horses.length > 0 && (
                <button
                  onClick={openAdd}
                  className="mt-4 text-black/60 hover:text-black text-sm uppercase tracking-wider"
                >
                  + Add your first competition
                </button>
              )}
            </div>
          )}
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto sm:items-center">
          <div className="bg-base border border-black/10 max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="font-serif text-xl text-black mb-6">
              {editingCompetition ? "Edit competition" : "Add competition"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>Event name *</label>
                <input
                  type="text"
                  value={form.eventName}
                  onChange={(e) => setForm((f) => ({ ...f, eventName: e.target.value }))}
                  required
                  className={formInput}
                  placeholder="e.g. Regional Dressage Championship"
                />
              </div>
              <div>
                <label className={labelClass}>Date *</label>
                <input
                  type="date"
                  value={form.eventDate}
                  onChange={(e) => setForm((f) => ({ ...f, eventDate: e.target.value }))}
                  required
                  className={formInput}
                />
              </div>
              <div>
                <label className={labelClass}>Horse *</label>
                <select
                  value={form.horseId}
                  onChange={(e) => setForm((f) => ({ ...f, horseId: e.target.value }))}
                  required
                  className={formInput}
                >
                  <option value="">Select horse</option>
                  {horses.map((h) => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  className={formInput}
                  placeholder="e.g. Amsterdam Arena"
                />
              </div>
              <div>
                <label className={labelClass}>Discipline</label>
                <input
                  type="text"
                  value={form.discipline}
                  onChange={(e) => setForm((f) => ({ ...f, discipline: e.target.value }))}
                  className={formInput}
                  placeholder="e.g. Dressage, Jumping"
                />
              </div>
              <div>
                <label className={labelClass}>Result</label>
                <input
                  type="text"
                  value={form.result}
                  onChange={(e) => setForm((f) => ({ ...f, result: e.target.value }))}
                  className={formInput}
                  placeholder="e.g. 1st place, 72.5%"
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
                      {editingCompetition ? "Saving…" : "Adding…"}
                    </>
                  ) : (
                    editingCompetition ? "Save" : "Add"
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
