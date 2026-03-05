"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Role = "owner" | "trainer" | "student" | "guardian";

const formClass = "w-full px-4 py-3 bg-black border border-white/10 text-white placeholder-white/40 focus:border-white/30 focus:outline-none";
const labelClass = "block text-xs uppercase tracking-widest text-white/60 mb-2";
const btnPrimary = "w-full py-3 bg-white text-black font-medium uppercase tracking-wider text-sm hover:opacity-95 transition";

type Step = "form" | "code" | "confirm_join";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [role, setRole] = useState<Role>("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [stableName, setStableName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [stablePreview, setStablePreview] = useState<{ name: string; logoUrl: string | null } | null>(null);
  const [verifyData, setVerifyData] = useState<{ userId: string } | null>(null);

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true,
          data: {
            full_name: fullName.trim(),
            role,
            signup_flow: true,
          },
        },
      });
      if (otpError) {
        setError(otpError.message);
        setLoading(false);
        return;
      }
      setStep("code");
      setError(null);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const verifyAndComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || code.trim().length < 8) {
      setError("Please enter the 8-digit code from your email");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: vData, error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code.trim(),
        type: "email",
      });
      if (verifyError) {
        setError(verifyError.message);
        setLoading(false);
        return;
      }
      if (!vData.user) {
        setError("Verification failed");
        setLoading(false);
        return;
      }
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }
      if (role === "owner") {
        const res = await fetch("/api/auth/complete-signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: vData.user.id,
            role,
            fullName: fullName.trim(),
            email: email.trim(),
            stableName,
            joinCode: undefined,
          }),
        });
        const result = await res.json();
        if (!res.ok) {
          setError(result.error || "Failed to complete signup");
          setLoading(false);
          return;
        }
        router.push("/dashboard");
        router.refresh();
        return;
      }
      const previewRes = await fetch(`/api/stables/preview-by-code?code=${encodeURIComponent(joinCode.trim())}`);
      const preview = await previewRes.json();
      if (!previewRes.ok || !preview.name) {
        setError("Invalid join code. Please check the code and try again.");
        setLoading(false);
        return;
      }
      setStablePreview({ name: preview.name, logoUrl: preview.logoUrl ?? null });
      setVerifyData({ userId: vData.user.id });
      setStep("confirm_join");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const confirmJoinStable = async () => {
    if (!verifyData || !stablePreview) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/complete-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: verifyData.userId,
          role,
          fullName: fullName.trim(),
          email: email.trim(),
          joinCode: joinCode.trim(),
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        if (result.inviteCode) {
          setError(`${result.error} ${result.inviteCode}. Share this ID with your stable owner.`);
        } else {
          setError(result.error || "Failed to complete signup");
        }
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  const declineJoinStable = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/signup");
    router.refresh();
  };

  if (step === "confirm_join" && stablePreview) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <div className="border border-white/10 p-6 sm:p-8 md:p-10 text-center">
            <h1 className="font-serif text-2xl md:text-3xl font-normal text-white mb-2">
              Is this the stable you want to join?
            </h1>
            <p className="text-white/60 text-sm mb-6">
              Confirm before we add you to this stable.
            </p>
            <div className="mb-6 flex flex-col items-center gap-4">
              {stablePreview.logoUrl ? (
                <img
                  src={stablePreview.logoUrl}
                  alt=""
                  className="w-24 h-24 rounded-lg object-cover border border-white/10"
                />
              ) : (
                <div className="w-24 h-24 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  <span className="text-white/40 text-2xl font-serif">{stablePreview.name.charAt(0)}</span>
                </div>
              )}
              <p className="font-medium text-white text-lg">{stablePreview.name}</p>
            </div>
            {error && <p className="text-white/80 text-sm mb-4">{error}</p>}
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={confirmJoinStable}
                disabled={loading}
                className={`${btnPrimary} disabled:opacity-50`}
              >
                {loading ? "Joining..." : "Yes, join this stable"}
              </button>
              <button
                type="button"
                onClick={declineJoinStable}
                disabled={loading}
                className="w-full py-3 border border-white/20 text-white/80 text-sm hover:bg-white/5 transition"
              >
                No, take me back
              </button>
            </div>
          </div>
          <p className="mt-6 text-center">
            <Link href="/" className="text-white/50 hover:text-white/70 text-xs uppercase tracking-wider">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    );
  }

  if (step === "code") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <div className="border border-white/10 p-6 sm:p-8 md:p-10">
            <h1 className="font-serif text-2xl md:text-3xl font-normal text-white mb-2">
              Check your email
            </h1>
            <p className="text-white/60 text-sm mb-6">
              We sent an 8-digit code to <strong className="text-white">{email}</strong>. Enter it below. You can open your email on any device.
            </p>
            <form onSubmit={verifyAndComplete} className="space-y-5">
              <div>
                <label htmlFor="code" className={labelClass}>
                  Verification code
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
              {error && <p className="text-white/80 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading || code.trim().length !== 8}
                className={`${btnPrimary} disabled:opacity-50`}
              >
                {loading ? "Verifying..." : "Verify and create account"}
              </button>
              <button
                type="button"
                onClick={() => { setStep("form"); setCode(""); setError(null); }}
                className="w-full py-3 border border-white/20 text-white/80 text-sm hover:bg-white/5 transition"
              >
                Use a different email
              </button>
            </form>
          </div>
          <p className="mt-6 text-center">
            <Link href="/" className="text-white/50 hover:text-white/70 text-xs uppercase tracking-wider">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="border border-white/10 p-6 sm:p-8 md:p-10">
          <h1 className="font-serif text-2xl md:text-3xl font-normal text-white mb-2">
            Create account
          </h1>
          <p className="text-white/60 text-sm mb-8">
            We&apos;ll send an 8-digit code to your email to verify it. No links to click — works on any device.
          </p>

          <form onSubmit={sendCode} className="space-y-5">
            <div>
              <label className={labelClass}>I am a</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(["owner", "trainer", "student", "guardian"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2.5 px-3 text-sm font-medium uppercase tracking-wider transition ${
                      role === r
                        ? "bg-white text-black"
                        : "bg-black text-white/60 hover:text-white border border-white/10"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <p className="text-white/40 text-xs mt-2 uppercase tracking-wider">
                {role === "owner" && "Create and manage your stable"}
                {role === "trainer" && "Teach lessons, log training"}
                {role === "student" && "Take lessons, track progress"}
                {role === "guardian" && "View your child's lessons and progress"}
              </p>
            </div>

            <div>
              <label htmlFor="fullName" className={labelClass}>
                Full name
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
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={formClass}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className={labelClass}>
                Password
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
              <div>
                <label htmlFor="stableName" className={labelClass}>
                  Stable name
                </label>
                <input
                  id="stableName"
                  type="text"
                  value={stableName}
                  onChange={(e) => setStableName(e.target.value)}
                  required
                  className={formClass}
                  placeholder="My Riding School"
                />
                <p className="text-white/40 text-xs mt-2 uppercase tracking-wider">
                  A unique 8-character join code will be generated for your stable. Share it with trainers and students.
                </p>
              </div>
            )}

            {(role === "trainer" || role === "student" || role === "guardian") && (
              <div>
                <label htmlFor="joinCode" className={labelClass}>
                  Stable join code
                </label>
                <input
                  id="joinCode"
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/\s/g, ""))}
                  required
                  className={formClass}
                  placeholder="ABC12XYZ"
                />
                <p className="text-white/40 text-xs mt-2 uppercase tracking-wider">
                  Ask your stable owner for the 8-character code. If it doesn&apos;t work, get your personal ID at{" "}
                  <Link href="/get-my-id" className="text-white hover:underline">/get-my-id</Link> and share it with them.
                </p>
              </div>
            )}

            {error && (
              <p className="text-white/80 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`${btnPrimary} disabled:opacity-50`}
            >
              {loading ? "Sending code..." : "Send verification code"}
            </button>
          </form>

          <p className="mt-8 text-center text-white/60 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-white hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center">
          <Link href="/" className="text-white/50 hover:text-white/70 text-xs uppercase tracking-wider">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
