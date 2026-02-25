"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useProfile } from "@/components/providers/ProfileProvider";
import { useParams } from "next/navigation";
import { generateHorsePassportPdf } from "@/lib/generatePassportPdf";
import { HorseAvatar } from "@/components/HorseAvatar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface Session {
  id: number;
  punchType: string;
  duration: number;
  intensity: string;
  discipline: string;
  rider: string | null;
  notes: string | null;
  createdAt: string;
}

interface HealthLog {
  id: number;
  type: string;
  date: string;
  description: string | null;
  cost: number | null;
  nextDue: string | null;
  recoveryStatus: string | null;
}

interface Horse {
  id: string | number;
  name: string;
  gender: string;
  age: number | null;
  breed: string | null;
  owner: string | null;
  photoUrl: string | null;
  color: string | null;
  markings: string | null;
  height: number | null;
  microchip: string | null;
  ueln: string | null;
  dateOfBirth: string | null;
  temperament: string | null;
  skillLevel: string | null;
  trainingStatus: string | null;
  ridingSuitability: string | null;
  sessions: Session[];
  healthLogs: HealthLog[];
  notes?: string;
}

const PUNCH_LABELS: Record<string, string> = {
  training: "Training",
  lesson: "Lesson",
  free_ride: "Free Ride",
  competition: "Competition",
  rest: "Rest",
  medical_rest: "Medical Rest",
};

const HEALTH_LABELS: Record<string, string> = {
  vet: "Vet Visit",
  vaccination: "Vaccination",
  deworming: "Deworming",
  farrier: "Farrier",
  injury: "Injury",
};

function PassportField({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="flex border-b border-black/20 py-2">
      <span className="text-black/60 text-sm w-36 shrink-0">{label}</span>
      <span className="text-black font-medium">
        {value ?? "—"}
      </span>
    </div>
  );
}

