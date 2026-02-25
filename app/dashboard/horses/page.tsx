"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProfile } from "@/components/providers/ProfileProvider";
import { HorseAvatar } from "@/components/HorseAvatar";
import UpgradePlanModal from "@/components/dashboard/UpgradePlanModal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface Session {
  id: number;
  duration: number;
  intensity: string;
  discipline: string;
  punchType?: string;
  createdAt: string;
}

interface Horse {
  id: string | number;
  name: string;
  gender: string;
  age: number | null;
  breed: string | null;
  owner: string | null;
  photoUrl?: string | null;
  temperament?: string | null;
  skillLevel?: string | null;
  trainingStatus?: string | null;
  ridingSuitability?: string | null;
  sessions: Session[];
}

const PUNCH_TYPES = [
  { value: "training", label: "Training" },
  { value: "lesson", label: "Lesson" },
  { value: "free_ride", label: "Free Ride" },
  { value: "competition", label: "Competition" },
  { value: "rest", label: "Rest Day" },
  { value: "medical_rest", label: "Medical Rest" },
];

interface RiderOption {
  id: string;
  name: string;
}

export default function HorsesPage() {
  const router = useRouter();
  const [horses, setHorses] = useState<Horse[]>([]);
  const [riders, setRiders] = useState<RiderOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { profile } = useProfile();
  const role = profile?.role ?? null;

  const [showModal, setShowModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [addHorseLoading, setAddHorseLoading] = useState(false);
  const [logSessionLoading, setLogSessionLoading] = useState(false);

  const [selectedHorse, setSelectedHorse] = useState<Horse | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const deleteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastDeleted = useRef<Horse | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
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

  const [sessionForm, setSessionForm] = useState({
    punchType: "training",
    duration: 30,
    intensity: "Medium",
    discipline: "Flatwork",
    rider: "",
    notes: "",
  });

  const [subscription, setSubscription] = useState<{ canAddHorse: boolean } | null>(null);

  useEffect(() => {
    if (!profile) return;
    if (profile.role === "student") {
      router.replace("/dashboard/my-horses");
      return;
    }
    fetchHorses();
    fetch("/api/subscription")
      .then((r) => r.json())
      .then((d) => setSubscription(d))
      .catch(() => setSubscription(null));
    fetch("/api/riders")
      .then((r) => r.json())
      .then((data) => setRiders(Array.isArray(data) ? data : []))
      .catch(() => setRiders([]));
  }, [profile]);

  const fetchHorses = async () => {
    try {
      const res = await fetch("/api/horses");
      const data = await res.json();
      setHorses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setHorses([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateWorkload = (horse: Horse) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentSessions =
      horse?.sessions?.filter(
        (s) =>
          new Date(s.createdAt) >= sevenDaysAgo &&
          s.punchType !== "rest" &&
          s.punchType !== "medical_rest" &&
          s.punchType !== "medical"
      ) ?? [];

    const totalMinutes = recentSessions.reduce((sum, s) => sum + (s.duration ?? 0), 0);
    const hardSessions = recentSessions.filter(
      (s) => (s.intensity ?? "").toLowerCase() === "hard"
    ).length;
    const warning =
      recentSessions.length > 5 || hardSessions >= 3 || totalMinutes >= 300;

    return {
      sessionsCount: recentSessions.length,
      totalMinutes,
      hardSessions,
      warning,
    };
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/horses/upload-photo", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Upload failed");
        return;
      }
      setForm((f) => ({ ...f, photoUrl: data.url }));
      showToast("Photo uploaded");
    } catch {
      showToast("Upload failed");
    }
    e.target.value = "";
  };

  const handleSessionChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setSessionForm({ ...sessionForm, [e.target.name]: e.target.value });
  };

  const addHorse = async () => {
    setAddHorseLoading(true);
    try {
      const res = await fetch("/api/horses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          gender: form.gender,
          age: form.age ? Number(form.age) : null,
          breed: form.breed || null,
          owner: form.owner || null,
          color: form.color || null,
          markings: form.markings || null,
          height: form.height ? Number(form.height) : null,
          microchip: form.microchip || null,
          ueln: form.ueln || null,
          dateOfBirth: form.dateOfBirth || null,
          photoUrl: form.photoUrl || null,
          temperament: form.temperament || null,
          skillLevel: form.skillLevel || null,
          trainingStatus: form.trainingStatus || null,
          ridingSuitability: form.ridingSuitability || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.code === "LIMIT_REACHED") {
          setShowModal(false);
          setShowUpgradeModal(true);
        } else {
          showToast(data.error || "Failed to add horse");
        }
        return;
      }
      setHorses((prev) => [data, ...prev]);

      setShowModal(false);
      setForm({
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

      showToast("Horse added successfully");
    } catch (err) {
      console.error(err);
    } finally {
      setAddHorseLoading(false);
    }
  };

  const deleteHorse = (id: string | number) => {
    const horseToDelete = horses.find((h) => h.id === id);
    if (!horseToDelete) return;

    lastDeleted.current = horseToDelete;
    setHorses((prev) => prev.filter((h) => h.id !== id));
    setToast("Horse deleted");

    deleteTimer.current = setTimeout(async () => {
      await fetch(`/api/horses/${id}`, { method: "DELETE" });
      lastDeleted.current = null;
      setToast(null);
    }, 4000);
  };

  const undoDelete = () => {
    if (!lastDeleted.current) return;
    if (deleteTimer.current) clearTimeout(deleteTimer.current);

    setHorses((prev) => [lastDeleted.current!, ...prev]);
    lastDeleted.current = null;
    setToast(null);
  };

  const saveSession = async () => {
    if (!selectedHorse) return;

    const isRest =
      sessionForm.punchType === "rest" || sessionForm.punchType === "medical_rest";

    setLogSessionLoading(true);
    try {
      await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          horseId: selectedHorse.id,
          punchType: sessionForm.punchType,
          duration: isRest ? 0 : sessionForm.duration,
          intensity: isRest ? "light" : sessionForm.intensity,
          discipline: isRest ? "rest" : sessionForm.discipline,
          rider: sessionForm.rider || null,
          notes: sessionForm.notes || null,
        }),
      });

      setShowSessionModal(false);
      setSelectedHorse(null);
      setSessionForm({
        punchType: "training",
        duration: 30,
        intensity: "Medium",
        discipline: "Flatwork",
        rider: "",
        notes: "",
      });
      showToast("Session logged successfully");
      fetchHorses();
    } catch (err) {
      console.error(err);
    } finally {
      setLogSessionLoading(false);
    }
  };

  const openSessionModal = (horse: Horse) => {
    setSelectedHorse(horse);
    setSessionForm({
      punchType: "training",
      duration: 30,
      intensity: "Medium",
      discipline: "Flatwork",
      rider: "",
      notes: "",
    });
    setShowSessionModal(true);
  };

  const filteredHorses = horses.filter((horse) =>
    (horse.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const formInput = "w-full px-4 py-3 bg-black border border-white/10 text-white placeholder-white/40 focus:border-white/30 focus:outline-none";
  const btnPrimary = "px-4 py-2.5 bg-white text-black font-medium text-sm uppercase tracking-wider hover:opacity-95 transition";
  const btnSecondary = "px-4 py-2.5 border border-white/10 text-white text-sm uppercase tracking-wider hover:border-white/30 transition";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="font-serif text-2xl md:text-3xl font-normal text-white">Horses</h1>
        <div className="flex items-center gap-2">
          {subscription && !subscription.canAddHorse && (
            <Link
              href="/dashboard/settings"
              className="text-white/60 hover:text-white text-xs uppercase tracking-wider"
            >
              Upgrade to add more →
            </Link>
          )}
          <button
            onClick={() => {
              if (subscription && !subscription.canAddHorse) {
                setShowUpgradeModal(true);
              } else {
                setShowModal(true);
              }
            }}
            className={btnPrimary}
          >
            + Add Horse
          </button>
        </div>
      </div>

      <input
        placeholder="Search horses..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-3 bg-black border border-white/10 text-white placeholder-white/40 focus:border-white/30 focus:outline-none"
      />

      <div className="border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 text-white/50 text-xs uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4 text-left">Name</th>
                <th className="px-6 py-4 text-left">Gender</th>
                <th className="px-6 py-4 text-left">Age</th>
                <th className="px-6 py-4 text-left">Level</th>
                <th className="px-6 py-4 text-left">Owner</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-white/50">
                    Loading...
                  </td>
                </tr>
              ) : (
                filteredHorses.map((horse) => {
                  const workload = calculateWorkload(horse);

                  return (
                    <tr key={horse.id} className="border-t border-white/10 hover:bg-white/[0.02]">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <HorseAvatar
                            photoUrl={horse.photoUrl}
                            name={horse.name}
                            size="sm"
                          />
                          <Link
                            href={`/dashboard/horses/${horse.id}`}
                            className="font-medium text-white hover:underline"
                          >
                            {horse.name}
                          </Link>
                          {workload.warning && (
                            <span className="text-xs border border-white/30 text-white/80 px-2 py-0.5 uppercase tracking-wider">
                              Overworked
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white/80">{horse.gender}</td>
                      <td className="px-6 py-4 text-white/80">{horse.age ?? "—"}</td>
                      <td className="px-6 py-4 text-white/50">
                        {horse.skillLevel || "—"}
                      </td>
                      <td className="px-6 py-4 text-white/80">{horse.owner ?? "—"}</td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <button
                          onClick={() => openSessionModal(horse)}
                          className="text-white hover:underline text-sm uppercase tracking-wider"
                        >
                          Log Session
                        </button>
                        <button
                          onClick={() => deleteHorse(horse.id)}
                          className="text-white/60 hover:text-white hover:underline text-sm uppercase tracking-wider"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Horse Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 modal-backdrop overflow-y-auto sm:items-center"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-black border border-white/10 p-4 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto modal-enter my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-serif text-xl text-white mb-6">Add Horse</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                name="name"
                placeholder="Name *"
                value={form.name}
                onChange={handleChange}
                className={`sm:col-span-2 ${formInput}`}
              />
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className={formInput}
              >
                <option value="Stallion">Stallion</option>
                <option value="Mare">Mare</option>
                <option value="Gelding">Gelding</option>
              </select>
              <input
                name="age"
                type="number"
                placeholder="Age"
                value={form.age}
                onChange={handleChange}
                className={formInput}
              />
              <input
                name="breed"
                placeholder="Breed"
                value={form.breed}
                onChange={handleChange}
                className={`sm:col-span-2 ${formInput}`}
              />
              <input
                name="owner"
                placeholder="Owner"
                value={form.owner}
                onChange={handleChange}
                className={`sm:col-span-2 ${formInput}`}
              />
              <input
                name="color"
                placeholder="Colour"
                value={form.color}
                onChange={handleChange}
                className={formInput}
              />
              <input
                name="markings"
                placeholder="Markings"
                value={form.markings}
                onChange={handleChange}
                className={formInput}
              />
              <input
                name="height"
                type="number"
                placeholder="Height (cm)"
                value={form.height}
                onChange={handleChange}
                className={formInput}
              />
              <input
                name="microchip"
                placeholder="Microchip"
                value={form.microchip}
                onChange={handleChange}
                className={formInput}
              />
              <input
                name="ueln"
                placeholder="UELN"
                value={form.ueln}
                onChange={handleChange}
                className={formInput}
              />
              <input
                name="dateOfBirth"
                type="date"
                placeholder="Date of birth"
                value={form.dateOfBirth}
                onChange={handleChange}
                className={formInput}
              />
              <div className="sm:col-span-2">
                <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">
                  Profile picture
                </label>
                <div className="flex items-center gap-4">
                  <HorseAvatar
                    photoUrl={form.photoUrl || null}
                    name={form.name || "Horse"}
                    size="lg"
                  />
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      ref={photoInputRef}
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="block px-4 py-2.5 border border-white/10 text-white text-sm uppercase tracking-wider hover:border-white/30 transition"
                    >
                      Upload photo
                    </button>
                    <input
                      name="photoUrl"
                      placeholder="Or paste image URL"
                      value={form.photoUrl}
                      onChange={handleChange}
                      className={`w-full ${formInput} text-sm`}
                    />
                  </div>
                </div>
              </div>
              <select
                name="temperament"
                value={form.temperament}
                onChange={handleChange}
                className={formInput}
              >
                <option value="calm">Calm</option>
                <option value="energetic">Energetic</option>
                <option value="sensitive">Sensitive</option>
                <option value="beginner-safe">Beginner-safe</option>
              </select>
              <select
                name="skillLevel"
                value={form.skillLevel}
                onChange={handleChange}
                className={formInput}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <select
                name="trainingStatus"
                value={form.trainingStatus}
                onChange={handleChange}
                className={formInput}
              >
                <option value="green">Green</option>
                <option value="schooling">Schooling</option>
                <option value="competition-ready">Competition-ready</option>
              </select>
              <select
                name="ridingSuitability"
                value={form.ridingSuitability}
                onChange={handleChange}
                className={formInput}
              >
                <option value="kids">Kids</option>
                <option value="adults">Adults</option>
                <option value="jumping">Jumping</option>
                <option value="dressage">Dressage</option>
                <option value="trail">Trail</option>
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className={`flex-1 ${btnSecondary}`}
              >
                Cancel
              </button>
              <button
                onClick={addHorse}
                disabled={addHorseLoading}
                className={`flex-1 ${btnPrimary} disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              >
                {addHorseLoading ? (
                  <>
                    <LoadingSpinner size={16} className="text-black" />
                    Adding…
                  </>
                ) : (
                  "Add Horse"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Session Modal */}
      {showSessionModal && selectedHorse && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 modal-backdrop overflow-y-auto sm:items-center"
          onClick={() => setShowSessionModal(false)}
        >
          <div
            className="bg-black border border-white/10 p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto modal-enter my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-serif text-xl text-white mb-2 flex items-center gap-2">
              <HorseAvatar
                photoUrl={selectedHorse.photoUrl}
                name={selectedHorse.name}
                size="sm"
              />
              Log Session — {selectedHorse.name}
            </h2>
            <p className="text-sm text-white/60 mb-4">
              One-tap training punch for workload intelligence
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">
                  Session Type
                </label>
                <select
                  name="punchType"
                  value={sessionForm.punchType}
                  onChange={handleSessionChange}
                  className={formInput}
                >
                  {PUNCH_TYPES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              {sessionForm.punchType !== "rest" &&
                sessionForm.punchType !== "medical_rest" && (
                  <>
                    <div>
                      <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">
                        Duration (min)
                      </label>
                      <input
                        name="duration"
                        type="number"
                        min={5}
                        max={180}
                        value={sessionForm.duration}
                        onChange={handleSessionChange}
                        className={formInput}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">
                        Intensity
                      </label>
                      <select
                        name="intensity"
                        value={sessionForm.intensity}
                        onChange={handleSessionChange}
                        className={formInput}
                      >
                        <option value="Light">Light</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">
                        Discipline
                      </label>
                      <select
                        name="discipline"
                        value={sessionForm.discipline}
                        onChange={handleSessionChange}
                        className={formInput}
                      >
                        <option value="Flatwork">Flatwork</option>
                        <option value="Jumping">Jumping</option>
                        <option value="Trail">Trail</option>
                        <option value="Dressage">Dressage</option>
                      </select>
                    </div>
                  </>
                )}
              <div>
                <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">
                  Rider
                </label>
                <select
                  name="rider"
                  value={sessionForm.rider}
                  onChange={handleSessionChange}
                  className={formInput}
                >
                  <option value="">No rider</option>
                  {riders.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                name="notes"
                placeholder="Notes (behavior, progress, issues)"
                value={sessionForm.notes}
                onChange={handleSessionChange}
                rows={2}
                className={`${formInput} resize-none`}
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSessionModal(false)}
                className={`flex-1 ${btnSecondary}`}
              >
                Cancel
              </button>
              <button
                onClick={saveSession}
                disabled={logSessionLoading}
                className={`flex-1 ${btnPrimary} disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              >
                {logSessionLoading ? (
                  <>
                    <LoadingSpinner size={16} className="text-black" />
                    Logging…
                  </>
                ) : (
                  "Log Session"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-auto bg-black px-4 sm:px-5 py-3 border border-white/10 flex gap-4 items-center">
          <span className="text-white text-sm">{toast}</span>
          {lastDeleted.current && (
            <button onClick={undoDelete} className="text-white text-sm uppercase tracking-wider hover:underline">
              Undo
            </button>
          )}
        </div>
      )}

      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        type="horses"
      />
    </div>
  );
}
