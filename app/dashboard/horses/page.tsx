"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProfile } from "@/components/providers/ProfileProvider";
import HorseStatusPill from "@/components/ui/HorseStatusPill";
import { HorseAvatar } from "@/components/HorseAvatar";
import UpgradePlanModal from "@/components/dashboard/UpgradePlanModal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import TableSkeleton from "@/components/ui/TableSkeleton";
import HorseIdentificationFields from "@/components/ui/HorseIdentificationFields";
import GuidedTourOverlay, { type GuidedTourStep } from "@/components/dashboard/GuidedTourOverlay";
import { usePageTour } from "@/components/dashboard/usePageTour";
import { trackEvent } from "@/lib/analytics/mixpanel-client";
import { useLanguage } from "@/components/providers/LanguageProvider";

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
  registeredName?: string | null;
  horseCategory?: string | null;
  passportNumber?: string | null;
  feiId?: string | null;
  studbook?: string | null;
  sireName?: string | null;
  damName?: string | null;
  countryOfBirth?: string | null;
  temperament?: string | null;
  skillLevel?: string | null;
  trainingStatus?: string | null;
  ridingSuitability?: string | null;
  sessions: Session[];
}

const PUNCH_TYPES = [
  "training",
  "lesson",
  "free_ride",
  "competition",
  "rest",
  "medical_rest",
] as const;

interface RiderOption {
  id: string;
  name: string;
}

