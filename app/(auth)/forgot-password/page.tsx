"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { trackEvent } from "@/lib/analytics/mixpanel-client";
import TurnstileWidget from "@/components/security/TurnstileWidget";
import { hasTurnstileToken } from "@/lib/security/turnstile-client";
import { useLanguage } from "@/components/providers/LanguageProvider";
import AuthShell, {
  authBtnPrimary as btnPrimary,
  authFormClass as formClass,
  authLabelClass as labelClass,
} from "@/components/landing/AuthShell";

const MIN_PASSWORD_LENGTH = 10;
const RESET_CODE_LENGTH = 8;

type Step = "email" | "reset" | "done";

function ForgotPasswordForm() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendCooldownSec, setResendCooldownSec] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");

  useEffect(() => {
    const pre = searchParams.get("email")?.trim();
    if (pre) setEmail(pre);
  }, [searchParams]);

  useEffect(() => {
    if (step !== "reset" || resendCooldownSec <= 0) return;
    const id = window.setTimeout(() => setResendCooldownSec((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [step, resendCooldownSec]);

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!hasTurnstileToken(turnstileToken)) {
      setError(t("auth.forgot.turnstileRequired"));
      return;
    }
    setLoading(true);
    trackEvent("password_reset_code_requested");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          turnstileToken: turnstileToken.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        trackEvent("password_reset_code_request_failed");
        setError(typeof data.error === "string" ? data.error : t("auth.forgot.errorGeneric"));
        setLoading(false);
        return;
      }
      setInfo(typeof data.message === "string" ? data.message : null);
      trackEvent("password_reset_code_sent");
      setStep("reset");
      setCode("");
      setNewPassword("");
      setConfirmPassword("");
      setResendCooldownSec(60);
    } catch {
      setError(t("auth.forgot.errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    if (resendCooldownSec > 0 || resendLoading || !email.trim()) return;
    if (!hasTurnstileToken(turnstileToken)) {
      setError(t("auth.forgot.turnstileRequired"));
      return;
    }
    setResendLoading(true);
    setError(null);
    trackEvent("password_reset_code_resend_requested");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          turnstileToken: turnstileToken.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        trackEvent("password_reset_code_resend_failed");
        setError(typeof data.error === "string" ? data.error : t("auth.forgot.errorResend"));
        return;
      }
      trackEvent("password_reset_code_resent");
      setResendCooldownSec(60);
      setInfo(t("auth.forgot.anotherCodeSent"));
    } catch {
      setError(t("auth.forgot.errorGeneric"));
    } finally {
      setResendLoading(false);
    }
  };

  const confirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError(t("auth.forgot.passwordMismatch"));
      return;
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(t("auth.forgot.passwordMin", { n: String(MIN_PASSWORD_LENGTH) }));
      return;
    }
    const digits = code.replace(/\D/g, "");
    if (digits.length !== RESET_CODE_LENGTH) {
      setError(t("auth.forgot.enterCode8"));
      return;
    }
    setLoading(true);
    trackEvent("password_reset_confirm_attempted");
    try {
      const res = await fetch("/api/auth/forgot-password/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          code: digits,
          newPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        trackEvent("password_reset_confirm_failed");
        setError(typeof data.error === "string" ? data.error : t("auth.forgot.errorReset"));
        setLoading(false);
        return;
      }
      trackEvent("password_reset_confirmed");
      setError(null);
      setInfo(null);
      setStep("done");
      setCode("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setError(t("auth.forgot.errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <h1 className="font-serif text-2xl md:text-3xl font-medium text-white mb-2">
        {t("auth.forgot.title")}
      </h1>
      <p className="text-white/50 text-sm mb-8">{t("auth.forgot.subtitle")}</p>

      {info && step !== "done" && (
        <p className="text-sm text-white/70 mb-4 border border-white/10 px-3 py-2 bg-white/[0.04] rounded-control">
          {info}
        </p>
      )}

      {step === "done" ? (
        <div className="space-y-5">
          <p className="text-white/80 text-sm">{t("auth.forgot.passwordUpdated")}</p>
          <Link
            href="/login"
            className={`${btnPrimary} inline-flex w-full items-center justify-center no-underline`}
          >
            {t("auth.forgot.signIn")}
          </Link>
        </div>
      ) : step === "email" ? (
        <form onSubmit={sendCode} className="space-y-5">
          <div>
            <TurnstileWidget onTokenChange={setTurnstileToken} theme="dark" />
          </div>
          <div>
            <label htmlFor="email" className={labelClass}>
              {t("common.email")}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className={formClass}
              placeholder={t("common.placeholderEmail")}
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className={`${btnPrimary} disabled:opacity-50`}>
            {loading ? t("auth.forgot.sending") : t("auth.forgot.sendCode")}
          </button>
        </form>
      ) : (
        <form onSubmit={confirmReset} className="space-y-5">
          <p className="text-sm text-white/50">{t("auth.forgot.codeSentTo", { email })}</p>
          <div>
            <label htmlFor="code" className={labelClass}>
              {t("auth.forgot.code8Label")}
            </label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              maxLength={RESET_CODE_LENGTH}
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, RESET_CODE_LENGTH))
              }
              required
              className={formClass}
              placeholder="00000000"
              autoComplete="one-time-code"
            />
          </div>
          <div>
            <label htmlFor="newPassword" className={labelClass}>
              {t("auth.forgot.newPassword")}
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={MIN_PASSWORD_LENGTH}
              className={formClass}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className={labelClass}>
              {t("auth.forgot.confirmNewPassword")}
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={MIN_PASSWORD_LENGTH}
              className={formClass}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className={`${btnPrimary} disabled:opacity-50`}>
            {loading ? t("auth.forgot.updating") : t("auth.forgot.updatePassword")}
          </button>
          <div className="flex flex-wrap items-center gap-2 text-sm text-white/50">
            <TurnstileWidget onTokenChange={setTurnstileToken} theme="dark" className="w-full" />
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setError(null);
                setInfo(null);
                setCode("");
              }}
              className="text-black underline hover:no-underline"
            >
              {t("auth.forgot.useDifferentEmail")}
            </button>
            <span className="text-white/30">·</span>
            {resendCooldownSec > 0 ? (
              <span>{t("auth.forgot.resendIn", { seconds: String(resendCooldownSec) })}</span>
            ) : (
              <button
                type="button"
                onClick={resendCode}
                disabled={resendLoading}
                className="text-black underline hover:no-underline disabled:opacity-50"
              >
                {resendLoading ? t("auth.forgot.sending") : t("auth.forgot.resendCode")}
              </button>
            )}
          </div>
        </form>
      )}

      <p className="mt-8 text-center text-white/50 text-sm">
        <Link href="/login" className="text-black font-medium hover:underline">
          {t("auth.forgot.backToSignIn")}
        </Link>
      </p>
    </AuthShell>
  );
}

function ForgotPasswordLoading() {
  const { t } = useLanguage();
  return <LoadingScreen fullPage message={t("common.loading")} />;
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<ForgotPasswordLoading />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
