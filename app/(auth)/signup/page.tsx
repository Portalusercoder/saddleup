"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { trackEvent } from "@/lib/analytics/mixpanel-client";
import { useLanguage } from "@/components/providers/LanguageProvider";

type Role = "owner" | "trainer" | "student" | "guardian";

const formClass = "w-full px-4 py-3 bg-base border border-black/10 text-black placeholder-black/40 focus:border-black/30 focus:outline-none";
const labelClass = "block text-xs uppercase tracking-widest text-black/60 mb-2";
const btnPrimary = "w-full py-3 bg-accent text-white font-medium uppercase tracking-wider text-sm hover:opacity-95 transition";

type Step = "form" | "code" | "confirm_join";

export default function SignupPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>("form");
  const [role, setRole] = useState<Role>("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [stableName, setStableName] = useState("");
  const [enterpriseInviteCode, setEnterpriseInviteCode] = useState("");
  const [joinCode, setJoinCode] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    if (code?.trim()) {
      setEnterpriseInviteCode(code.trim().toUpperCase().replace(/\s/g, ""));
      setRole("owner");
    }
  }, [searchParams]);

  const errParam = searchParams.get("error");
  useEffect(() => {
    if (!errParam?.trim()) return;
    const decoded = decodeURIComponent(errParam.trim());
    let cancelled = false;
    (async () => {
      try {
        await fetch("/api/auth/cleanup-incomplete-signup", {
          method: "POST",
          credentials: "include",
        });
      } catch {
        /* ignore */
      }
      try {
        await createClient().auth.signOut();
      } catch {
        /* ignore */
      }
      if (cancelled) return;
      setStablePreview(null);
      setVerifyData(null);
      setCode("");
      setStep("form");
      setError(decoded);
      router.replace("/signup");
    })();
    return () => {
      cancelled = true;
    };
  }, [errParam, router]);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [stablePreview, setStablePreview] = useState<{ name: string; logoUrl: string | null } | null>(null);
  const [verifyData, setVerifyData] = useState<{ userId: string } | null>(null);
  const [resendCooldownSec, setResendCooldownSec] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendHint, setResendHint] = useState<string | null>(null);

  const getOtpOptions = (includeRedirect = true) => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    return {
      shouldCreateUser: true,
      emailRedirectTo:
        includeRedirect && origin ? `${origin}/auth/callback` : undefined,
      data: {
        full_name: fullName.trim(),
        role,
        signup_flow: true,
        stable_name:
          role === "owner"
            ? enterpriseInviteCode.trim()
              ? ""
              : stableName.trim()
            : "",
        enterprise_invite_code:
          role === "owner" && enterpriseInviteCode.trim()
            ? enterpriseInviteCode.trim().toUpperCase().replace(/\s/g, "")
            : "",
        join_code:
          role === "trainer" || role === "student" || role === "guardian"
            ? joinCode.trim().toUpperCase().replace(/\s/g, "")
            : "",
      },
    };
  };

  const requestSignupOtp = async (emailValue: string) => {
    const supabase = createClient();
    const firstTry = await supabase.auth.signInWithOtp({
      email: emailValue.trim(),
      options: getOtpOptions(true),
    });
    if (!firstTry.error) return firstTry;

    const msg = firstTry.error.message.toLowerCase();
    const redirectRejected =
      msg.includes("redirect") ||
      msg.includes("not allowed") ||
      msg.includes("site url");

    if (!redirectRejected) return firstTry;

    return await supabase.auth.signInWithOtp({
      email: emailValue.trim(),
      options: getOtpOptions(false),
    });
  };

  const checkEmailAlreadyExists = async (emailValue: string) => {
    const res = await fetch("/api/auth/check-signup-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailValue.trim() }),
    });
    if (!res.ok) {
      let message = t("auth.signup.errEmailCheck");
      try {
        const data = (await res.json()) as { error?: string };
        if (data?.error) message = data.error;
      } catch {
        /* ignore json parse */
      }
      throw new Error(message);
    }
    const data = (await res.json()) as { exists?: boolean };
    return Boolean(data.exists);
  };

  useEffect(() => {
    if (step !== "code" || resendCooldownSec <= 0) return;
    const id = window.setTimeout(
      () => setResendCooldownSec((s) => s - 1),
      1000
    );
    return () => window.clearTimeout(id);
  }, [step, resendCooldownSec]);

  /** After email OTP verified: remove orphan auth user (no profile) and clear session so failed signup isn’t “half logged in”. */
  const abortVerifiedSignup = async (message: string) => {
    try {
      await fetch("/api/auth/cleanup-incomplete-signup", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      /* ignore */
    }
    try {
      await createClient().auth.signOut();
    } catch {
      /* ignore */
    }
    setStablePreview(null);
    setVerifyData(null);
    setCode("");
    setStep("form");
    setError(message);
    router.refresh();
  };

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    trackEvent("signup_code_requested", { role });
    try {
      const exists = await checkEmailAlreadyExists(email);
      if (exists) {
        trackEvent("signup_code_request_failed", { reason: "email_exists" });
        setError(t("auth.signup.errEmailExists"));
        setLoading(false);
        return;
      }
      const { error: otpError } = await requestSignupOtp(email);
      if (otpError) {
        trackEvent("signup_code_request_failed", { reason: "otp_error" });
        setError(otpError.message);
        setLoading(false);
        return;
      }
      setStep("code");
      trackEvent("signup_code_sent", { role });
      setResendCooldownSec(60);
      setResendHint(null);
      setError(null);
    } catch (err) {
      trackEvent("signup_code_request_failed", { reason: "unknown" });
      setError(err instanceof Error ? err.message : t("auth.signup.errGeneric"));
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationEmail = async () => {
    if (resendCooldownSec > 0 || resendLoading) return;
    setResendHint(null);
    setError(null);
    setResendLoading(true);
    trackEvent("signup_code_resend_requested", { role });
    try {
      const { error: otpError } = await requestSignupOtp(email);
      if (otpError) {
        trackEvent("signup_code_resend_failed");
        setError(otpError.message);
        return;
      }
      trackEvent("signup_code_resent");
      setResendCooldownSec(60);
      setResendHint(t("auth.signup.resendAnother"));
    } catch {
      setError(t("auth.signup.errGeneric"));
    } finally {
      setResendLoading(false);
    }
  };

  const verifyAndComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || code.trim().length < 8) {
      setError(t("auth.signup.errEnter8"));
      return;
    }
    setError(null);
    setLoading(true);
    trackEvent("signup_verify_attempted", { role });
    try {
      const supabase = createClient();
      const { data: vData, error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code.trim(),
        type: "email",
      });
      if (verifyError) {
        trackEvent("signup_verify_failed", { reason: "otp_verify_error" });
        setError(verifyError.message);
        setLoading(false);
        return;
      }
      if (!vData.user) {
        trackEvent("signup_verify_failed", { reason: "missing_user" });
        setError(t("auth.signup.errVerificationFailed"));
        setLoading(false);
        return;
      }
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        trackEvent("signup_verify_failed", { reason: "password_set_error" });
        setLoading(false);
        await abortVerifiedSignup(updateError.message);
        return;
      }
      // Persist session to cookies before server-side routes read them (SSR client).
      await supabase.auth.getSession();
      if (role === "owner") {
        const res = await fetch("/api/auth/complete-signup", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: vData.user.id,
            role,
            fullName: fullName.trim(),
            email: email.trim(),
            stableName: enterpriseInviteCode.trim() ? "" : stableName.trim(),
            joinCode: enterpriseInviteCode.trim()
              ? enterpriseInviteCode.trim().toUpperCase().replace(/\s/g, "")
              : undefined,
          }),
        });
        let result: { error?: string; inviteCode?: string } = {};
        try {
          result = (await res.json()) as { error?: string; inviteCode?: string };
        } catch {
          if (!res.ok) {
            setLoading(false);
            await abortVerifiedSignup(t("auth.signup.errFailedComplete"));
            return;
          }
        }
        if (!res.ok) {
          trackEvent("signup_complete_failed", { role });
          setLoading(false);
          await abortVerifiedSignup(
            result.inviteCode
              ? `${result.error ?? t("auth.signup.errFailedComplete")} ${result.inviteCode}`
              : result.error || t("auth.signup.errFailedComplete")
          );
          return;
        }
        router.push("/dashboard");
        trackEvent("signup_completed_client", { role });
        router.refresh();
        return;
      }
      const previewRes = await fetch(`/api/stables/preview-by-code?code=${encodeURIComponent(joinCode.trim())}`);
      const preview = await previewRes.json();
      if (!previewRes.ok || !preview.name) {
        trackEvent("signup_complete_failed", {
          role,
          reason: "invalid_join_code",
        });
        setLoading(false);
        await abortVerifiedSignup(t("auth.signup.errInvalidJoin"));
        return;
      }
      setStablePreview({ name: preview.name, logoUrl: preview.logoUrl ?? null });
      setVerifyData({ userId: vData.user.id });
      setStep("confirm_join");
      trackEvent("signup_stable_previewed", { role });
    } catch {
      trackEvent("signup_verify_failed", { reason: "unknown" });
      setLoading(false);
      await abortVerifiedSignup(t("auth.signup.errGeneric"));
      return;
    } finally {
      setLoading(false);
    }
  };

  const confirmJoinStable = async () => {
    if (!verifyData || !stablePreview) return;
    setLoading(true);
    setError(null);
    trackEvent("signup_join_confirmed_click");
    try {
      await createClient().auth.getSession();
      const res = await fetch("/api/auth/complete-signup", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: verifyData.userId,
          role,
          fullName: fullName.trim(),
          email: email.trim(),
          joinCode: joinCode.trim(),
        }),
      });
      let result: { error?: string; inviteCode?: string } = {};
      try {
        result = (await res.json()) as { error?: string; inviteCode?: string };
      } catch {
        if (!res.ok) {
          setLoading(false);
          await abortVerifiedSignup(t("auth.signup.errFailedComplete"));
          return;
        }
      }
      if (!res.ok) {
        trackEvent("signup_complete_failed", { role });
        setLoading(false);
        await abortVerifiedSignup(
          result.inviteCode
            ? `${result.error ?? t("auth.signup.errFailedComplete")} ${result.inviteCode}. ${t("auth.signup.shareIdWithOwner")}`
            : result.error || t("auth.signup.errFailedComplete")
        );
        return;
      }
      router.push("/dashboard");
      trackEvent("signup_completed_client", { role });
      router.refresh();
    } catch {
      setLoading(false);
      await abortVerifiedSignup(t("auth.signup.errGeneric"));
    }
  };

  const declineJoinStable = async () => {
    trackEvent("signup_join_declined");
    try {
      await fetch("/api/auth/cleanup-incomplete-signup", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      /* ignore */
    }
    try {
      await createClient().auth.signOut();
    } catch {
      /* ignore */
    }
    router.push("/signup");
    router.refresh();
  };

  if (step === "confirm_join" && stablePreview) {
    return (
      <div className="min-h-screen bg-base flex text-black items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <div className="border border-black/10 p-6 sm:p-8 md:p-10 text-center">
            <h1 className="font-serif text-2xl md:text-3xl font-normal text-black mb-2">
              {t("auth.signup.confirmJoinTitle")}
            </h1>
            <p className="text-black/60 text-sm mb-6">
              {t("auth.signup.confirmJoinSubtitle")}
            </p>
            <div className="mb-6 flex flex-col items-center gap-4">
              {stablePreview.logoUrl ? (
                <img
                  src={stablePreview.logoUrl}
                  alt=""
                  className="w-24 h-24 rounded-lg object-cover border border-black/10"
                />
              ) : (
                <div className="w-24 h-24 rounded-lg bg-black/5 border border-black/10 flex items-center justify-center">
                  <span className="text-black/40 text-2xl font-serif">{stablePreview.name.charAt(0)}</span>
                </div>
              )}
              <p className="font-medium text-black text-lg">{stablePreview.name}</p>
            </div>
            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={confirmJoinStable}
                disabled={loading}
                className={`${btnPrimary} disabled:opacity-50`}
              >
                {loading ? t("auth.signup.joining") : t("auth.signup.yesJoin")}
              </button>
              <button
                type="button"
                onClick={declineJoinStable}
                disabled={loading}
                className="w-full py-3 border border-black/20 text-red-600 text-sm hover:bg-black/5 transition"
              >
                {t("auth.signup.noBack")}
              </button>
            </div>
          </div>
          <p className="mt-6 text-center">
            <Link href="/" className="text-black/50 hover:text-black/70 text-xs uppercase tracking-wider">
              {t("auth.signup.backHome")}
            </Link>
          </p>
        </div>
      </div>
    );
  }

  if (step === "code") {
    return (
      <div className="min-h-screen bg-base flex text-black items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <div className="border border-black/10 p-6 sm:p-8 md:p-10">
            <h1 className="font-serif text-2xl md:text-3xl font-normal text-black mb-2">
              {t("auth.signup.checkEmailTitle")}
            </h1>
            <p className="text-black/60 text-sm mb-6">
              {t("auth.signup.checkEmailBody", { email })}
            </p>
            <form onSubmit={verifyAndComplete} className="space-y-5">
              <div>
                <label htmlFor="code" className={labelClass}>
                  {t("auth.signup.verificationCode")}
                </label>
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
                  placeholder="00000000"
                  maxLength={8}
                  className={`${formClass} text-center text-lg tracking-[0.4em]`}
                />
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading || code.trim().length !== 8}
                className={`${btnPrimary} disabled:opacity-50`}
              >
                {loading ? t("auth.signup.verifying") : t("auth.signup.verifyAndCreate")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("form");
                  setCode("");
                  setError(null);
                  setResendCooldownSec(0);
                  setResendHint(null);
                }}
                className="w-full py-3 border border-black/20 text-red-600 text-sm hover:bg-black/5 transition"
              >
                {t("auth.signup.useDifferentEmail")}
              </button>
            </form>
            <div className="mt-5 pt-5 border-t border-black/10 text-center">
              {resendHint && (
                <p className="text-black/70 text-sm mb-3">{resendHint}</p>
              )}
              {resendCooldownSec > 0 ? (
                <p className="text-black/50 text-xs uppercase tracking-wider">
                  {t("auth.signup.resendEmailIn", { seconds: String(resendCooldownSec) })}
                </p>
              ) : (
                <button
                  type="button"
                  onClick={resendVerificationEmail}
                  disabled={resendLoading}
                  className="text-black font-medium text-sm uppercase tracking-wider underline-offset-2 hover:underline disabled:opacity-50"
                >
                  {resendLoading ? t("auth.forgot.sending") : t("auth.signup.resendVerification")}
                </button>
              )}
            </div>
          </div>
          <p className="mt-6 text-center">
            <Link href="/" className="text-black/50 hover:text-black/70 text-xs uppercase tracking-wider">
              {t("auth.signup.backHome")}
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base flex text-black items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="border border-black/10 p-6 sm:p-8 md:p-10">
          <h1 className="font-serif text-2xl md:text-3xl font-normal text-black mb-2">
            {t("auth.signup.title")}
          </h1>
          <p className="text-black/60 text-sm mb-8">
            {t("auth.signup.subtitle")}
          </p>

          <form onSubmit={sendCode} className="space-y-5">
            <div>
              <label className={labelClass}>{t("auth.signup.iamRole")}</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(["owner", "trainer", "student", "guardian"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`min-h-[44px] flex items-center justify-center p-4 px-6 text-sm font-medium uppercase tracking-wider transition ${
                      role === r
                        ? "bg-accent text-white"
                        : "bg-base text-black/60 hover:text-black border border-black/10"
                    }`}
                  >
                    {t(`auth.signup.roles.${r}`)}
                  </button>
                ))}
              </div>
              <p className="text-black/40 text-xs mt-2 uppercase tracking-wider">
                {role === "owner" && t("auth.signup.roleHelpOwner")}
                {role === "trainer" && t("auth.signup.roleHelpTrainer")}
                {role === "student" && t("auth.signup.roleHelpStudent")}
                {role === "guardian" && t("auth.signup.roleHelpGuardian")}
              </p>
            </div>

            <div>
              <label htmlFor="fullName" className={labelClass}>
                {t("common.fullName")}
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className={formClass}
                placeholder="Omar"
              />
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
                className={formClass}
                placeholder={t("common.placeholderEmail")}
              />
            </div>

            <div>
              <label htmlFor="password" className={labelClass}>
                {t("common.password")}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className={formClass}
                placeholder="••••••••"
              />
            </div>

            {role === "owner" && (
              <>
                <div>
                  <label htmlFor="enterpriseCode" className={labelClass}>
                    {t("auth.signup.enterpriseInvite")}
                  </label>
                  <input
                    id="enterpriseCode"
                    type="text"
                    value={enterpriseInviteCode}
                    onChange={(e) => setEnterpriseInviteCode(e.target.value.toUpperCase().replace(/\s/g, ""))}
                    className={formClass}
                    placeholder={t("auth.signup.enterprisePlaceholder")}
                  />
                  <p className="text-black/40 text-xs mt-2 uppercase tracking-wider">
                    {t("auth.signup.enterpriseHint")}
                  </p>
                </div>
                <div>
                  <label htmlFor="stableName" className={labelClass}>
                    {t("auth.signup.stableName")}{" "}
                    {enterpriseInviteCode.trim() ? t("auth.signup.stableNameNotNeeded") : ""}
                  </label>
                  <input
                    id="stableName"
                    type="text"
                    value={stableName}
                    onChange={(e) => setStableName(e.target.value)}
                    required={!enterpriseInviteCode.trim()}
                    disabled={!!enterpriseInviteCode.trim()}
                    className={formClass}
                    placeholder={t("auth.signup.stablePlaceholder")}
                  />
                  {!enterpriseInviteCode.trim() && (
                    <p className="text-black/40 text-xs mt-2 uppercase tracking-wider">
                      {t("auth.signup.stableHint")}
                    </p>
                  )}
                </div>
              </>
            )}

            {(role === "trainer" || role === "student" || role === "guardian") && (
              <div>
                <label htmlFor="joinCode" className={labelClass}>
                  {t("auth.signup.joinCodeLabel")}
                </label>
                <input
                  id="joinCode"
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/\s/g, ""))}
                  required
                  className={formClass}
                  placeholder={t("auth.signup.joinCodePlaceholder")}
                />
                <p className="text-black/40 text-xs mt-2 uppercase tracking-wider">
                  {t("auth.signup.joinCodeHelpBefore")}{" "}
                  <Link href={t("auth.signup.joinCodeHelpLink")} className="text-black font-medium hover:underline">
                    {t("auth.signup.joinCodeHelpLink")}
                  </Link>{" "}
                  {t("auth.signup.joinCodeHelpAfter")}
                </p>
              </div>
            )}

            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`${btnPrimary} disabled:opacity-50`}
            >
              {loading ? t("auth.signup.sendingCode") : t("auth.signup.sendVerificationCode")}
            </button>
          </form>

          <p className="mt-8 text-center text-black/60 text-sm">
            {t("auth.signup.alreadyHave")}{" "}
            <Link href="/login" className="text-black font-medium hover:underline">
              {t("auth.signup.signIn")}
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center">
          <Link href="/" className="text-black/50 hover:text-black/70 text-xs uppercase tracking-wider">
            {t("auth.signup.backHome")}
          </Link>
        </p>
      </div>
    </div>
  );
}
