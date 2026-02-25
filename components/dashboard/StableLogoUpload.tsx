"use client";

import { useEffect, useState, useRef } from "react";

export default function StableLogoUpload() {
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
        setToast(data.error || "Upload failed");
        return;
      }
      setLogoUrl(data.url ?? null);
      setToast("Logo updated");
    } catch {
      setToast("Upload failed");
    }
    setUploading(false);
    e.target.value = "";
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="border border-white/10 p-6">
      <h2 className="font-serif text-lg text-white mb-2">Stable logo</h2>
      <p className="text-white/60 text-sm mb-4">
        Upload your stable&apos;s logo for use on your stable materials.
      </p>
      <div className="flex items-center gap-6">
        <div className="w-24 h-24 border border-white/10 bg-black flex items-center justify-center overflow-hidden shrink-0">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Stable logo"
              className="w-full h-full object-contain"
            />
          ) : (
            <span className="text-white/30 text-xs">No logo</span>
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
            className="px-4 py-2.5 bg-white text-black font-medium text-sm uppercase tracking-wider hover:opacity-95 transition disabled:opacity-50"
          >
            {uploading ? "Uploading..." : logoUrl ? "Change logo" : "Upload logo"}
          </button>
          <p className="text-white/40 text-xs mt-2">JPEG, PNG or WebP. Max 1MB.</p>
        </div>
      </div>
      {toast && (
        <p className={`mt-3 text-sm ${toast.includes("failed") ? "text-amber-400" : "text-white/60"}`}>
          {toast}
        </p>
      )}
    </div>
  );
}
