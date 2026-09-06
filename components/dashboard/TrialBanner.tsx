"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProfile } from "@/components/providers/ProfileProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";

type SubscriptionInfo = {
  status: string;
  planType?: string | null;
  trialEndsAt?: string | null;
  gracePeriodEndsAt?: string | null;
  readOnly?: boolean;
};

const TRIAL_BAR_HEIGHT = "2.75rem";

export default function TrialBanner() {
  const pathname = usePathname();
  const { profile } = useProfile();
  const { t } = useLanguage();
  const [data, setData] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/confirm-email";

  useEffect(() => {
    if (profile?.role !== "owner" || isAuthPage) {
      setLoading(false);
      setData(null);
      return;
    }
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
  }, [profile?.role, isAuthPage]);

  const trialEndDate = data?.trialEndsAt ? new Date(data.trialEndsAt) : null;
  const now = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysLeft =
    trialEndDate && trialEndDate > now
      ? Math.ceil((trialEndDate.getTime() - now.getTime()) / msPerDay)
      : 0;

  const expired =
    !!data &&
    (data.readOnly || data.status === "expired" || data.status === "suspended");
  const endingSoon =
    !!data && data.status === "trialing" && daysLeft <= 7 && daysLeft >= 0;
  const visible =
    profile?.role === "owner" && !loading && !isAuthPage && (expired || endingSoon);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (visible) {
      document.documentElement.style.setProperty("--su-trial-bar-h", TRIAL_BAR_HEIGHT);
      document.documentElement.dataset.trialBar = "1";
    } else {
      document.documentElement.style.setProperty("--su-trial-bar-h", "0px");
      delete document.documentElement.dataset.trialBar;
    }
    return () => {
      document.documentElement.style.setProperty("--su-trial-bar-h", "0px");
      delete document.documentElement.dataset.trialBar;
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      role="status"
      className="su-trial-bar fixed top-0 inset-x-0 z-[60] flex items-center justify-center gap-x-3 gap-y-1 px-3 sm:px-4 min-h-[2.75rem] py-1.5 bg-black text-white border-b border-white/10 text-center"
    >
      <span className="inline-flex items-center justify-center gap-2 text-[0.78rem] sm:text-[0.84rem] leading-snug">
        <svg
          className="w-3.5 h-3.5 shrink-0 opacity-80"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
          />
        </svg>

        {expired ? (
          <span>
            {t("dashboard.trialBarExpiredLead")}{" "}
            <Link
              href="/dashboard/settings"
              className="font-semibold underline underline-offset-2 hover:opacity-80"
            >
              {t("dashboard.trialBarUpgradeNow")}
            </Link>{" "}
            {t("dashboard.trialBarExpiredSuffix")}
          </span>
        ) : (
          <span className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <span>{t("dashboard.trialBarHeadsUp")}</span>
            <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 rounded-sm bg-white text-black text-[0.75rem] font-semibold tabular-nums">
              {daysLeft}
            </span>
            <span>{daysLeft === 1 ? t("dashboard.trialBarDay") : t("dashboard.trialBarDays")}</span>
            <span className="hidden sm:inline opacity-35 mx-0.5" aria-hidden>
              |
            </span>
            <span>
              <Link
                href="/dashboard/settings"
                className="font-semibold underline underline-offset-2 hover:opacity-80"
              >
                {t("dashboard.trialBarUpgradeNow")}
              </Link>{" "}
              {t("dashboard.trialBarKeepActive")}
            </span>
          </span>
        )}
      </span>
    </div>
  );
}