export default function HorseDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [horse, setHorse] = useState<Horse | null>(null);
  const [loading, setLoading] = useState(true);
  const { profile } = useProfile();
  const role = profile?.role ?? null;
  const [activeTab, setActiveTab] = useState<"health" | "training">("health");
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [healthLogLoading, setHealthLogLoading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    gender: "Gelding",
    age: "",
    breed: "",
    owner: "",
    color: "",
    markings: "",
    height: "",
    microchip: "",
    ueln: "",
    dateOfBirth: "",
    photoUrl: "",
    temperament: "calm",
    skillLevel: "intermediate",
    trainingStatus: "schooling",
    ridingSuitability: "adults",
  });
  const [healthForm, setHealthForm] = useState({
    type: "vet",
    date: new Date().toISOString().slice(0, 10),
    description: "",
    cost: "",
    nextDue: "",
    recoveryStatus: "",
  });

  useEffect(() => {
    fetchHorse();
  }, [id]);

  const fetchHorse = async () => {
    try {
      const res = await fetch(`/api/horses/${id}`);
      const data = await res.json();
      if (!res.ok) {
        setHorse(null);
        return;
      }
      setHorse(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = () => {
    if (!horse) return;
    const notes = horse.notes ?? "";
    const ownerVal = horse.owner ?? (notes.startsWith("Owner: ") ? notes.replace(/^Owner:\s*/, "").trim() : "");
    setEditForm({
      name: horse.name ?? "",
      gender: horse.gender ?? "Gelding",
      age: horse.age != null ? String(horse.age) : "",
      breed: horse.breed ?? "",
      owner: ownerVal,
      color: horse.color ?? "",
      markings: horse.markings ?? "",
      height: horse.height != null ? String(horse.height) : "",
      microchip: horse.microchip ?? "",
      ueln: horse.ueln ?? "",
      dateOfBirth: horse.dateOfBirth ?? "",
      photoUrl: horse.photoUrl ?? "",
      temperament: horse.temperament ?? "calm",
      skillLevel: horse.skillLevel ?? "intermediate",
      trainingStatus: horse.trainingStatus ?? "schooling",
      ridingSuitability: horse.ridingSuitability ?? "adults",
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/horses/upload-photo", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setToast(data.error || "Upload failed");
        return;
      }
      setEditForm((f) => ({ ...f, photoUrl: data.url }));
      setToast("Photo uploaded");
    } catch {
      setToast("Upload failed");
    }
    e.target.value = "";
    setTimeout(() => setToast(null), 3000);
  };

  const saveHorse = async () => {
    if (!horse) return;
    try {
      const res = await fetch(`/api/horses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          gender: editForm.gender,
          age: editForm.age ? Number(editForm.age) : null,
          breed: editForm.breed || null,
          owner: editForm.owner || null,
          color: editForm.color || null,
          markings: editForm.markings || null,
          height: editForm.height ? Number(editForm.height) : null,
          microchip: editForm.microchip || null,
          ueln: editForm.ueln || null,
          dateOfBirth: editForm.dateOfBirth || null,
          photoUrl: editForm.photoUrl || null,
          temperament: editForm.temperament || null,
          skillLevel: editForm.skillLevel || null,
          trainingStatus: editForm.trainingStatus || null,
          ridingSuitability: editForm.ridingSuitability || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast(data.error || "Update failed");
        setTimeout(() => setToast(null), 3000);
        return;
      }
      setShowEditModal(false);
      setToast("Horse updated");
      fetchHorse();
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error(err);
      setToast("Update failed");
      setTimeout(() => setToast(null), 3000);
    }
  };

  const addHealthLog = async () => {
    if (!horse) return;
    setHealthLogLoading(true);
    try {
      await fetch("/api/health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          horseId: horse.id,
          type: healthForm.type,
          date: healthForm.date,
          description: healthForm.description || null,
          cost: healthForm.cost ? Number(healthForm.cost) : null,
          nextDue: healthForm.nextDue || null,
          recoveryStatus: healthForm.recoveryStatus || null,
        }),
      });
      setShowHealthModal(false);
      setHealthForm({
        type: "vet",
        date: new Date().toISOString().slice(0, 10),
        description: "",
        cost: "",
        nextDue: "",
        recoveryStatus: "",
      });
      fetchHorse();
    } catch (err) {
      console.error(err);
    } finally {
      setHealthLogLoading(false);
    }
  };

  const calculateWorkload = () => {
    if (!horse?.sessions) return { sessionsCount: 0, totalMinutes: 0, warning: false };
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recent = horse.sessions.filter(
      (s) =>
        new Date(s.createdAt) >= sevenDaysAgo &&
        s.punchType !== "rest" &&
        s.punchType !== "medical_rest" &&
        s.punchType !== "medical"
    );
    const totalMin = recent.reduce((sum, s) => sum + (s.duration ?? 0), 0);
    const hardCount = recent.filter(
      (s) => (s.intensity ?? "").toLowerCase() === "hard"
    ).length;
    const warning = recent.length > 5 || hardCount >= 3 || totalMin >= 300;

    return {
      sessionsCount: recent.length,
      totalMinutes: totalMin,
      warning,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-white/50">Loading...</p>
      </div>
    );
  }

  if (!horse) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard/horses"
          className="text-white/60 hover:text-white text-sm uppercase tracking-wider"
        >
          ← Back to Horses
        </Link>
        <p className="text-white/50">Horse not found.</p>
      </div>
    );
  }

  const workload = calculateWorkload();

  const btnPrimary = "px-4 py-2.5 bg-white text-black font-medium text-sm uppercase tracking-wider hover:opacity-95 transition flex items-center gap-2";
  const btnSecondary = "px-4 py-2.5 border border-white/10 text-white text-sm uppercase tracking-wider hover:border-white/30 transition";

  const formInput = "w-full px-4 py-3 bg-black border border-white/10 text-white placeholder-white/40 focus:border-white/30 focus:outline-none";

  return (
    <div className="space-y-6">
      {toast && (
        <div className="px-4 py-2 border border-white/10 text-white text-sm">
          {toast}
        </div>
      )}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link
          href={role === "student" ? "/dashboard/my-horses" : "/dashboard/horses"}
          className="text-white/60 hover:text-white text-sm uppercase tracking-wider"
        >
          ← Back to {role === "student" ? "My Horses" : "Horses"}
        </Link>
        <div className="flex items-center gap-2">
          <HorseAvatar
            photoUrl={horse.photoUrl}
            name={horse.name}
            size="md"
          />
          {role !== "student" && (
            <>
              <button
                onClick={openEditModal}
                className={btnSecondary}
              >
                Edit
              </button>
              <Link
                href="/dashboard/horses"
                className={btnSecondary}
              >
                Log Session
              </Link>
            </>
          )}
          <button
            onClick={() => generateHorsePassportPdf(horse)}
            className={btnPrimary}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF (Health Records)
          </button>
        </div>
      </div>

      {/* Passport Document */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-black/20 overflow-hidden">
          {/* Passport Header */}
          <div className="bg-black text-white px-6 py-4 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-medium tracking-wider uppercase">
                  Horse Passport
                </h1>
                <p className="text-white/70 text-xs mt-1">
                  Digital identification document • Saddle Up
                </p>
              </div>
              <div className="text-right text-xs text-white/70">
                <p>Passport ID: {typeof horse.id === "string" ? horse.id.slice(0, 8).toUpperCase() : String(horse.id).padStart(6, "0")}</p>
                {horse.ueln && <p>UELN: {horse.ueln}</p>}
              </div>
            </div>
          </div>

          {/* Passport Body - Two column layout: Photo + Identification */}
          <div className="p-4 sm:p-6 md:p-8">
            <div className="grid md:grid-cols-[200px_1fr] gap-8 mb-8">
              {/* Photo Section */}
              <div className="flex flex-col items-center">
                <div className="w-full aspect-[3/4] max-w-[200px] bg-black/5 border border-black/20 flex items-center justify-center overflow-hidden">
                  {horse.photoUrl ? (
                    <img
                      src={horse.photoUrl}
                      alt={horse.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-black/30 text-6xl">🐴</span>
                  )}
                </div>
                <p className="text-black/50 text-xs mt-2 uppercase tracking-wider">
                  Photograph
                </p>
              </div>

              {/* Section I: Identification of the animal */}
              <div>
                <h2 className="text-black font-medium text-sm uppercase tracking-wider mb-4 pb-2 border-b border-black/20">
                  Section I — Identification of the animal
                </h2>
                <div className="space-y-0">
                  <PassportField label="1. Name" value={horse.name} />
                  <PassportField label="2. UELN" value={horse.ueln} />
                  <PassportField label="3. Microchip" value={horse.microchip} />
                  <PassportField label="4. Breed" value={horse.breed} />
                  <PassportField label="5. Colour" value={horse.color} />
                  <PassportField label="6. Markings" value={horse.markings} />
                  <PassportField label="7. Sex" value={horse.gender} />
                  <PassportField
                    label="8. Date of birth"
                    value={
                      horse.dateOfBirth
                        ? new Date(horse.dateOfBirth).toLocaleDateString()
                        : horse.age
                          ? `~${new Date().getFullYear() - horse.age}`
                          : null
                    }
                  />
                  <PassportField
                    label="9. Height (cm)"
                    value={horse.height}
                  />
                </div>
              </div>
            </div>

            {/* Section II: Owner & Riding suitability */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h2 className="text-black font-medium text-sm uppercase tracking-wider mb-4 pb-2 border-b border-black/20">
                  Owner & Registration
                </h2>
                <div className="space-y-0">
                  <PassportField label="Registered owner" value={horse.owner} />
                  <PassportField label="Temperament" value={horse.temperament} />
                  <PassportField label="Skill level" value={horse.skillLevel} />
                  <PassportField label="Training status" value={horse.trainingStatus} />
                  <PassportField label="Riding suitability" value={horse.ridingSuitability} />
                </div>
              </div>

              {/* Workload summary */}
              <div>
                <h2 className="text-black font-medium text-sm uppercase tracking-wider mb-4 pb-2 border-b border-black/20">
                  Workload this week
                </h2>
                <div className="bg-black/5 border border-black/20 p-4">
                  <p className="text-3xl font-medium text-black">
                    {workload.sessionsCount}
                    <span className="text-lg font-normal text-black/70 ml-1">
                      sessions
                    </span>
                  </p>
                  <p className="text-2xl font-medium text-black mt-1">
                    {workload.totalMinutes}
                    <span className="text-sm font-normal text-black/60 ml-1">
                      minutes
                    </span>
                  </p>
                  {workload.warning && (
                    <p className="text-black/80 text-sm mt-3 font-medium">
                      ⚠ Consider a rest day
                    </p>
                  )}
                </div>
              </div>

              {/* Total care cost */}
              <div>
                <h2 className="text-black font-medium text-sm uppercase tracking-wider mb-4 pb-2 border-b border-black/20">
                  Total care cost
                </h2>
                <div className="bg-black/5 border border-black/20 p-4">
                  <p className="text-3xl font-medium text-black">
                    $
                    {(horse.healthLogs ?? [])
                      .reduce((sum, log) => sum + (log.cost ?? 0), 0)
                      .toFixed(2)}
                  </p>
                  <p className="text-black/60 text-sm mt-1">
                    Vet, farrier, vaccinations, etc.
                  </p>
                </div>
              </div>

              {/* AI workload suggestions */}
              {(role === "owner" || role === "trainer") && (
                <div className="mt-6">
                  <h2 className="text-black font-medium text-sm uppercase tracking-wider mb-4 pb-2 border-b border-black/20">
                    AI workload suggestions
                  </h2>
                  {aiSuggestions ? (
                    <div className="bg-black/5 border border-black/20 p-4 text-black/90 text-sm whitespace-pre-wrap">
                      {aiSuggestions}
                    </div>
                  ) : (
                    <div className="bg-black/5 border border-black/20 p-4">
                      <p className="text-black/60 text-sm mb-3">
                        Get personalized suggestions based on this horse&apos;s recent training and workload.
                      </p>
                      <button
                        onClick={async () => {
                          setAiLoading(true);
                          setAiSuggestions(null);
                          try {
                            const res = await fetch(`/api/horses/${id}/workload-suggestions`);
                            const data = await res.json().catch(() => ({}));
                            if (!res.ok) {
                              throw new Error(data.error || `Request failed (${res.status})`);
                            }
                            setAiSuggestions(data.suggestions || "No suggestions generated.");
                          } catch (err) {
                            const msg = err instanceof Error ? err.message : "Something went wrong";
                            setToast(msg);
                            setTimeout(() => setToast(null), 5000);
                          } finally {
                            setAiLoading(false);
                          }
                        }}
                        disabled={aiLoading}
                        className="px-4 py-2 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-black/90 disabled:opacity-50 transition"
                      >
                        {aiLoading ? "Generating..." : "Generate suggestions"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tabs: Health & Training records */}
            <div>
              <div className="flex border-b border-black/20 mb-4">
                <button
                  onClick={() => setActiveTab("health")}
                  className={`px-4 py-2 text-sm font-medium uppercase tracking-wider ${
                    activeTab === "health"
                      ? "border-b-2 border-black -mb-0.5 text-black"
                      : "text-black/60 hover:text-black"
                  }`}
                >
                  Vaccinations & Health
                </button>
                <button
                  onClick={() => setActiveTab("training")}
                  className={`px-4 py-2 text-sm font-medium uppercase tracking-wider ${
                    activeTab === "training"
                      ? "border-b-2 border-black -mb-0.5 text-black"
                      : "text-black/60 hover:text-black"
                  }`}
                >
                  Training Record
                </button>
              </div>

              {activeTab === "health" && (
                <div>
                  <h2 className="text-black font-medium text-sm uppercase tracking-wider mb-4">
                    Section II — Vaccinations & veterinary treatments
                  </h2>
                  {role !== "student" && (
                    <button
                      onClick={() => setShowHealthModal(true)}
                      className="mb-4 px-4 py-2.5 bg-black text-white text-sm font-medium uppercase tracking-wider hover:opacity-90 transition"
                    >
                      + Add health record
                    </button>
                  )}
                  <div className="space-y-3">
                    {horse.healthLogs?.length ? (
                      horse.healthLogs.map((log) => (
                        <div
                          key={log.id}
                          className="flex justify-between items-start bg-black/5 border border-black/20 p-3"
                        >
                          <div>
                            <span className="font-medium text-black">
                              {HEALTH_LABELS[log.type] || log.type}
                            </span>
                            {log.description && (
                              <p className="text-sm text-black/70 mt-1">
                                {log.description}
                              </p>
                            )}
                            {log.cost && (
                              <p className="text-sm text-black/60">${log.cost}</p>
                            )}
                          </div>
                          <div className="text-right text-sm text-black/60">
                            <p>{new Date(log.date).toLocaleDateString()}</p>
                            {log.nextDue && (
                              <p className="text-black/50">
                                Next: {new Date(log.nextDue).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-black/50 text-sm italic">
                        No health records yet
                      </p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "training" && (
                <div>
                  <h2 className="text-black font-medium text-sm uppercase tracking-wider mb-4">
                    Training & work record
                  </h2>
                  <div className="space-y-3">
                    {horse.sessions?.length ? (
                      horse.sessions.map((s) => (
                        <div
                          key={s.id}
                          className="flex justify-between items-center bg-black/5 border border-black/20 p-3"
                        >
                          <div>
                            <span className="font-medium text-black">
                              {PUNCH_LABELS[s.punchType] || s.punchType}
                            </span>
                            <span className="text-black/60 text-sm ml-2">
                              {s.duration > 0 ? `${s.duration} min` : "Rest"} •{" "}
                              {s.intensity}
                            </span>
                            {s.rider && (
                              <p className="text-sm text-black/50 mt-1">
                                Rider: {s.rider}
                              </p>
                            )}
                          </div>
                          <span className="text-black/50 text-sm">
                            {new Date(s.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-black/50 text-sm italic">
                        No training sessions logged yet
                      </p>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Edit Horse Modal */}
      {showEditModal && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 modal-backdrop overflow-y-auto sm:items-center"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-black border border-white/10 p-4 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto modal-enter my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-serif text-xl text-white mb-6">Edit Horse</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input name="name" placeholder="Name *" value={editForm.name} onChange={handleEditChange} className={`sm:col-span-2 ${formInput}`} />
              <select name="gender" value={editForm.gender} onChange={handleEditChange} className={formInput}>
                <option value="Stallion">Stallion</option>
                <option value="Mare">Mare</option>
                <option value="Gelding">Gelding</option>
              </select>
              <input name="age" type="number" placeholder="Age" value={editForm.age} onChange={handleEditChange} className={formInput} />
              <input name="breed" placeholder="Breed" value={editForm.breed} onChange={handleEditChange} className={`sm:col-span-2 ${formInput}`} />
              <input name="owner" placeholder="Owner" value={editForm.owner} onChange={handleEditChange} className={`sm:col-span-2 ${formInput}`} />
              <input name="color" placeholder="Colour" value={editForm.color} onChange={handleEditChange} className={formInput} />
              <input name="markings" placeholder="Markings" value={editForm.markings} onChange={handleEditChange} className={formInput} />
              <input name="height" type="number" placeholder="Height (cm)" value={editForm.height} onChange={handleEditChange} className={formInput} />
              <input name="microchip" placeholder="Microchip" value={editForm.microchip} onChange={handleEditChange} className={formInput} />
              <input name="ueln" placeholder="UELN" value={editForm.ueln} onChange={handleEditChange} className={formInput} />
              <input name="dateOfBirth" type="date" placeholder="Date of birth" value={editForm.dateOfBirth} onChange={handleEditChange} className={formInput} />
              <div className="sm:col-span-2">
                <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Profile picture</label>
                <div className="flex items-center gap-4">
                  <HorseAvatar photoUrl={editForm.photoUrl || null} name={editForm.name || "Horse"} size="lg" />
                  <div className="flex-1 space-y-2">
                    <input type="file" ref={photoInputRef} accept="image/jpeg,image/png,image/webp" onChange={handleEditPhotoUpload} className="hidden" />
                    <button type="button" onClick={() => photoInputRef.current?.click()} className="block px-4 py-2.5 border border-white/10 text-white text-sm uppercase tracking-wider hover:border-white/30 transition">
                      Upload photo
                    </button>
                    <input name="photoUrl" placeholder="Or paste image URL" value={editForm.photoUrl} onChange={handleEditChange} className={`w-full ${formInput} text-sm`} />
                  </div>
                </div>
              </div>
              <select name="temperament" value={editForm.temperament} onChange={handleEditChange} className={formInput}>
                <option value="calm">Calm</option>
                <option value="energetic">Energetic</option>
                <option value="sensitive">Sensitive</option>
                <option value="beginner-safe">Beginner-safe</option>
              </select>
              <select name="skillLevel" value={editForm.skillLevel} onChange={handleEditChange} className={formInput}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <select name="trainingStatus" value={editForm.trainingStatus} onChange={handleEditChange} className={formInput}>
                <option value="green">Green</option>
                <option value="schooling">Schooling</option>
                <option value="competition-ready">Competition-ready</option>
              </select>
              <select name="ridingSuitability" value={editForm.ridingSuitability} onChange={handleEditChange} className={formInput}>
                <option value="kids">Kids</option>
                <option value="adults">Adults</option>
                <option value="jumping">Jumping</option>
                <option value="dressage">Dressage</option>
                <option value="trail">Trail</option>
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowEditModal(false)} className="flex-1 py-2.5 border border-white/10 text-white text-sm uppercase tracking-wider hover:border-white/30 transition">
                Cancel
              </button>
              <button onClick={saveHorse} className="flex-1 py-2.5 bg-white text-black font-medium text-sm uppercase tracking-wider hover:opacity-95 transition">
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Health Log Modal */}
      {showHealthModal && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 modal-backdrop overflow-y-auto sm:items-center"
          onClick={() => setShowHealthModal(false)}
        >
          <div
            className="bg-black border border-white/10 p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto modal-enter my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-serif text-xl text-white mb-6">
              Add health record
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Type</label>
                <select
                  value={healthForm.type}
                  onChange={(e) =>
                    setHealthForm({ ...healthForm, type: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-black border border-white/10 text-white focus:border-white/30 focus:outline-none"
                >
                  {Object.entries(HEALTH_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Date</label>
                <input
                  type="date"
                  value={healthForm.date}
                  onChange={(e) =>
                    setHealthForm({ ...healthForm, date: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-black border border-white/10 text-white focus:border-white/30 focus:outline-none"
                />
              </div>
              <textarea
                placeholder="Description"
                value={healthForm.description}
                onChange={(e) =>
                  setHealthForm({ ...healthForm, description: e.target.value })
                }
                rows={2}
                className="w-full px-4 py-3 bg-black border border-white/10 text-white placeholder-white/40 focus:border-white/30 focus:outline-none resize-none"
              />
              <input
                type="number"
                placeholder="Cost ($)"
                value={healthForm.cost}
                onChange={(e) =>
                  setHealthForm({ ...healthForm, cost: e.target.value })
                }
                className="w-full px-4 py-3 bg-black border border-white/10 text-white placeholder-white/40 focus:border-white/30 focus:outline-none"
              />
              <div>
                <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">
                  Next due (vaccinations, farrier)
                </label>
                <input
                  type="date"
                  value={healthForm.nextDue}
                  onChange={(e) =>
                    setHealthForm({ ...healthForm, nextDue: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-black border border-white/10 text-white focus:border-white/30 focus:outline-none"
                />
              </div>
              {healthForm.type === "injury" && (
                <select
                  value={healthForm.recoveryStatus}
                  onChange={(e) =>
                    setHealthForm({ ...healthForm, recoveryStatus: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-black border border-white/10 text-white focus:border-white/30 focus:outline-none"
                >
                  <option value="">Recovery status</option>
                  <option value="active">Active injury</option>
                  <option value="recovering">Recovering</option>
                  <option value="cleared">Cleared</option>
                </select>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowHealthModal(false)}
                className="flex-1 py-2.5 border border-white/10 text-white text-sm uppercase tracking-wider hover:border-white/30 transition"
              >
                Cancel
              </button>
              <button
                onClick={addHealthLog}
                disabled={healthLogLoading}
                className="flex-1 py-2.5 bg-white text-black font-medium text-sm uppercase tracking-wider hover:opacity-95 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {healthLogLoading ? (
                  <>
                    <LoadingSpinner size={16} className="text-black" />
                    Adding…
                  </>
                ) : (
                  "Add record"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
