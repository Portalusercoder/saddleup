"use client";

import { useEffect, useId } from "react";
import Script from "next/script";

type TurnstileWidgetProps = {
  onTokenChange: (token: string) => void;
  className?: string;
};

declare global {
  interface Window {
    [key: string]: unknown;
  }
}

export default function TurnstileWidget({
  onTokenChange,
  className,
}: TurnstileWidgetProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const callbackId = useId().replace(/[:]/g, "");
  const callbackName = `saddleupTurnstile_${callbackId}`;
  const expiredName = `${callbackName}_expired`;
  const errorName = `${callbackName}_error`;

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
      <p className="text-xs text-red-600">
        Turnstile is not configured. Please set
        ` NEXT_PUBLIC_TURNSTILE_SITE_KEY`.
      </p>
    );
  }

  return (
    <div className={className}>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
      />
      <div
        className="cf-turnstile"
        data-sitekey={siteKey}
        data-callback={callbackName}
        data-expired-callback={expiredName}
        data-error-callback={errorName}
      />
    </div>
  );
}
