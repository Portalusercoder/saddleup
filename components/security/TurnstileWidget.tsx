"use client";

import { useEffect, useId } from "react";
import Script from "next/script";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";

type TurnstileWidgetProps = {
  onTokenChange: (token: string) => void;
  className?: string;
  /** Matches page theme; `auto` follows the app light/dark toggle. */
  theme?: "light" | "dark" | "auto";
  showLabel?: boolean;
};

declare global {
  interface Window {
    [key: string]: unknown;
  }
}

export default function TurnstileWidget({
  onTokenChange,
  className = "",
  theme = "auto",
  showLabel = true,
}: TurnstileWidgetProps) {
  const { t } = useLanguage();
  const { theme: appTheme } = useTheme();
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const callbackId = useId().replace(/[:]/g, "");
  const callbackName = `saddleupTurnstile_${callbackId}`;
  const expiredName = `${callbackName}_expired`;
  const errorName = `${callbackName}_error`;
  const resolvedTheme = theme === "auto" ? appTheme : theme;

  useEffect(() => {
    window[callbackName] = (token: string) => {
      onTokenChange(token);
    };
    window[expiredName] = () => {
      onTokenChange("");
    };
    window[errorName] = () => {
      onTokenChange("");
    };
    return () => {
      delete window[callbackName];
      delete window[expiredName];
      delete window[errorName];
    };
  }, [callbackName, errorName, expiredName, onTokenChange]);

  if (!siteKey) {
    return (
      <div
        className={`rounded border border-red-300/80 bg-red-50 px-3 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300 ${className}`}
      >
        {t("common.turnstileNotConfigured")}
      </div>
    );
  }

  return (
    <div className={className}>
      {showLabel ? (
        <p className="mb-2 text-xs uppercase tracking-widest text-black/60 dark:text-white/60">
          {t("common.securityCheck")}
        </p>
      ) : null}
      <div
        className="min-h-[4.75rem] w-full rounded border border-black/10 bg-white/80 px-2 py-2 dark:border-white/15 dark:bg-white/5"
        aria-live="polite"
      >
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="afterInteractive"
        />
        <div
          className="cf-turnstile"
          data-sitekey={siteKey}
          data-theme={resolvedTheme}
          data-callback={callbackName}
          data-expired-callback={expiredName}
          data-error-callback={errorName}
        />
      </div>
    </div>
  );
}
