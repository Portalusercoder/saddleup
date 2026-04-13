"use client";

import { useState } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function AddMemberById({ onSuccess }: { onSuccess?: () => void }) {
  const { t } = useLanguage();
  const [inviteCode, setInviteCode] = useState("");
  const [memberRole, setMemberRole] = useState<"student" | "trainer" | "guardian">("student");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch("/api/members/add-by-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inviteCode: inviteCode.trim(),
          memberRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const errText = data.error || t("dashboard.addMemberFailed");
      setMessage({
        type: "error",
        text: errText.includes("already in your stable")
            ? t("dashboard.addMemberAlreadyInStable")
            : errText,
      });
        return;
      }
      const roleLabel =
        memberRole === "student"
          ? t("dashboard.addMemberRoleStudent")
          : memberRole === "guardian"
            ? t("dashboard.addMemberRoleGuardian")
            : t("dashboard.addMemberRoleTrainer");
      const location =
        memberRole === "student"
          ? t("dashboard.ridersTitle")
          : memberRole === "guardian"
            ? t("dashboard.guardianTitle")
            : t("dashboard.trainersTitle");
      setMessage({
        type: "success",
        text: t("dashboard.addMemberSuccess", { role: roleLabel, location }),
      });
      setInviteCode("");
      onSuccess?.();
    } catch {
      setMessage({ type: "error", text: t("dashboard.noticeEmailsSomethingWrong") });
    } finally {
      setLoading(false);
    }
  };

  const formInput =
    "w-full px-4 py-3 bg-base border border-black/10 text-black placeholder-black/40 focus:border-black/30 focus:outline-none";
  const labelClass = "block text-xs uppercase tracking-widest text-black/50 mb-2";

  return (
    <div className="border border-black/10 p-6">
      <h2 className="font-serif text-lg text-black mb-2">{t("dashboard.addMemberTitle")}</h2>
      <p className="text-black/60 text-sm mb-4">
        {t("dashboard.addMemberLead")}{" "}
        <a href="/get-my-id" className="text-black hover:underline">/get-my-id</a>{" "}
        {t("dashboard.addMemberLeadSuffix")}
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>{t("dashboard.addMemberPersonalId")}</label>
          <input
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase().replace(/\s/g, ""))}
            placeholder={t("dashboard.addMemberPersonalIdPlaceholder")}
            className={formInput}
            required
          />
        </div>
        <div>
          <label className={labelClass}>{t("common.role")}</label>
          <select
            value={memberRole}
            onChange={(e) => setMemberRole(e.target.value as "student" | "trainer" | "guardian")}
            className={formInput}
          >
            <option value="student">{t("dashboard.addMemberRoleStudent")}</option>
            <option value="trainer">{t("dashboard.addMemberRoleTrainer")}</option>
            <option value="guardian">{t("dashboard.addMemberRoleGuardianParent")}</option>
          </select>
        </div>
        {message && (
          <p
            className={`text-sm ${
              message.type === "success" ? "text-black/80" : "text-red-400"
            }`}
          >
            {message.text}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2.5 bg-accent text-white font-medium text-sm uppercase tracking-wider hover:opacity-95 transition disabled:opacity-50"
        >
          {loading ? t("dashboard.addMemberAdding") : t("dashboard.addMemberButton")}
        </button>
      </form>
    </div>
  );
}
