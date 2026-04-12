"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";

type StableInvite = {
  name: string;
  joinCode: string;
  role: string;
};

interface ShareInviteCodeProps {
  stable?: StableInvite | null;
}

export default function ShareInviteCode({ stable: initialStable = null }: ShareInviteCodeProps) {
  const { t } = useLanguage();
  const [stable, setStable] = useState<StableInvite | null>(initialStable);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialStable) {
      setStable(initialStable);
      return;
    }
    fetch("/api/stable")
      .then((res) => res.json())
      .then((data) => {
        if (data.joinCode) {
          setStable({
            name: data.name || t("dashboard.shareInvite.defaultStableName"),
            joinCode: data.joinCode,
            role: data.role,
          });
        }
      })
      .catch(() => {});
  }, [initialStable, t]);

  const copyCode = () => {
    if (!stable) return;
    navigator.clipboard.writeText(stable.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!stable) return null;

  return (
    <div className="border border-black/10 p-6" data-tour="invite-code">
      <h2 className="font-serif text-lg text-black mb-2">{t("dashboard.shareInvite.title")}</h2>
      <p className="text-black/60 text-sm mb-4">
        {t("dashboard.shareInvite.lead", { name: stable.name })}
      </p>
      <div className="flex items-center gap-3">
        <code className="flex-1 px-4 py-3 bg-base border border-black/10 font-mono text-lg text-black">
          {stable.joinCode}
        </code>
        <button
          onClick={copyCode}
          className="px-4 py-3 bg-accent text-white font-medium text-sm uppercase tracking-wider hover:opacity-95 transition whitespace-nowrap"
        >
          {copied ? t("common.copied") : t("common.copy")}
        </button>
      </div>
      <p className="text-black/40 text-xs mt-3 uppercase tracking-wider">
        {t("dashboard.shareInvite.hint")}
      </p>
    </div>
  );
}
