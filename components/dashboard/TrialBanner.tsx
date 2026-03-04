"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type SubscriptionInfo = {
  status: string;
  planType?: string | null;
  trialEndsAt?: string | null;
  gracePeriodEndsAt?: string | null;
  readOnly?: boolean;
};

export default function TrialBanner() {
  const [data, setData] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const res = await fetch("/api/subscription", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as SubscriptionInfo;
        if (!cancelled) setData(json);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || !data) return null;

  const { status, trialEndsAt, readOnly } = data;

  const trialEndDate = trialEndsAt ? new Date(trialEndsAt) : null;
  const now = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysLeft =
    trialEndDate && trialEndDate > now
      ? Math.ceil((trialEndDate.getTime() - now.getTime()) / msPerDay)
      : 0;

  let message: string | null = null;
  let tone: "warning" | "info" = "warning";

  if (readOnly || status === "expired" || status === "suspended") {
    message =
      "Your free trial has ended. Your stable is now in read-only mode. Upgrade to continue managing bookings, horses, and riders.";
  } else if (status === "trialing" && daysLeft <= 7) {
    message = `Your free trial ends in ${daysLeft} day${daysLeft === 1 ? "" : "s"}. Upgrade to keep full access to Saddle Up.`;
    tone = "info";
  }

  if (!message) return null;

  return (
    <div
      className={`mb-6 border px-4 py-3 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
        tone === "warning"
          ? "border-amber-500/50 bg-amber-500/10 text-amber-100"
          : "border-white/15 bg-white/5 text-white/90"
      }`}
    >
      <p>{message}</p>
      <Link
        href="/dashboard/settings"
        className="inline-flex items-center justify-center px-4 py-2 bg-white text-black text-xs font-semibold uppercase tracking-[0.18em] hover:bg-white/90 transition"
      >
        Upgrade to continue
      </Link>
    </div>
  );
}

