"use client";

import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ModalOverlay from "@/components/ui/ModalOverlay";
import { useLanguage } from "@/components/providers/LanguageProvider";

const HEALTH_TYPES = ["vet", "vaccination", "deworming", "farrier", "injury"] as const;

export type HealthRecordHorse = {
  id: string;
  name: string;
};

type AddHealthRecordModalProps = {
  open: boolean;
  onClose: () => void;
  horses: HealthRecordHorse[];
  defaultHorseId?: string;
  onSuccess?: () => void;
};

const emptyForm = () => ({
  type: "vet",
  date: new Date().toISOString().slice(0, 10),
  description: "",
  cost: "",
  nextDue: "",
  recoveryStatus: "",
});

export default function AddHealthRecordModal({
  open,
  onClose,
  horses,
  defaultHorseId,
  onSuccess,
}: AddHealthRecordModalProps) {
  const { t } = useLanguage();
  const [horseId, setHorseId] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  const formInput =
    "w-full px-4 py-3 bg-base border border-black/10 text-black placeholder-black/40 focus:border-black/30 focus:outline-none dark:border-white/15 dark:text-white dark:placeholder-white/40";

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
    if (!open) return;
    const preferred =
      defaultHorseId && horses.some((h) => h.id === defaultHorseId)
        ? defaultHorseId
        : horses[0]?.id ?? "";
    setHorseId(preferred);
    setForm(emptyForm());
  }, [open, defaultHorseId, horses]);

  const submit = async () => {
    if (!horseId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          horseId,
          type: form.type,
          date: form.date,
          description: form.description || null,
          cost: form.cost ? Number(form.cost) : null,
          nextDue: form.nextDue || null,
          recoveryStatus: form.recoveryStatus || null,
        }),
      });
      if (!res.ok) return;
      onClose();
      onSuccess?.();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay open={open} onClose={onClose} size="md">
      <h2 className="font-serif text-xl text-black dark:text-white mb-6">
        {t("dashboard.horseHealthModalTitle")}
      </h2>
      <div className="space-y-4">
        {horses.length > 1 ? (
          <div>
            <label className="text-xs text-black/50 dark:text-white/50 uppercase tracking-widest block mb-2">
              {t("dashboard.horseHealthHorseLabel")}
            </label>
            <select
              value={horseId}
              onChange={(e) => setHorseId(e.target.value)}
              className={formInput}
            >
              {horses.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <div>
          <label className="text-xs text-black/50 dark:text-white/50 uppercase tracking-widest block mb-2">
            {t("dashboard.horseHealthTypeLabel")}
          </label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className={formInput}
          >
            {HEALTH_TYPES.map((v) => (
              <option key={v} value={v}>
                {healthLabel(v)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-black/50 dark:text-white/50 uppercase tracking-widest block mb-2">
            {t("dashboard.bookingsLabelDate")}
          </label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className={formInput}
          />
        </div>
        <textarea
          placeholder={t("dashboard.horseHealthDescriptionPlaceholder")}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={2}
          className={`${formInput} resize-none`}
        />
        <input
          type="number"
          placeholder={t("dashboard.horseHealthCostPlaceholder")}
          value={form.cost}
          onChange={(e) => setForm({ ...form, cost: e.target.value })}
          className={formInput}
        />
        <div>
          <label className="text-xs text-black/50 dark:text-white/50 uppercase tracking-widest block mb-2">
            {t("dashboard.horseHealthNextDueLabel")}
          </label>
          <input
            type="date"
            value={form.nextDue}
            onChange={(e) => setForm({ ...form, nextDue: e.target.value })}
            className={formInput}
          />
        </div>
        {form.type === "injury" ? (
          <select
            value={form.recoveryStatus}
            onChange={(e) => setForm({ ...form, recoveryStatus: e.target.value })}
            className={formInput}
          >
            <option value="">{t("dashboard.horseHealthRecoveryPlaceholder")}</option>
            <option value="active">{t("dashboard.horseHealthRecoveryActive")}</option>
            <option value="recovering">{t("dashboard.horseHealthRecoveryRecovering")}</option>
            <option value="cleared">{t("dashboard.horseHealthRecoveryCleared")}</option>
          </select>
        ) : null}
      </div>
      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2.5 border border-black/10 dark:border-white/15 text-black dark:text-white text-sm uppercase tracking-wider hover:border-black/30 transition"
        >
          {t("dashboard.bookingsCancel")}
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={loading || !horseId}
          className="flex-1 py-2.5 bg-accent text-white font-medium text-sm uppercase tracking-wider hover:opacity-95 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <LoadingSpinner size={16} className="text-black" />
              {t("dashboard.horseHealthAdding")}
            </>
          ) : (
            t("dashboard.horseHealthAddRecord")
          )}
        </button>
      </div>
    </ModalOverlay>
  );
}
