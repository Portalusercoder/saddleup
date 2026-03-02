"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useProfile } from "@/components/providers/ProfileProvider";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import TableSkeleton from "@/components/ui/TableSkeleton";

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
  "w-full px-4 py-3 bg-black border border-white/10 text-white placeholder-white/40 focus:border-white/30 focus:outline-none";
const labelClass = "block text-xs uppercase tracking-widest text-white/50 mb-2";
const btnPrimary =
  "px-4 py-2.5 bg-white text-black font-medium text-sm uppercase tracking-wider hover:opacity-95 transition";
const btnSecondary =
  "px-4 py-2.5 border border-white/10 text-white text-sm uppercase tracking-wider hover:border-white/30 transition";

const SEVERITY_LABELS: Record<string, string> = {
  minor: "Minor",
  moderate: "Moderate",
  serious: "Serious",
};

export default function IncidentsPage() {
  const { profile } = useProfile();
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

  const isTrainerOrOwner =
    profile?.role === "trainer" || profile?.role === "owner";

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
    new Date(d).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
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
      setToast("Date, horse, and description are required");
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
        setToast("Incident report updated");
      } else {
        const res = await fetch("/api/incident-reports", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed");
        setReports((prev) => [data, ...prev]);
        setToast("Incident report added");
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
    if (!confirm("Delete this incident report? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/incident-reports/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed");
      }
      setReports((prev) => prev.filter((x) => x.id !== id));
      setToast("Incident report deleted");
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setToast((err as Error).message);
      setTimeout(() => setToast(null), 4000);
    }
  };

  if (profile?.role === "student") {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-2xl md:text-3xl font-normal text-white">
          Incident Reports
        </h1>
        <p className="text-white/50">
          You do not have access to incident reports.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-normal text-white">
            Incident Reports
          </h1>
          <p className="text-white/60 text-sm max-w-xl mt-2">
            Document incidents for liability and insurance. Include date, horse,
            rider, description, and witnesses.
          </p>
        </div>
        {isTrainerOrOwner && horses.length > 0 && (
          <button onClick={openAdd} className={btnPrimary}>
            + Report incident
          </button>
        )}
      </div>

      {toast && (
        <div
          className="px-4 py-2 border border-white/10 text-white text-sm"
          role="alert"
        >
          {toast}
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={6} cols={4} />
      ) : reports.length === 0 ? (
        <div className="border border-white/10 p-8 text-center">
          <p className="text-white/60">No incident reports yet.</p>
          {isTrainerOrOwner && horses.length > 0 && (
            <button
              onClick={openAdd}
              className="mt-4 text-white/60 hover:text-white text-sm uppercase tracking-wider"
            >
              + Report your first incident
            </button>
          )}
        </div>
      ) : (
        <div className="border border-white/10 p-6">
          <div className="space-y-3">
            {reports.map((r) => (
              <div
                key={r.id}
                className="border border-white/10 px-4 py-4 hover:border-white/20 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-white">
                        {formatDate(r.incidentDate)}
                      </span>
                      {r.horse && (
                        <Link
                          href={`/dashboard/horses/${r.horse.id}`}
                          className="text-white/70 hover:text-white text-sm"
                        >
                          {r.horse.name}
                        </Link>
                      )}
                      {r.severity && (
                        <span
                          className={`text-xs px-2 py-0.5 uppercase tracking-wider ${
                            r.severity === "serious"
                              ? "bg-amber-500/20 text-amber-400"
                              : r.severity === "moderate"
                                ? "bg-white/10 text-white/80"
                                : "text-white/50"
                          }`}
                        >
                          {SEVERITY_LABELS[r.severity] ?? r.severity}
                        </span>
                      )}
                    </div>
                    <p className="text-white/80 text-sm mt-2 line-clamp-2">
                      {r.description}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-white/50">
                      {r.riderName && (
                        <span>Rider: {r.riderName}</span>
                      )}
                      {r.location && (
                        <span>Location: {r.location}</span>
                      )}
                      {r.witnesses && (
                        <span>Witnesses: {r.witnesses}</span>
                      )}
                    </div>
                  </div>
                  {isTrainerOrOwner && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => openEdit(r)}
                        className="text-white hover:underline text-sm uppercase tracking-wider"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-white/60 hover:text-white text-sm uppercase tracking-wider"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto sm:items-center sm:py-8">
          <div className="bg-black border border-white/10 max-w-lg w-full p-4 sm:p-6 my-4 sm:my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="font-serif text-xl text-white mb-6">
              {editingReport ? "Edit incident report" : "Report incident"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>Date *</label>
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
                <label className={labelClass}>Horse *</label>
                <select
                  value={form.horseId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, horseId: e.target.value }))
                  }
                  required
                  className={formInput}
                >
                  <option value="">Select horse</option>
                  {horses.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Rider (optional)</label>
                <select
                  value={form.riderId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, riderId: e.target.value }))
                  }
                  className={formInput}
                >
                  <option value="">Select rider or enter name below</option>
                  {riders.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>
                  Rider name (if not in list)
                </label>
                <input
                  type="text"
                  value={form.riderName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, riderName: e.target.value }))
                  }
                  className={formInput}
                  placeholder="e.g. Guest rider, parent name"
                />
              </div>
              <div>
                <label className={labelClass}>Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  required
                  rows={4}
                  className={`${formInput} resize-none`}
                  placeholder="What happened? Include as much detail as possible for insurance and liability."
                />
              </div>
              <div>
                <label className={labelClass}>Witnesses</label>
                <input
                  type="text"
                  value={form.witnesses}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, witnesses: e.target.value }))
                  }
                  className={formInput}
                  placeholder="Names of witnesses, comma-separated"
                />
              </div>
              <div>
                <label className={labelClass}>Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, location: e.target.value }))
                  }
                  className={formInput}
                  placeholder="e.g. Arena, paddock, trail"
                />
              </div>
              <div>
                <label className={labelClass}>Severity</label>
                <select
                  value={form.severity}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, severity: e.target.value }))
                  }
                  className={formInput}
                >
                  <option value="">Select severity</option>
                  <option value="minor">Minor</option>
                  <option value="moderate">Moderate</option>
                  <option value="serious">Serious</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Follow-up notes</label>
                <textarea
                  value={form.followUpNotes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, followUpNotes: e.target.value }))
                  }
                  rows={2}
                  className={`${formInput} resize-none`}
                  placeholder="Actions taken, medical follow-up, etc."
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
                      {editingReport ? "Saving…" : "Adding…"}
                    </>
                  ) : (
                    editingReport ? "Save" : "Report"
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