export default function HorsesPage() {
  const { t } = useLanguage();
  const levelLabel = (level?: string | null) => {
    const map: Record<string, string> = {
      beginner: t("dashboard.horsesLevelBeginner"),
      intermediate: t("dashboard.horsesLevelIntermediate"),
      advanced: t("dashboard.horsesLevelAdvanced"),
    };
    return level ? map[level] ?? level : null;
  };

  const trainingLabel = (status?: string | null) => {
    const map: Record<string, string> = {
      green: t("dashboard.horsesTrainingGreen"),
      schooling: t("dashboard.horsesTrainingSchooling"),
      "competition-ready": t("dashboard.horsesTrainingCompetitionReady"),
    };
    return status ? map[status] ?? status : null;
  };

  const iconBtn =
    "inline-flex h-9 w-9 items-center justify-center border border-black/15 text-black/70 hover:bg-black/[0.04] hover:text-black dark:border-white/20 dark:text-white/70 dark:hover:bg-white/5 dark:hover:text-white";

  const punchLabel = (type?: string | null) => {
    const map: Record<string, string> = {
      training: t("dashboard.punchTraining"),
      lesson: t("dashboard.punchLesson"),
      free_ride: t("dashboard.punchFreeRide"),
      competition: t("dashboard.punchCompetition"),
      rest: t("dashboard.punchRest"),
      medical_rest: t("dashboard.punchMedicalRest"),
      medical: t("dashboard.punchMedicalRest"),
    };
    return map[type || ""] ?? (type || "—");
  };

  const router = useRouter();
  const [horses, setHorses] = useState<Horse[]>([]);
  const [riders, setRiders] = useState<RiderOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { profile } = useProfile();
  const role = profile?.role ?? null;
  const { open: showTour, complete: completeTour } = usePageTour(
    "saddleup_tour_horses_v1",
    !loading && role !== "student"
  );

  const tourSteps: GuidedTourStep[] = [
    {
      id: "add",
      title: t("dashboard.horsesTourAddTitle"),
      description: t("dashboard.horsesTourAddDesc"),
      selector: '[data-tour="horses-add"]',
    },
    {
      id: "search",
      title: t("dashboard.horsesTourSearchTitle"),
      description: t("dashboard.horsesTourSearchDesc"),
      selector: '[data-tour="horses-search"]',
    },
    {
      id: "table",
      title: t("dashboard.horsesTourListTitle"),
      description: t("dashboard.horsesTourListDesc"),
      selector: '[data-tour="horses-table"]',
    },
    {
      id: "log",
      title: t("dashboard.horsesTourLogTitle"),
      description: t("dashboard.horsesTourLogDesc"),
      selector: '[data-tour="horses-log-session"]',
    },
  ];

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
    registeredName: "",
    horseCategory: "",
    gender: "Gelding",
    dateOfBirth: "",
    age: "",
    breed: "",
    color: "",
    markings: "",
    height: "",
    microchip: "",
    ueln: "",
    passportNumber: "",
    feiId: "",
    studbook: "",
    sireName: "",
    damName: "",
    countryOfBirth: "",
    owner: "",
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
    setLoading(true);
    (async () => {
      try {
        const [horsesRes, subRes, ridersRes] = await Promise.all([
          fetch("/api/horses"),
          fetch("/api/subscription"),
          fetch("/api/riders"),
        ]);
        const horsesData = await horsesRes.json();
        const subData = subRes.ok ? await subRes.json() : null;
        const ridersData = await ridersRes.json();
        setHorses(Array.isArray(horsesData) ? horsesData : []);
        setSubscription(
          subData && typeof subData === "object" && "canAddHorse" in subData
            ? subData
            : null
        );
        setRiders(Array.isArray(ridersData) ? ridersData : []);
      } catch {
        setHorses([]);
        setSubscription(null);
        setRiders([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [profile, router]);

  const fetchHorses = async () => {
    try {
      const res = await fetch("/api/horses");
      const data = await res.json();
      setHorses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setHorses([]);
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    trackEvent("horse_photo_upload_attempted", {
      mime_type: file.type || null,
      file_size_bytes: file.size,
    });
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/horses/upload-photo", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        trackEvent("horse_photo_upload_failed");
        showToast(data.error || t("dashboard.horseToastUploadFailed"));
        return;
      }
      setForm((f) => ({ ...f, photoUrl: data.url }));
      trackEvent("horse_photo_uploaded");
      showToast(t("dashboard.horseToastPhotoUploaded"));
    } catch {
      trackEvent("horse_photo_upload_failed");
      showToast(t("dashboard.horseToastUploadFailed"));
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
    trackEvent("horse_add_attempted");
    try {
      const res = await fetch("/api/horses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          registeredName: form.registeredName || null,
          horseCategory: form.horseCategory || null,
          gender: form.gender,
          age: form.age ? Number(form.age) : null,
          breed: form.breed || null,
          owner: form.owner || null,
          color: form.color || null,
          markings: form.markings || null,
          height: form.height ? Number(form.height) : null,
          microchip: form.microchip || null,
          ueln: form.ueln || null,
          passportNumber: form.passportNumber || null,
          feiId: form.feiId || null,
          studbook: form.studbook || null,
          sireName: form.sireName || null,
          damName: form.damName || null,
          countryOfBirth: form.countryOfBirth || null,
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
          showToast(data.error || t("dashboard.horsesAddFailed"));
        }
        trackEvent("horse_add_failed");
        return;
      }
      setHorses((prev) => [data, ...prev]);
      trackEvent("horse_add_succeeded", { horse_id: data.id ?? null });

      setShowModal(false);
      setForm({
        name: "",
        registeredName: "",
        horseCategory: "",
        gender: "Gelding",
        dateOfBirth: "",
        age: "",
        breed: "",
        color: "",
        markings: "",
        height: "",
        microchip: "",
        ueln: "",
        passportNumber: "",
        feiId: "",
        studbook: "",
        sireName: "",
        damName: "",
        countryOfBirth: "",
        owner: "",
        photoUrl: "",
        temperament: "calm",
        skillLevel: "intermediate",
        trainingStatus: "schooling",
        ridingSuitability: "adults",
      });

      showToast(t("dashboard.horsesAdded"));
    } catch (err) {
      trackEvent("horse_add_failed");
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
    trackEvent("horse_delete_soft", { horse_id: String(id) });
    setToast(t("dashboard.horsesDeleted"));

    deleteTimer.current = setTimeout(async () => {
      await fetch(`/api/horses/${id}`, { method: "DELETE" });
      trackEvent("horse_delete_committed", { horse_id: String(id) });
      lastDeleted.current = null;
      setToast(null);
    }, 4000);
  };

  const undoDelete = () => {
    if (!lastDeleted.current) return;
    if (deleteTimer.current) clearTimeout(deleteTimer.current);

    setHorses((prev) => [lastDeleted.current!, ...prev]);
    trackEvent("horse_delete_undone", { horse_id: String(lastDeleted.current.id) });
    lastDeleted.current = null;
    setToast(null);
  };

  const saveSession = async () => {
    if (!selectedHorse) return;

    const isRest =
      sessionForm.punchType === "rest" || sessionForm.punchType === "medical_rest";

    setLogSessionLoading(true);
    trackEvent("horse_session_log_attempted", {
      horse_id: String(selectedHorse.id),
      punch_type: sessionForm.punchType,
    });
    try {
      const res = await fetch("/api/sessions", {
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
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        trackEvent("horse_session_log_failed", { horse_id: String(selectedHorse.id) });
        throw new Error(typeof data.error === "string" ? data.error : t("dashboard.horsesSessionLogFailed"));
      }

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
      trackEvent("horse_session_logged", {
        horse_id: String(selectedHorse.id),
        punch_type: sessionForm.punchType,
      });
      showToast(t("dashboard.horsesSessionLogged"));
      fetchHorses();
    } catch (err) {
      trackEvent("horse_session_log_failed", { horse_id: String(selectedHorse.id) });
      console.error(err);
      showToast(err instanceof Error ? err.message : t("dashboard.horsesSessionLogFailed"));
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

  const formInput = "w-full px-4 py-3 bg-base border border-black/10 text-black placeholder-black/40 focus:border-black/30 focus:outline-none";
  const btnPrimary = "px-4 py-2.5 bg-accent text-white font-medium text-sm uppercase tracking-wider hover:opacity-95 transition";
  const btnSecondary = "px-4 py-2.5 border border-black/10 text-black text-sm uppercase tracking-wider hover:border-black/30 transition";

  return (
    <div className="space-y-6">
      <GuidedTourOverlay
        open={showTour}
        steps={tourSteps}
        onSkip={completeTour}
        onComplete={completeTour}
      />
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="font-serif text-2xl md:text-3xl font-normal text-black">{t("dashboard.horsesTitle")}</h1>
        <div className="flex items-center gap-2">
          {subscription && !subscription.canAddHorse && (
            <Link
              href="/dashboard/settings"
              className="text-black/60 hover:text-black text-xs uppercase tracking-wider"
            >
              {t("dashboard.horsesUpgradeToAddMore")}
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
            data-tour="horses-add"
            className={btnPrimary}
          >
            {t("dashboard.addHorse")}
          </button>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={6} cols={5} />
      ) : (
        <>
      <input
        placeholder={t("dashboard.horsesSearchPlaceholder")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        data-tour="horses-search"
        className="w-full px-4 py-3 bg-base border border-black/10 text-black placeholder-black/40 focus:border-black/30 focus:outline-none"
      />

      <div className="border border-black/10 overflow-hidden" data-tour="horses-table">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-black/10 text-black/50 text-xs uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4 text-left">{t("dashboard.horsesColName")}</th>
                <th className="px-6 py-4 text-left">{t("dashboard.horsesColGender")}</th>
                <th className="px-6 py-4 text-left">{t("dashboard.horsesColAge")}</th>
                <th className="px-6 py-4 text-left">{t("dashboard.horsesColLevel")}</th>
                <th className="px-6 py-4 text-left">{t("dashboard.horsesColOwner")}</th>
                <th className="px-6 py-4 text-right">{t("dashboard.horsesColActions")}</th>
              </tr>
            </thead>

            <tbody className="[&_tr]:border-t [&_tr]:border-black/10">
                {filteredHorses.map((horse) => {
                  const workload = calculateWorkload(horse);

                  return (
                    <tr key={horse.id} className="hover:bg-black/[0.02]">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <HorseAvatar
                            photoUrl={horse.photoUrl}
                            name={horse.name}
                            size="sm"
                          />
                          <Link
                            href={`/dashboard/horses/${horse.id}`}
                            className="font-medium text-black hover:underline"
                          >
                            {horse.name}
                          </Link>
                          {workload.warning && (
                            <HorseStatusPill
                              label={t("dashboard.horsesOverworked")}
                              tone="warn"
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-black/80 dark:text-white/80">{horse.gender}</td>
                      <td className="px-6 py-5 text-black/80 dark:text-white/80">{horse.age ?? "—"}</td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-1.5">
                          {levelLabel(horse.skillLevel) ? (
                            <HorseStatusPill label={levelLabel(horse.skillLevel)!} tone="accent" />
                          ) : (
                            <span className="text-black/40 dark:text-white/40">—</span>
                          )}
                          {trainingLabel(horse.trainingStatus) ? (
                            <HorseStatusPill label={trainingLabel(horse.trainingStatus)!} />
                          ) : null}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-black/80 dark:text-white/80">{horse.owner ?? "—"}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/dashboard/horses/${horse.id}`}
                            className={iconBtn}
                            title={t("dashboard.horsesActionView")}
                            aria-label={t("dashboard.horsesActionView")}
                          >
                            ↗
                          </Link>
                          <button
                            type="button"
                            onClick={() => openSessionModal(horse)}
                            data-tour="horses-log-session"
                            className={iconBtn}
                            title={t("dashboard.scheduleLogSession")}
                            aria-label={t("dashboard.scheduleLogSession")}
                          >
                            ✎
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteHorse(horse.id)}
                            className={iconBtn}
                            title={t("dashboard.teamRidersDelete")}
                            aria-label={t("dashboard.teamRidersDelete")}
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}

      {/* Add Horse Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 modal-backdrop overflow-y-auto sm:items-center"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-base border border-black/10 p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto modal-enter my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-serif text-xl text-black mb-6">{t("dashboard.addHorse")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <HorseIdentificationFields form={form} onChange={handleChange} formInput={formInput} />
              <p className="sm:col-span-2 text-xs uppercase tracking-widest text-black/50 mb-0">
                {t("dashboard.horsesProfileTraining")}
              </p>
              <div className="sm:col-span-2">
                <label className="text-xs text-black/50 uppercase tracking-widest block mb-2">
                  {t("dashboard.horsesProfilePicture")}
                </label>
                <div className="flex items-center gap-4">
                  <HorseAvatar
                    photoUrl={form.photoUrl || null}
                    name={form.name || t("dashboard.horsesHorseFallback")}
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
                      className="block px-4 py-2.5 border border-black/10 text-black text-sm uppercase tracking-wider hover:border-black/30 transition"
                    >
                      {t("dashboard.horsesUploadPhoto")}
                    </button>
                    <input
                      name="photoUrl"
                      placeholder={t("dashboard.horsesImageUrlPlaceholder")}
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
                <option value="calm">{t("dashboard.horsesTemperamentCalm")}</option>
                <option value="energetic">{t("dashboard.horsesTemperamentEnergetic")}</option>
                <option value="sensitive">{t("dashboard.horsesTemperamentSensitive")}</option>
                <option value="beginner-safe">{t("dashboard.horsesTemperamentBeginnerSafe")}</option>
              </select>
              <select
                name="skillLevel"
                value={form.skillLevel}
                onChange={handleChange}
                className={formInput}
              >
                <option value="beginner">{t("dashboard.horsesLevelBeginner")}</option>
                <option value="intermediate">{t("dashboard.horsesLevelIntermediate")}</option>
                <option value="advanced">{t("dashboard.horsesLevelAdvanced")}</option>
              </select>
              <select
                name="trainingStatus"
                value={form.trainingStatus}
                onChange={handleChange}
                className={formInput}
              >
                <option value="green">{t("dashboard.horsesTrainingGreen")}</option>
                <option value="schooling">{t("dashboard.horsesTrainingSchooling")}</option>
                <option value="competition-ready">{t("dashboard.horsesTrainingCompetitionReady")}</option>
              </select>
              <select
                name="ridingSuitability"
                value={form.ridingSuitability}
                onChange={handleChange}
                className={formInput}
              >
                <option value="kids">{t("dashboard.horsesSuitabilityKids")}</option>
                <option value="adults">{t("dashboard.horsesSuitabilityAdults")}</option>
                <option value="jumping">{t("dashboard.horsesSuitabilityJumping")}</option>
                <option value="dressage">{t("dashboard.horsesSuitabilityDressage")}</option>
                <option value="trail">{t("dashboard.horsesSuitabilityTrail")}</option>
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className={`flex-1 ${btnSecondary}`}
              >
                {t("dashboard.bookingsCancel")}
              </button>
              <button
                onClick={addHorse}
                disabled={addHorseLoading}
                className={`flex-1 ${btnPrimary} disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              >
                {addHorseLoading ? (
                  <>
                    <LoadingSpinner size={16} className="text-black" />
                    {t("dashboard.horsesAdding")}
                  </>
                ) : (
                  t("dashboard.addHorse")
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
            className="bg-base border border-black/10 p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto modal-enter my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-serif text-xl text-black mb-2 flex items-center gap-2">
              <HorseAvatar
                photoUrl={selectedHorse.photoUrl}
                name={selectedHorse.name}
                size="sm"
              />
              {t("dashboard.horsesLogSessionTitle")} — {selectedHorse.name}
            </h2>
            <p className="text-sm text-black/60 mb-4">
              {t("dashboard.horsesLogSessionLead")}
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-black/50 uppercase tracking-widest block mb-2">
                  {t("dashboard.horsesSessionType")}
                </label>
                <select
                  name="punchType"
                  value={sessionForm.punchType}
                  onChange={handleSessionChange}
                  className={formInput}
                >
                  {PUNCH_TYPES.map((p) => (
                    <option key={p} value={p}>
                      {punchLabel(p)}
                    </option>
                  ))}
                </select>
              </div>
              {sessionForm.punchType !== "rest" &&
                sessionForm.punchType !== "medical_rest" && (
                  <>
                    <div>
                      <label className="text-xs text-black/50 uppercase tracking-widest block mb-2">
                        {t("dashboard.horsesDurationMin")}
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
                      <label className="text-xs text-black/50 uppercase tracking-widest block mb-2">
                        {t("dashboard.horsesIntensity")}
                      </label>
                      <select
                        name="intensity"
                        value={sessionForm.intensity}
                        onChange={handleSessionChange}
                        className={formInput}
                      >
                        <option value="Light">{t("dashboard.horsesIntensityLight")}</option>
                        <option value="Medium">{t("dashboard.horsesIntensityMedium")}</option>
                        <option value="Hard">{t("dashboard.horsesIntensityHard")}</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-black/50 uppercase tracking-widest block mb-2">
                        {t("dashboard.horsesDiscipline")}
                      </label>
                      <select
                        name="discipline"
                        value={sessionForm.discipline}
                        onChange={handleSessionChange}
                        className={formInput}
                      >
                        <option value="Flatwork">{t("dashboard.horsesDisciplineFlatwork")}</option>
                        <option value="Jumping">{t("dashboard.horsesDisciplineJumping")}</option>
                        <option value="Trail">{t("dashboard.horsesDisciplineTrail")}</option>
                        <option value="Dressage">{t("dashboard.horsesDisciplineDressage")}</option>
                      </select>
                    </div>
                  </>
                )}
              <div>
                <label className="text-xs text-black/50 uppercase tracking-widest block mb-2">
                  {t("dashboard.incidentsLabelRiderOptional")}
                </label>
                <select
                  name="rider"
                  value={sessionForm.rider}
                  onChange={handleSessionChange}
                  className={formInput}
                >
                  <option value="">{t("dashboard.horsesNoRider")}</option>
                  {riders.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                name="notes"
                placeholder={t("dashboard.horsesNotesPlaceholder")}
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
                {t("dashboard.bookingsCancel")}
              </button>
              <button
                onClick={saveSession}
                disabled={logSessionLoading}
                className={`flex-1 ${btnPrimary} disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              >
                {logSessionLoading ? (
                  <>
                    <LoadingSpinner size={16} className="text-black" />
                    {t("dashboard.horsesLogging")}
                  </>
                ) : (
                  t("dashboard.scheduleLogSession")
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast-enter fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-auto bg-base px-4 sm:px-5 py-3 border border-black/10 flex gap-4 items-center z-[80]">
          <span className="text-black text-sm">{toast}</span>
          {lastDeleted.current && (
            <button onClick={undoDelete} className="text-black text-sm uppercase tracking-wider hover:underline">
              {t("dashboard.horsesUndo")}
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
