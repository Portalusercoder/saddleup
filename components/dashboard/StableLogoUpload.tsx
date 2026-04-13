"use client";

import { useEffect, useState, useRef } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function StableLogoUpload() {
  const { t } = useLanguage();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/stable")
      .then((res) => res.json())
      .then((data) => setLogoUrl(data.logoUrl ?? null))
      .catch(() => setLogoUrl(null));
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setToast(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/stable/upload-logo", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setToast(data.error || t("dashboard.horseToastUploadFailed"));
        return;
      }
      setLogoUrl(data.url ?? null);
      setToast(t("dashboard.stableLogoUpdated"));
    } catch {
      setToast(t("dashboard.horseToastUploadFailed"));
    }
    setUploading(false);
    e.target.value = "";
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="border border-black/10 p-6">
      <h2 className="font-serif text-lg text-black mb-2">{t("dashboard.stableLogoTitle")}</h2>
      <p className="text-black/60 text-sm mb-4">
        {t("dashboard.stableLogoLead")}
      </p>
      <div className="flex items-center gap-6">
        <div className="w-24 h-24 border border-black/10 bg-base flex items-center justify-center overflow-hidden shrink-0">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={t("dashboard.stableLogoTitle")}
              className="w-full h-full object-contain"
            />
          ) : (
            <span className="text-black/30 text-xs">{t("dashboard.stableLogoNoLogo")}</span>
          )}
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleUpload}
            className="hidden"
          />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2.5 bg-accent text-white font-medium text-sm uppercase tracking-wider hover:opacity-95 transition disabled:opacity-50"
          >
            {uploading
              ? t("dashboard.idCardUploading")
              : logoUrl
                ? t("dashboard.stableLogoChange")
                : t("dashboard.stableLogoUpload")}
          </button>
          <p className="text-black/40 text-xs mt-2">{t("dashboard.stableLogoHint")}</p>
        </div>
      </div>
      {toast && (
        <p className={`mt-3 text-sm ${toast === t("dashboard.horseToastUploadFailed") ? "text-amber-600" : "text-black/60"}`}>
          {toast}
        </p>
      )}
    </div>
  );
}
