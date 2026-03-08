"use client";

import { useState, useRef, useEffect } from "react";

type Props =
  | { type: "rider"; id: string; idCardUrl?: string | null; onSuccess?: () => void; canUpload?: boolean }
  | { type: "trainer"; id: string; idCardUrl?: string | null; onSuccess?: () => void; canUpload?: boolean };

export function IdCardUpload(props: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(props.idCardUrl ?? null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUrl(props.idCardUrl ?? null);
  }, [props.idCardUrl]);

  const endpoint =
    props.type === "rider"
      ? `/api/riders/${props.id}/upload-id-card`
      : `/api/members/${props.id}/upload-id-card`;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(endpoint, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed");
        return;
      }
      setUrl(data.url ?? null);
      props.onSuccess?.();
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
    e.target.value = "";
  };

  const displayUrl = url ?? props.idCardUrl;

  if (!displayUrl && !props.canUpload) return null;

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        onChange={handleUpload}
        className="hidden"
      />
      {displayUrl ? (
        <div className="flex items-center gap-3">
          <a
            href={displayUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-black hover:underline text-sm uppercase tracking-wider"
          >
            View ID card
          </a>
          {props.canUpload && (
            <button
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="text-black/60 hover:text-black text-sm uppercase tracking-wider disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Replace"}
            </button>
          )}
        </div>
      ) : props.canUpload ? (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2.5 border border-black/10 text-black text-sm uppercase tracking-wider hover:border-black/30 transition disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload ID card"}
        </button>
      ) : null}
      {error && <p className="text-amber-400 text-sm">{error}</p>}
    </div>
  );
}
