"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useProfile } from "@/components/providers/ProfileProvider";

type SubscriptionInfo = {
  status: string;
  planType?: string | null;
  trialEndsAt?: string | null;
  gracePeriodEndsAt?: string | null;
  readOnly?: boolean;
};

export default function TrialBanner() {
  const { profile } = useProfile();
  const [data, setData] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.role !== "owner") return;
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
  }, [profile?.role]);

  if (profile?.role !== "owner" || loading || !data) return null;

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
          ? "border-amber-600/70 bg-amber-50 text-amber-900"
          : "border-black/15 bg-black/5 text-black/90"
      }`}
    >
      <p>{message}</p>
      <Link
        href="/dashboard/settings"
        className="inline-flex items-center justify-center px-4 py-2 bg-accent text-white text-xs font-semibold uppercase tracking-[0.18em] hover:opacity-90 transition"
      >
        Upgrade to continue
      </Link>
    </div>
  );
}

