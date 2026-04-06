"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { captureClientEvent } from "@/lib/analytics/posthog-client";

const MIN_PASSWORD_LENGTH = 8;

const formClass =
  "w-full px-4 py-3 bg-base border border-black/10 text-black placeholder-black/40 focus:border-black/30 focus:outline-none";
const labelClass = "block text-xs uppercase tracking-widest text-black/60 mb-2";
const btnPrimary =
  "w-full py-3 bg-accent text-white font-medium uppercase tracking-wider text-sm hover:opacity-95 transition";

type Step = "email" | "reset" | "done";

function ForgotPasswordForm() {
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
    setLoading(true);
    captureClientEvent("password_reset_code_requested");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        captureClientEvent("password_reset_code_request_failed");
        setError(typeof data.error === "string" ? data.error : "Something went wrong");
        setLoading(false);
        return;
      }
      captureClientEvent("password_reset_code_sent");
      setInfo(typeof data.message === "string" ? data.message : null);
      setStep("reset");
      setCode("");
      setNewPassword("");
      setConfirmPassword("");
      setResendCooldownSec(60);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    if (resendCooldownSec > 0 || resendLoading || !email.trim()) return;
    setResendLoading(true);
    setError(null);
    captureClientEvent("password_reset_code_resend_requested");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        captureClientEvent("password_reset_code_resend_failed");
        setError(typeof data.error === "string" ? data.error : "Could not resend");
        return;
      }
      captureClientEvent("password_reset_code_resent");
      setResendCooldownSec(60);
      setInfo("We sent another code to your email.");
    } catch {
      setError("Something went wrong");
    } finally {
      setResendLoading(false);
    }
  };

  const confirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return;
    }
    const digits = code.replace(/\D/g, "");
    if (digits.length !== 4) {
      setError("Enter the 4-digit code from your email");
      return;
    }
    setLoading(true);
    captureClientEvent("password_reset_confirm_attempted");
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
        captureClientEvent("password_reset_confirm_failed");
        setError(typeof data.error === "string" ? data.error : "Could not reset password");
        setLoading(false);
        return;
      }
      captureClientEvent("password_reset_confirmed");
      setError(null);
      setInfo(null);
      setStep("done");
      setCode("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base flex items-center justify-center p-4 sm:p-6 text-black">
      <div className="w-full max-w-md">
        <div className="border border-black/10 p-8 md:p-10">
          <h1 className="font-serif text-2xl md:text-3xl font-normal text-black mb-2">
            Reset password
          </h1>
          <p className="text-black/60 text-sm mb-8">
            We’ll email you a 4-digit code. Then choose a new password.
          </p>

          {info && step !== "done" && (
            <p className="text-sm text-black/70 mb-4 border border-black/10 px-3 py-2 bg-black/[0.02]">
              {info}
            </p>
          )}

          {step === "done" ? (
            <div className="space-y-5">
              <p className="text-black/80 text-sm">
                Your password was updated. You can sign in with your new password.
              </p>
              <Link
                href="/login"
                className={`${btnPrimary} inline-flex w-full items-center justify-center no-underline`}
              >
                Sign in
              </Link>
            </div>
          ) : step === "email" ? (
            <form onSubmit={sendCode} className="space-y-5">
              <div>
                <label htmlFor="email" className={labelClass}>
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className={formClass}
                  placeholder="you@example.com"
                />
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button type="submit" disabled={loading} className={`${btnPrimary} disabled:opacity-50`}>
                {loading ? "Sending…" : "Send code"}
              </button>
            </form>
          ) : (
            <form onSubmit={confirmReset} className="space-y-5">
              <p className="text-sm text-black/60">
                Code sent to <span className="text-black font-medium">{email}</span>
              </p>
              <div>
                <label htmlFor="code" className={labelClass}>
                  4-digit code
                </label>
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  maxLength={8}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  required
                  className={formClass}
                  placeholder="0000"
                  autoComplete="one-time-code"
                />
              </div>
              <div>
                <label htmlFor="newPassword" className={labelClass}>
                  New password
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
                  Confirm new password
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
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button type="submit" disabled={loading} className={`${btnPrimary} disabled:opacity-50`}>
                {loading ? "Updating…" : "Update password"}
              </button>
              <div className="flex flex-wrap items-center gap-2 text-sm text-black/60">
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
                  Use a different email
                </button>
                <span className="text-black/40">·</span>
                {resendCooldownSec > 0 ? (
                  <span>Resend code in {resendCooldownSec}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={resendCode}
                    disabled={resendLoading}
                    className="text-black underline hover:no-underline disabled:opacity-50"
                  >
                    {resendLoading ? "Sending…" : "Resend code"}
                  </button>
                )}
              </div>
            </form>
          )}

          <p className="mt-8 text-center text-black/60 text-sm">
            <Link href="/login" className="text-black font-medium hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center">
          <Link href="/" className="text-black/50 hover:text-black/70 text-xs uppercase tracking-wider">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<LoadingScreen fullPage message="Loading…" />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
