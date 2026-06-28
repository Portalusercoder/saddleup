"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProfile } from "@/components/providers/ProfileProvider";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import PageLoader from "@/components/ui/PageLoader";
import GuidedTourOverlay, { type GuidedTourStep } from "@/components/dashboard/GuidedTourOverlay";
import { usePageTour } from "@/components/dashboard/usePageTour";
import { useLanguage } from "@/components/providers/LanguageProvider";

const formInput = "w-full px-4 py-3 bg-base border border-black/10 text-black placeholder-black/40 focus:border-black/30 focus:outline-none";
const labelClass = "block text-xs uppercase tracking-widest text-black/50 mb-2";
const btnPrimary = "px-4 py-2.5 bg-accent text-white font-medium text-sm uppercase tracking-wider hover:opacity-95 transition";
const btnSecondary = "px-4 py-2.5 border border-black/10 text-black text-sm uppercase tracking-wider hover:border-black/30 transition";

export default function ProfilePage() {
  const { t } = useLanguage();
  const { profile, loading: profileLoading, refetch } = useProfile();
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [riderIdCard, setRiderIdCard] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName ?? "");
      setEmailInput(profile.email ?? "");
    }
  }, [profile]);

  useEffect(() => {
    fetch("/api/me/rider")
      .then((r) => r.json())
      .then((d) => setRiderIdCard(d?.id_card_url ?? null))
      .catch(() => setRiderIdCard(null));
  }, []);

  useEffect(() => {
    if (!profile) return;
    if (profile.role === "owner") {
      setInviteCode(null);
      return;
    }
    fetch("/api/me/invite-code")
      .then((r) => r.json())
      .then((d) => setInviteCode(d.inviteCode ?? null))
      .catch(() => setInviteCode(null));
  }, [profile]);

  const idCardUrl = riderIdCard ?? profile?.id_card_url ?? null;
  const loading = profileLoading;
  const { open: showTour, complete: completeTour } = usePageTour(
    "saddleup_tour_profile_v1",
    !loading
  );

  const tourSteps: GuidedTourStep[] = [
    { id: "avatar", title: t("profile.tourAvatarTitle"), description: t("profile.tourAvatarDesc"), selector: '[data-tour="profile-avatar"]' },
    { id: "details", title: t("profile.tourDetailsTitle"), description: t("profile.tourDetailsDesc"), selector: '[data-tour="profile-details"]' },
    { id: "save", title: t("profile.tourSaveTitle"), description: t("profile.tourSaveDesc"), selector: '[data-tour="profile-save"]' },
  ];

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/profile/upload-avatar", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setToast(data.error || t("profile.uploadFailed"));
        return;
      }
      refetch();
      setToast(t("profile.photoUpdated"));
    } catch {
      setToast(t("profile.uploadFailed"));
    }
    e.target.value = "";
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: fullName.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast(data.error || t("profile.saveFailed"));
        setSaving(false);
        return;
      }
      refetch();
      setToast(t("profile.profileSaved"));
    } catch {
      setToast(t("profile.saveFailed"));
    }
    setSaving(false);
    setTimeout(() => setToast(null), 3000);
  };

  const normalizedProfileEmail = (profile?.email ?? "").trim().toLowerCase();
  const normalizedInputEmail = emailInput.trim().toLowerCase();
  const emailUnchanged =
    normalizedInputEmail === normalizedProfileEmail || normalizedInputEmail === "";

  const handleEmailUpdate = async () => {
    if (!profile || emailUnchanged) return;
    setEmailSubmitting(true);
    try {
      const res = await fetch("/api/profile/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setToast(typeof data.error === "string" ? data.error : t("profile.emailUpdateFailed"));
        setEmailSubmitting(false);
        setTimeout(() => setToast(null), 5000);
        return;
      }
      await refetch();
      setToast(
        typeof data.message === "string"
          ? data.message
          : t("profile.emailUpdatedDefault")
      );
    } catch {
      setToast(t("profile.emailUpdateFailed"));
    }
    setEmailSubmitting(false);
    setTimeout(() => setToast(null), 8000);
  };

  const handlePasswordUpdate = async () => {
    if (!password || password.length < 8) {
      setToast(t("profile.passwordTooShort"));
      setTimeout(() => setToast(null), 4000);
      return;
    }
    if (password !== passwordConfirm) {
      setToast(t("profile.passwordMismatch"));
      setTimeout(() => setToast(null), 4000);
      return;
    }
    setPasswordSubmitting(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setToast(error.message || t("profile.passwordUpdateFailed"));
      } else {
        setPassword("");
        setPasswordConfirm("");
        setToast(t("profile.passwordUpdated"));
      }
    } catch {
      setToast(t("profile.passwordUpdateFailed"));
    }
    setPasswordSubmitting(false);
    setTimeout(() => setToast(null), 5000);
  };

  if (loading) {
    return <PageLoader minHeight="min-h-[40vh]" message={t("common.loading")} />;
  }

  if (!profile) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard" className="text-black/60 hover:text-black text-sm uppercase tracking-wider">
          {t("profile.back")}
        </Link>
        <p className="text-black/50">{t("profile.profileNotFound")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <GuidedTourOverlay
        open={showTour}
        steps={tourSteps}
        onSkip={completeTour}
        onComplete={completeTour}
      />
      <div>
        <Link href="/dashboard" className="text-black/60 hover:text-black text-sm uppercase tracking-wider">
          {t("profile.back")}
        </Link>
      </div>

      <h1 className="font-serif text-3xl md:text-4xl font-normal text-black">
        {t("profile.title")}
      </h1>

      {toast && (
        <div className="px-4 py-2 border border-black/10 text-black text-sm">
          {toast}
        </div>
      )}

      <div className="border border-black/10 p-6 max-w-md">
        <div className="flex items-start gap-6">
          <div className="flex flex-col items-center gap-3" data-tour="profile-avatar">
            <ProfileAvatar
              avatarUrl={profile.avatarUrl}
              name={profile.fullName ?? profile.email}
              size="lg"
            />
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
              className={btnSecondary}
            >
              {t("profile.changePhoto")}
            </button>
          </div>

          <div className="flex-1 space-y-4 min-w-0" data-tour="profile-details">
            <div>
              <label className={labelClass}>{t("common.fullName")}</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={formInput}
                placeholder={t("common.yourName")}
              />
            </div>
            <div>
              <label htmlFor="profile-email" className={labelClass}>
                {t("common.email")}
              </label>
              <input
                id="profile-email"
                type="email"
                autoComplete="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className={formInput}
                placeholder={t("common.placeholderEmail")}
              />
              <p className="text-black/40 text-xs mt-2">
                {t("profile.emailHelp")}
              </p>
              <button
                type="button"
                onClick={handleEmailUpdate}
                disabled={emailSubmitting || emailUnchanged}
                className={`${btnSecondary} mt-3 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {emailSubmitting ? t("profile.updatingEmail") : t("profile.updateEmail")}
              </button>
            </div>
            <div>
              <label className={labelClass}>{t("common.role")}</label>
              <p className="text-black/60 text-sm py-2 capitalize">
                {profile.role === "owner" ||
                profile.role === "trainer" ||
                profile.role === "student" ||
                profile.role === "guardian"
                  ? t(`auth.signup.roles.${profile.role}`)
                  : profile.role}
              </p>
            </div>
            {idCardUrl && (
              <div>
                <label className={labelClass}>{t("profile.idCard")}</label>
                <a
                  href={idCardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black hover:underline text-sm uppercase tracking-wider"
                >
                  {t("profile.viewIdCard")}
                </a>
              </div>
            )}
            {inviteCode && profile.role !== "owner" && (
              <div>
                <label className={labelClass}>{t("profile.personalId")}</label>
                <p className="text-black/50 text-xs mb-2">
                  {t("profile.personalIdHelp")}
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-base border border-black/10 font-mono text-sm text-black">
                    {inviteCode}
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(inviteCode);
                      setToast(t("common.copied"));
                      setTimeout(() => setToast(null), 2000);
                    }}
                    className={btnSecondary}
                  >
                    {t("common.copy")}
                  </button>
                </div>
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className={`${btnPrimary} disabled:opacity-50`}
              data-tour="profile-save"
            >
              {saving ? t("profile.saving") : t("profile.saveChanges")}
            </button>
          </div>
        </div>
      </div>

      <div className="border border-black/10 p-6 max-w-md dark:border-white/10">
        <h2 className="font-serif text-lg text-black dark:text-white mb-2">{t("profile.passwordTitle")}</h2>
        <p className="text-black/60 text-sm mb-4 dark:text-white/60">{t("profile.passwordLead")}</p>
        <div className="space-y-4">
          <div>
            <label className={labelClass} htmlFor="profile-new-password">
              {t("profile.passwordNew")}
            </label>
            <input
              id="profile-new-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={formInput}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="profile-confirm-password">
              {t("profile.passwordConfirm")}
            </label>
            <input
              id="profile-confirm-password"
              type="password"
              autoComplete="new-password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className={formInput}
            />
          </div>
          <button
            type="button"
            onClick={handlePasswordUpdate}
            disabled={passwordSubmitting || !password}
            className={`${btnSecondary} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {passwordSubmitting ? t("profile.passwordUpdating") : t("profile.passwordUpdateCta")}
          </button>
        </div>
      </div>

      {profile.role === "owner" && (
        <div className="border-2 border-red-500/40 bg-red-500/[0.04] p-6 max-w-md rounded-lg dark:border-red-400/40">
          <h2 className="font-serif text-lg text-red-800 dark:text-red-300 mb-2">{t("profile.deleteTitle")}</h2>
          <p className="text-black/70 text-sm mb-4 dark:text-white/70">
            {t("profile.deleteLead")}
          </p>
          <DeleteAccountButton
            onScheduled={() => setToast(t("profile.deletionScheduled"))}
          />
        </div>
      )}
    </div>
  );
}

function DeleteAccountButton({ onScheduled }: { onScheduled: () => void }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const handleDelete = async () => {
    if (!confirm) return;
    setLoading(true);
    try {
      const res = await fetch("/api/account/request-deletion", { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      onScheduled();
      const supabase = (await import("@/lib/supabase/client")).createClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch {
      setLoading(false);
    }
  }

  if (!confirm) {
    return (
      <button
        type="button"
        onClick={() => setConfirm(true)}
        className="px-4 py-2.5 border border-red-500/50 text-red-700 text-sm uppercase tracking-wider hover:bg-red-500/10 transition dark:text-red-300"
      >
        {t("profile.scheduleDeletion")}
      </button>
    );
  }
  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="px-4 py-2.5 bg-red-600 text-white text-sm uppercase tracking-wider hover:bg-red-500 transition disabled:opacity-50"
      >
        {loading ? t("profile.scheduling") : t("profile.confirmDeletion")}
      </button>
      <button
        type="button"
        onClick={() => setConfirm(false)}
        disabled={loading}
        className="px-4 py-2.5 border border-black/20 text-black/80 text-sm uppercase tracking-wider hover:bg-black/5 transition"
      >
        {t("common.cancel")}
      </button>
    </div>
  );
}
