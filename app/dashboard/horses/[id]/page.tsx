"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useProfile } from "@/components/providers/ProfileProvider";
import { useParams, useSearchParams } from "next/navigation";
import { generateHorsePassportPdf } from "@/lib/generatePassportPdf";
import { HorseAvatar } from "@/components/HorseAvatar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import PageLoader from "@/components/ui/PageLoader";
import HorseIdentificationFields from "@/components/ui/HorseIdentificationFields";
import ModalOverlay from "@/components/ui/ModalOverlay";
import AddHealthRecordModal from "@/components/dashboard/AddHealthRecordModal";
import { useLanguage } from "@/components/providers/LanguageProvider";

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
  registeredName?: string | null;
  passportNumber?: string | null;
  feiId?: string | null;
  studbook?: string | null;
  horseCategory?: string | null;
  sireName?: string | null;
  damName?: string | null;
  countryOfBirth?: string | null;
  temperament: string | null;
  skillLevel: string | null;
  trainingStatus: string | null;
  ridingSuitability: string | null;
  sessions: Session[];
  healthLogs: HealthLog[];
  notes?: string;
}

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
  const searchParams = useSearchParams();
  const id = params.id as string;
  const { t, lang } = useLanguage();
  const dateLocale = lang === "ar" ? "ar-SA" : "en-US";
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
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [editForm, setEditForm] = useState({
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

  const punchLabel = (punchType: string) => {
    const map: Record<string, string> = {
      training: t("dashboard.punchTraining"),
      lesson: t("dashboard.punchLesson"),
      free_ride: t("dashboard.punchFreeRide"),
      competition: t("dashboard.punchCompetition"),
      rest: t("dashboard.punchRest"),
      medical_rest: t("dashboard.punchMedicalRest"),
      medical: t("dashboard.punchMedicalRest"),
    };
    return map[punchType] ?? punchType;
  };

  const healthLabel = (type: string) => {
    const map: Record<string, string> = {
      vet: t("dashboard.horseHealthVet"),
      vaccination: t("dashboard.horseHealthVaccination"),
      deworming: t("dashboard.horseHealthDeworming"),
      farrier: t("dashboard.horseHealthFarrier"),
      injury: t("dashboard.horseHealthInjury"),
    };
    return map[type] ?? type;
  };

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
      registeredName: horse.registeredName ?? "",
      horseCategory: horse.horseCategory ?? "",
      gender: horse.gender ?? "Gelding",
      dateOfBirth: horse.dateOfBirth ?? "",
      age: horse.age != null ? String(horse.age) : "",
      breed: horse.breed ?? "",
      color: horse.color ?? "",
      markings: horse.markings ?? "",
      height: horse.height != null ? String(horse.height) : "",
      microchip: horse.microchip ?? "",
      ueln: horse.ueln ?? "",
      passportNumber: horse.passportNumber ?? "",
      feiId: horse.feiId ?? "",
      studbook: horse.studbook ?? "",
      sireName: horse.sireName ?? "",
      damName: horse.damName ?? "",
      countryOfBirth: horse.countryOfBirth ?? "",
      owner: ownerVal,
      photoUrl: horse.photoUrl ?? "",
      temperament: horse.temperament ?? "calm",
      skillLevel: horse.skillLevel ?? "intermediate",
      trainingStatus: horse.trainingStatus?.replace(/_/g, "-") ?? "schooling",
      ridingSuitability: horse.ridingSuitability ?? "adults",
    });
    setShowEditModal(true);
  };

  const editQueryHandled = useRef(false);
  useEffect(() => {
    if (editQueryHandled.current) return;
    if (searchParams.get("edit") !== "1" || !horse) return;
    editQueryHandled.current = true;
    openEditModal();
    window.history.replaceState(null, "", `/dashboard/horses/${id}`);
  }, [horse, searchParams, id]);

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
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
        setToast(data.error || t("dashboard.horseToastUploadFailed"));
        return;
      }
      setEditForm((f) => ({ ...f, photoUrl: data.url }));
      setToast(t("dashboard.horseToastPhotoUploaded"));
    } catch {
      setToast(t("dashboard.horseToastUploadFailed"));
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
          registeredName: editForm.registeredName || null,
          horseCategory: editForm.horseCategory || null,
          gender: editForm.gender,
          age: editForm.age ? Number(editForm.age) : null,
          breed: editForm.breed || null,
          owner: editForm.owner || null,
          color: editForm.color || null,
          markings: editForm.markings || null,
          height: editForm.height ? Number(editForm.height) : null,
          microchip: editForm.microchip || null,
          ueln: editForm.ueln || null,
          passportNumber: editForm.passportNumber || null,
          feiId: editForm.feiId || null,
          studbook: editForm.studbook || null,
          sireName: editForm.sireName || null,
          damName: editForm.damName || null,
          countryOfBirth: editForm.countryOfBirth || null,
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
        setToast(data.error || t("dashboard.horseToastUpdateFailed"));
        setTimeout(() => setToast(null), 3000);
        return;
      }
      setShowEditModal(false);
      setToast(t("dashboard.horseToastHorseUpdated"));
      fetchHorse();
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error(err);
      setToast(t("dashboard.horseToastUpdateFailed"));
      setTimeout(() => setToast(null), 3000);
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
    return <PageLoader minHeight="min-h-[40vh]" message={t("common.loading")} />;
  }

  if (!horse) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard/horses"
          className="text-black/60 hover:text-black text-sm uppercase tracking-wider"
        >
          {t("dashboard.horseDetailBackHorses")}
        </Link>
        <p className="text-black/50">{t("dashboard.horseDetailNotFound")}</p>
      </div>
    );
  }

  const workload = calculateWorkload();

  const btnPrimary = "px-4 py-2.5 bg-accent text-white font-medium text-sm uppercase tracking-wider hover:opacity-95 transition flex items-center gap-2";
  const btnSecondary = "px-4 py-2.5 border border-black/10 text-black text-sm uppercase tracking-wider hover:border-black/30 transition";

  const formInput = "w-full px-4 py-3 bg-base border border-black/10 text-black placeholder-black/40 focus:border-black/30 focus:outline-none";

  return (
    <div className="space-y-6">
      {toast && (
        <div className="px-4 py-2 border border-black/10 text-black text-sm">
          {toast}
        </div>
      )}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link
          href={role === "student" ? "/dashboard/my-horses" : "/dashboard/horses"}
          className="text-black/60 hover:text-black text-sm uppercase tracking-wider"
        >
          {role === "student" ? t("dashboard.horseDetailBackMy") : t("dashboard.horseDetailBackHorses")}
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
                {t("dashboard.horseDetailEdit")}
              </button>
              <Link
                href={`/dashboard/horses?log=${horse.id}`}
                className={btnSecondary}
              >
                {t("dashboard.scheduleLogSession")}
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
            {t("dashboard.horseDetailDownloadPdf")}
          </button>
        </div>
      </div>

      {/* Passport Document */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-black/20 overflow-hidden">
          {/* Passport Header */}
          <div className="bg-base text-black px-6 py-4 border-b border-black/20">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-medium tracking-wider uppercase">
                  {t("dashboard.horsePassportTitle")}
                </h1>
                <p className="text-black/70 text-xs mt-1">
                  {t("dashboard.horsePassportSubtitle")}
                </p>
              </div>
              <div className="text-right text-xs text-black/70">
                <p>{t("dashboard.horsePassportIdLabel")} {typeof horse.id === "string" ? horse.id.slice(0, 8).toUpperCase() : String(horse.id).padStart(6, "0")}</p>
                {horse.ueln && <p>UELN: {horse.ueln}</p>}
              </div>
            </div>
          </div>

          {/* Passport body: .passport-document fixes dark-mode text (white-on-white) */}
          <div className="passport-document p-4 sm:p-6 md:p-8 bg-white">
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
                  {t("dashboard.horsePassportPhotograph")}
                </p>
              </div>

              {/* Section I: Identification of the animal */}
              <div>
                <h2 className="text-black font-medium text-sm uppercase tracking-wider mb-4 pb-2 border-b border-black/20">
                  {t("dashboard.horsePassportSection1")}
                </h2>
                <div className="space-y-0">
                  <PassportField label={t("dashboard.horsePassportFieldBarnName")} value={horse.name} />
                  <PassportField label={t("dashboard.horsePassportFieldRegisteredName")} value={horse.registeredName} />
                  <PassportField label={t("dashboard.horsePassportFieldHorseType")} value={horse.horseCategory} />
                  <PassportField label={t("dashboard.horsePassportFieldSex")} value={horse.gender} />
                  <PassportField label={t("dashboard.horsePassportFieldUeln")} value={horse.ueln} />
                  <PassportField label={t("dashboard.horsePassportFieldMicrochip")} value={horse.microchip} />
                  <PassportField label={t("dashboard.horsePassportFieldPassportNo")} value={horse.passportNumber} />
                  <PassportField label={t("dashboard.horsePassportFieldFei")} value={horse.feiId} />
                  <PassportField label={t("dashboard.horsePassportFieldStudbook")} value={horse.studbook} />
                  <PassportField label={t("dashboard.horsePassportFieldBreed")} value={horse.breed} />
                  <PassportField label={t("dashboard.horsePassportFieldCoat")} value={horse.color} />
                  <PassportField label={t("dashboard.horsePassportFieldMarkings")} value={horse.markings} />
                  <PassportField
                    label={t("dashboard.horsePassportFieldDob")}
                    value={
                      horse.dateOfBirth
                        ? new Date(horse.dateOfBirth).toLocaleDateString(dateLocale)
                        : horse.age != null
                          ? `~${new Date().getFullYear() - horse.age}`
                          : null
                    }
                  />
                  <PassportField label={t("dashboard.horsePassportFieldHeight")} value={horse.height} />
                  <PassportField label={t("dashboard.horsePassportFieldSire")} value={horse.sireName} />
                  <PassportField label={t("dashboard.horsePassportFieldDam")} value={horse.damName} />
                  <PassportField label={t("dashboard.horsePassportFieldCountryBirth")} value={horse.countryOfBirth} />
                </div>
              </div>
            </div>

            {/* Section II: Owner & Riding suitability */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h2 className="text-black font-medium text-sm uppercase tracking-wider mb-4 pb-2 border-b border-black/20">
                  {t("dashboard.horsePassportSectionOwner")}
                </h2>
                <div className="space-y-0">
                  <PassportField label={t("dashboard.horsePassportFieldRegOwner")} value={horse.owner} />
                  <PassportField label={t("dashboard.horsePassportFieldTemperament")} value={horse.temperament} />
                  <PassportField label={t("dashboard.horsePassportFieldSkillLevel")} value={horse.skillLevel} />
                  <PassportField
                    label={t("dashboard.horsePassportFieldTrainingStatus")}
                    value={horse.trainingStatus?.replace(/_/g, " ")}
                  />
                  <PassportField label={t("dashboard.horsePassportFieldRidingSuitability")} value={horse.ridingSuitability} />
                </div>
              </div>

              {/* Workload summary */}
              <div>
                <h2 className="text-black font-medium text-sm uppercase tracking-wider mb-4 pb-2 border-b border-black/20">
                  {t("dashboard.horsePassportWorkloadWeek")}
                </h2>
                <div className="bg-black/5 border border-black/20 p-4">
                  <p className="text-3xl font-medium text-black">
                    {workload.sessionsCount}
                    <span className="text-lg font-normal text-black/70 ml-1">
                      {t("dashboard.horsePassportSessionsWord")}
                    </span>
                  </p>
                  <p className="text-2xl font-medium text-black mt-1">
                    {workload.totalMinutes}
                    <span className="text-sm font-normal text-black/60 ml-1">
                      {t("dashboard.horsePassportMinutesWord")}
                    </span>
                  </p>
                  {workload.warning && (
                    <p className="text-black/80 text-sm mt-3 font-medium">
                      {t("dashboard.horsePassportConsiderRest")}
                    </p>
                  )}
                </div>
              </div>

              {/* Total care cost */}
              <div>
                <h2 className="text-black font-medium text-sm uppercase tracking-wider mb-4 pb-2 border-b border-black/20">
                  {t("dashboard.horsePassportCareCost")}
                </h2>
                <div className="bg-black/5 border border-black/20 p-4">
                  <p className="text-3xl font-medium text-black">
                    $
                    {(horse.healthLogs ?? [])
                      .reduce((sum, log) => sum + (log.cost ?? 0), 0)
                      .toFixed(2)}
                  </p>
                  <p className="text-black/60 text-sm mt-1">
                    {t("dashboard.horsePassportCareCostLead")}
                  </p>
                </div>
              </div>

              {/* AI workload suggestions */}
              {(role === "owner" || role === "trainer") && (
                <div className="mt-6">
                  <h2 className="text-black font-medium text-sm uppercase tracking-wider mb-4 pb-2 border-b border-black/20">
                    {t("dashboard.horsePassportAiTitle")}
                  </h2>
                  {aiSuggestions ? (
                    <div className="bg-black/5 border border-black/20 p-4 text-black/90 text-sm whitespace-pre-wrap">
                      {aiSuggestions}
                    </div>
                  ) : (
                    <div className="bg-black/5 border border-black/20 p-4">
                      <p className="text-black/60 text-sm mb-3">
                        {t("dashboard.horsePassportAiLead")}
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
                            setAiSuggestions(data.suggestions || t("dashboard.horsePassportAiEmpty"));
                          } catch (err) {
                            const msg = err instanceof Error ? err.message : "Something went wrong";
                            setToast(msg);
                            setTimeout(() => setToast(null), 5000);
                          } finally {
                            setAiLoading(false);
                          }
                        }}
                        disabled={aiLoading}
                        className="px-4 py-2 bg-accent text-white text-sm font-medium uppercase tracking-wider hover:opacity-90 disabled:opacity-50 transition"
                      >
                        {aiLoading ? t("dashboard.horsePassportAiGenerating") : t("dashboard.horsePassportAiCta")}
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
                  {t("dashboard.horsePassportTabHealth")}
                </button>
                <button
                  onClick={() => setActiveTab("training")}
                  className={`px-4 py-2 text-sm font-medium uppercase tracking-wider ${
                    activeTab === "training"
                      ? "border-b-2 border-black -mb-0.5 text-black"
                      : "text-black/60 hover:text-black"
                  }`}
                >
                  {t("dashboard.horsePassportTabTraining")}
                </button>
              </div>

              {activeTab === "health" && (
                <div>
                  <h2 className="text-black font-medium text-sm uppercase tracking-wider mb-4">
                    {t("dashboard.horsePassportSectionHealth")}
                  </h2>
                  {role !== "student" && (
                    <button
                      onClick={() => setShowHealthModal(true)}
                      className="mb-4 px-4 py-2.5 bg-accent text-white text-sm font-medium uppercase tracking-wider hover:opacity-90 transition"
                    >
                      {t("dashboard.horsePassportAddHealth")}
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
                              {healthLabel(log.type)}
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
                            <p>{new Date(log.date).toLocaleDateString(dateLocale)}</p>
                            {log.nextDue && (
                              <p className="text-black/50">
                                {t("dashboard.horsePassportHealthNext")}{" "}
                                {new Date(log.nextDue).toLocaleDateString(dateLocale)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-black/50 text-sm italic">
                        {t("dashboard.horsePassportHealthEmpty")}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "training" && (
                <div>
                  <h2 className="text-black font-medium text-sm uppercase tracking-wider mb-4">
                    {t("dashboard.horsePassportTrainingSection")}
                  </h2>
                  <div className="space-y-4">
                    {horse.sessions?.length ? (
                      horse.sessions.map((s) => (
                        <div
                          key={s.id}
                          className="flex justify-between items-center bg-black/5 border border-black/20 p-3"
                        >
                          <div>
                            <span className="font-medium text-black">
                              {punchLabel(s.punchType)}
                            </span>
                            <span className="text-black/60 text-sm ml-2">
                              {s.duration > 0
                                ? t("dashboard.trainingHistoryDurationMin", { minutes: String(s.duration) })
                                : t("dashboard.scheduleRestLabel")}{" "}
                              • {s.intensity}
                            </span>
                            {s.rider && (
                              <p className="text-sm text-black/50 mt-1">
                                {t("dashboard.horsePassportRiderLine", { name: s.rider })}
                              </p>
                            )}
                          </div>
                          <span className="text-black/50 text-sm">
                            {new Date(s.createdAt).toLocaleDateString(dateLocale)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-black/50 text-sm italic">
                        {t("dashboard.horsePassportTrainingEmpty")}
                      </p>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      <ModalOverlay open={showEditModal} onClose={() => setShowEditModal(false)} size="lg">
            <h2 className="font-serif text-xl text-black dark:text-white mb-6">{t("dashboard.horseModalEditTitle")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <HorseIdentificationFields form={editForm} onChange={handleEditChange} formInput={formInput} />
              <p className="sm:col-span-2 text-xs uppercase tracking-widest text-black/50 mb-0">
                {t("dashboard.horseModalProfileTraining")}
              </p>
              <div className="sm:col-span-2">
                <label className="text-xs text-black/50 uppercase tracking-widest block mb-2">{t("dashboard.horseModalPhotoLabel")}</label>
                <div className="flex items-center gap-4">
                  <HorseAvatar photoUrl={editForm.photoUrl || null} name={editForm.name || "Horse"} size="lg" />
                  <div className="flex-1 space-y-2">
                    <input type="file" ref={photoInputRef} accept="image/jpeg,image/png,image/webp" onChange={handleEditPhotoUpload} className="hidden" />
                    <button type="button" onClick={() => photoInputRef.current?.click()} className="block px-4 py-2.5 border border-black/10 text-black text-sm uppercase tracking-wider hover:border-black/30 transition">
                      {t("dashboard.horseModalUploadPhoto")}
                    </button>
                    <input name="photoUrl" placeholder={t("dashboard.horseModalPhotoUrlPlaceholder")} value={editForm.photoUrl} onChange={handleEditChange} className={`w-full ${formInput} text-sm`} />
                  </div>
                </div>
              </div>
              <select name="temperament" value={editForm.temperament} onChange={handleEditChange} className={formInput}>
                <option value="calm">{t("dashboard.horseTemperamentCalm")}</option>
                <option value="energetic">{t("dashboard.horseTemperamentEnergetic")}</option>
                <option value="sensitive">{t("dashboard.horseTemperamentSensitive")}</option>
                <option value="beginner-safe">{t("dashboard.horseTemperamentBeginnerSafe")}</option>
              </select>
              <select name="skillLevel" value={editForm.skillLevel} onChange={handleEditChange} className={formInput}>
                <option value="beginner">{t("dashboard.teamRidersLevelBeginner")}</option>
                <option value="intermediate">{t("dashboard.teamRidersLevelIntermediate")}</option>
                <option value="advanced">{t("dashboard.teamRidersLevelAdvanced")}</option>
              </select>
              <select name="trainingStatus" value={editForm.trainingStatus} onChange={handleEditChange} className={formInput}>
                <option value="green">{t("dashboard.horseTrainingGreen")}</option>
                <option value="schooling">{t("dashboard.horseTrainingSchooling")}</option>
                <option value="competition-ready">{t("dashboard.horseTrainingCompetitionReady")}</option>
              </select>
              <select name="ridingSuitability" value={editForm.ridingSuitability} onChange={handleEditChange} className={formInput}>
                <option value="kids">{t("dashboard.horseRidingKids")}</option>
                <option value="adults">{t("dashboard.horseRidingAdults")}</option>
                <option value="jumping">{t("dashboard.horseRidingJumping")}</option>
                <option value="dressage">{t("dashboard.horseRidingDressage")}</option>
                <option value="trail">{t("dashboard.horseRidingTrail")}</option>
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowEditModal(false)} className="flex-1 py-2.5 border border-black/10 text-black text-sm uppercase tracking-wider hover:border-black/30 transition">
                {t("dashboard.bookingsCancel")}
              </button>
              <button onClick={saveHorse} className="flex-1 py-2.5 bg-accent text-white font-medium text-sm uppercase tracking-wider hover:opacity-95 transition">
                {t("dashboard.horseModalSaveChanges")}
              </button>
            </div>
      </ModalOverlay>

      <AddHealthRecordModal
        open={showHealthModal}
        onClose={() => setShowHealthModal(false)}
        horses={[{ id: String(horse.id), name: horse.name }]}
        defaultHorseId={String(horse.id)}
        onSuccess={fetchHorse}
      />
    </div>
  );
}
