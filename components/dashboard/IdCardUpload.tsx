"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { idCardViewHref } from "@/lib/storage/id-cards";

type Props =
  | { type: "rider"; id: string; idCardUrl?: string | null; onSuccess?: () => void; canUpload?: boolean; iconOnly?: boolean }
  | { type: "trainer"; id: string; idCardUrl?: string | null; onSuccess?: () => void; canUpload?: boolean; iconOnly?: boolean };

export function IdCardUpload(props: Props) {
  const { t } = useLanguage();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCard, setHasCard] = useState(Boolean(props.idCardUrl));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHasCard(Boolean(props.idCardUrl));
  }, [props.idCardUrl]);

  const endpoint =
    props.type === "rider"
      ? `/api/riders/${props.id}/upload-id-card`
      : `/api/members/${props.id}/upload-id-card`;

  const viewHref = idCardViewHref(
    props.type === "rider" ? "rider" : "member",
    props.id
  );

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
        setError(data.error || t("dashboard.horseToastUploadFailed"));
        return;
      }
      setHasCard(true);
      props.onSuccess?.();
    } catch {
      setError(t("dashboard.horseToastUploadFailed"));
    } finally {
      setUploading(false);
    }
    e.target.value = "";
  };

  const iconBtn =
    "inline-flex h-9 w-9 items-center justify-center border border-black/15 text-black/70 hover:bg-black/[0.04] dark:border-white/20 dark:text-white/70";

  if (!hasCard && !props.canUpload) return null;

  if (props.iconOnly) {
    return (
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={handleUpload}
          className="hidden"
        />
        {hasCard ? (
          <a
            href={viewHref}
            target="_blank"
            rel="noopener noreferrer"
            className={iconBtn}
            title={t("dashboard.idCardView")}
            aria-label={t("dashboard.idCardView")}
          >
            🪪
          </a>
        ) : props.canUpload ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className={`${iconBtn} disabled:opacity-50`}
            title={t("dashboard.idCardUploadCta")}
            aria-label={t("dashboard.idCardUploadCta")}
          >
            {uploading ? "…" : "🪪"}
          </button>
        ) : null}
        {error && <p className="sr-only">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        onChange={handleUpload}
        className="hidden"
      />
      {hasCard ? (
        <div className="flex items-center gap-3">
          <a
            href={viewHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-black hover:underline text-sm uppercase tracking-wider"
          >
            {t("dashboard.idCardView")}
          </a>
          {props.canUpload && (
            <button
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="text-black/60 hover:text-black text-sm uppercase tracking-wider disabled:opacity-50"
            >
              {uploading ? t("dashboard.idCardUploading") : t("dashboard.idCardReplace")}
            </button>
          )}
        </div>
      ) : props.canUpload ? (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2.5 border border-black/10 text-black text-sm uppercase tracking-wider hover:border-black/30 transition disabled:opacity-50"
        >
          {uploading ? t("dashboard.idCardUploading") : t("dashboard.idCardUploadCta")}
        </button>
      ) : null}
      {error && <p className="text-amber-400 text-sm">{error}</p>}
    </div>
  );
}
