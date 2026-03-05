"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProfile } from "@/components/providers/ProfileProvider";
import { ProfileAvatar } from "@/components/ProfileAvatar";

const formInput = "w-full px-4 py-3 bg-black border border-white/10 text-white placeholder-white/40 focus:border-white/30 focus:outline-none";
const labelClass = "block text-xs uppercase tracking-widest text-white/50 mb-2";
const btnPrimary = "px-4 py-2.5 bg-white text-black font-medium text-sm uppercase tracking-wider hover:opacity-95 transition";
const btnSecondary = "px-4 py-2.5 border border-white/10 text-white text-sm uppercase tracking-wider hover:border-white/30 transition";

export default function ProfilePage() {
  const { profile, loading: profileLoading, refetch } = useProfile();
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [riderIdCard, setRiderIdCard] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) setFullName(profile.fullName ?? "");
  }, [profile]);

  useEffect(() => {
    fetch("/api/me/invite-code")
      .then((r) => r.json())
      .then((d) => setInviteCode(d.inviteCode ?? null))
      .catch(() => setInviteCode(null));
    fetch("/api/me/rider")
      .then((r) => r.json())
      .then((d) => setRiderIdCard(d?.id_card_url ?? null))
      .catch(() => setRiderIdCard(null));
  }, []);

  const idCardUrl = riderIdCard ?? profile?.id_card_url ?? null;
  const loading = profileLoading;

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-white/50">Loading...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard" className="text-white/60 hover:text-white text-sm uppercase tracking-wider">
          ← Back to Dashboard
        </Link>
        <p className="text-white/50">Profile not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <Link href="/dashboard" className="text-white/60 hover:text-white text-sm uppercase tracking-wider">
          ← Back to Dashboard
        </Link>
      </div>

      <h1 className="font-serif text-3xl md:text-4xl font-normal text-white">
        Profile
      </h1>

      {toast && (
        <div className="px-4 py-2 border border-white/10 text-white text-sm">
          {toast}
        </div>
      )}

      <div className="border border-white/10 p-6 max-w-md">
        <div className="flex items-start gap-6">
          <div className="flex flex-col items-center gap-3">
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

          <div className="flex-1 space-y-4 min-w-0">
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
              <label className={labelClass}>Email</label>
              <p className="text-white/60 text-sm py-2">{profile.email ?? "—"}</p>
              <p className="text-white/40 text-xs uppercase tracking-wider">
                Email is managed by your account and cannot be changed here.
              </p>
            </div>
            <div>
              <label className={labelClass}>Role</label>
              <p className="text-white/60 text-sm py-2 capitalize">{profile.role}</p>
            </div>
            {idCardUrl && (
              <div>
                <label className={labelClass}>ID card</label>
                <a
                  href={idCardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:underline text-sm uppercase tracking-wider"
                >
                  View ID card
                </a>
              </div>
            )}
            {inviteCode && (
              <div>
                <label className={labelClass}>Your personal ID</label>
                <p className="text-white/50 text-xs mb-2">
                  Share this with your stable owner if the join code didn&apos;t work.
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-black border border-white/10 font-mono text-sm text-white">
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
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </div>

      {profile.role === "owner" && (
        <div className="border border-white/10 p-6 max-w-md border-amber-500/30">
          <h2 className="font-serif text-lg text-white mb-2">Delete account</h2>
          <p className="text-white/60 text-sm mb-4">
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
        className="px-4 py-2.5 border border-amber-500/50 text-amber-200 text-sm uppercase tracking-wider hover:bg-amber-500/10 transition"
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
        className="px-4 py-2.5 bg-amber-600 text-white text-sm uppercase tracking-wider hover:bg-amber-500 transition disabled:opacity-50"
      >
        {loading ? "Scheduling..." : "Yes, schedule deletion"}
      </button>
      <button
        type="button"
        onClick={() => setConfirm(false)}
        disabled={loading}
        className="px-4 py-2.5 border border-white/20 text-white/80 text-sm uppercase tracking-wider hover:bg-white/5 transition"
      >
        Cancel
      </button>
    </div>
  );
}
