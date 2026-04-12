"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProfile } from "@/components/providers/ProfileProvider";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import PageLoader from "@/components/ui/PageLoader";
import GuidedTourOverlay, { type GuidedTourStep } from "@/components/dashboard/GuidedTourOverlay";
import { usePageTour } from "@/components/dashboard/usePageTour";

const formInput = "w-full px-4 py-3 bg-base border border-black/10 text-black placeholder-black/40 focus:border-black/30 focus:outline-none";
const labelClass = "block text-xs uppercase tracking-widest text-black/50 mb-2";
const btnPrimary = "px-4 py-2.5 bg-accent text-white font-medium text-sm uppercase tracking-wider hover:opacity-95 transition";
const btnSecondary = "px-4 py-2.5 border border-black/10 text-black text-sm uppercase tracking-wider hover:border-black/30 transition";

export default function ProfilePage() {
  const { profile, loading: profileLoading, refetch } = useProfile();
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [riderIdCard, setRiderIdCard] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [emailSubmitting, setEmailSubmitting] = useState(false);
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
    { id: "avatar", title: "Profile Photo", description: "Upload or change your avatar.", selector: '[data-tour="profile-avatar"]' },
    { id: "details", title: "Profile Details", description: "Review and edit your basic account details.", selector: '[data-tour="profile-details"]' },
    { id: "save", title: "Save Changes", description: "Save profile updates after editing.", selector: '[data-tour="profile-save"]' },
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
        setToast(data.error || "Upload failed");
        return;
      }
      refetch();
      setToast("Photo updated");
    } catch {
      setToast("Upload failed");
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
        setToast(data.error || "Failed to save");
        setSaving(false);
        return;
      }
      refetch();
      setToast("Profile saved");
    } catch {
      setToast("Failed to save");
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
        setToast(typeof data.error === "string" ? data.error : "Could not update email");
        setEmailSubmitting(false);
        setTimeout(() => setToast(null), 5000);
        return;
      }
      await refetch();
      setToast(
        typeof data.message === "string"
          ? data.message
          : "Email updated. Check your inbox if confirmation is required."
      );
    } catch {
      setToast("Could not update email");
    }
    setEmailSubmitting(false);
    setTimeout(() => setToast(null), 8000);
  };

  if (loading) {
    return <PageLoader minHeight="min-h-[40vh]" message="Loading…" />;
  }

  if (!profile) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard" className="text-black/60 hover:text-black text-sm uppercase tracking-wider">
          ← Back to Dashboard
        </Link>
        <p className="text-black/50">Profile not found.</p>
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
          ← Back to Dashboard
        </Link>
      </div>

      <h1 className="font-serif text-3xl md:text-4xl font-normal text-black">
        Profile
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
              Change photo
            </button>
          </div>

          <div className="flex-1 space-y-4 min-w-0" data-tour="profile-details">
            <div>
              <label className={labelClass}>Full name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={formInput}
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="profile-email" className={labelClass}>
                Email
              </label>
              <input
                id="profile-email"
                type="email"
                autoComplete="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className={formInput}
                placeholder="you@example.com"
              />
              <p className="text-black/40 text-xs mt-2">
                Changing your email updates your sign-in address. Your project may send a confirmation
                link before it takes effect.
              </p>
              <button
                type="button"
                onClick={handleEmailUpdate}
                disabled={emailSubmitting || emailUnchanged}
                className={`${btnSecondary} mt-3 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {emailSubmitting ? "Updating…" : "Update email"}
              </button>
            </div>
            <div>
              <label className={labelClass}>Role</label>
              <p className="text-black/60 text-sm py-2 capitalize">{profile.role}</p>
            </div>
            {idCardUrl && (
              <div>
                <label className={labelClass}>ID card</label>
                <a
                  href={idCardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black hover:underline text-sm uppercase tracking-wider"
                >
                  View ID card
                </a>
              </div>
            )}
            {inviteCode && profile.role !== "owner" && (
              <div>
                <label className={labelClass}>Your personal ID</label>
                <p className="text-black/50 text-xs mb-2">
                  Share this with your stable owner if the join code didn&apos;t work.
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-base border border-black/10 font-mono text-sm text-black">
                    {inviteCode}
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(inviteCode);
                      setToast("Copied!");
                      setTimeout(() => setToast(null), 2000);
                    }}
                    className={btnSecondary}
                  >
                    Copy
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
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </div>

      {profile.role === "owner" && (
        <div className="border border-black/10 p-6 max-w-md border-amber-500/30">
          <h2 className="font-serif text-lg text-black mb-2">Delete account</h2>
          <p className="text-black/60 text-sm mb-4">
            This will schedule your stable and all its data for permanent deletion in 30 days. You can reactivate by signing in before then.
          </p>
          <DeleteAccountButton onScheduled={() => setToast("Deletion scheduled. You have been signed out.")} />
        </div>
      )}
    </div>
  );
}

function DeleteAccountButton({ onScheduled }: { onScheduled: () => void }) {
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
        className="px-4 py-2.5 border border-black/30 text-black text-sm uppercase tracking-wider hover:bg-black/5 transition"
      >
        Schedule account deletion
      </button>
    );
  }
  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="px-4 py-2.5 bg-amber-600 text-black text-sm uppercase tracking-wider hover:bg-amber-500 transition disabled:opacity-50"
      >
        {loading ? "Scheduling..." : "Yes, schedule deletion"}
      </button>
      <button
        type="button"
        onClick={() => setConfirm(false)}
        disabled={loading}
        className="px-4 py-2.5 border border-black/20 text-black/80 text-sm uppercase tracking-wider hover:bg-black/5 transition"
      >
        Cancel
      </button>
    </div>
  );
}
