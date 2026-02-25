"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Role = "owner" | "trainer" | "student" | "guardian";

const formClass = "w-full px-4 py-3 bg-black border border-white/10 text-white placeholder-white/40 focus:border-white/30 focus:outline-none";
const labelClass = "block text-xs uppercase tracking-widest text-white/60 mb-2";
const btnPrimary = "w-full py-3 bg-white text-black font-medium uppercase tracking-wider text-sm hover:opacity-95 transition";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [stableName, setStableName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setError("Sign up failed");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/auth/complete-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: authData.user.id,
          role,
          fullName,
          email,
          stableName: role === "owner" ? stableName : undefined,
          joinCode: role !== "owner" ? joinCode : undefined,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.inviteCode) {
          setError(
            `${result.error} ${result.inviteCode}. Save this ID and share it with your stable owner. Or go to /get-my-id after signing in to retrieve it anytime.`
          );
        } else {
          setError(result.error || "Failed to complete signup");
        }
        setLoading(false);
        return;
      }

      if (!authData.session) {
        router.push(`/confirm-email?email=${encodeURIComponent(email)}`);
        router.refresh();
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="border border-white/10 p-6 sm:p-8 md:p-10">
          <h1 className="font-serif text-2xl md:text-3xl font-normal text-white mb-2">
            Create account
          </h1>
          <p className="text-white/60 text-sm mb-8">
            Choose your role and set up your account
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
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
              {loading ? "Creating account..." : "Create account"}
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
