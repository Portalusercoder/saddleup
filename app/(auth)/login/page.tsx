"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const formClass = "w-full px-4 py-3 bg-black border border-white/10 text-white placeholder-white/40 focus:border-white/30 focus:outline-none";
const labelClass = "block text-xs uppercase tracking-widest text-white/60 mb-2";
const btnPrimary = "w-full py-3 bg-white text-black font-medium uppercase tracking-wider text-sm hover:opacity-95 transition";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      router.push(redirect);
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
        <div className="border border-white/10 p-8 md:p-10">
          <h1 className="font-serif text-2xl md:text-3xl font-normal text-white mb-2">
            Sign in
          </h1>
          <p className="text-white/60 text-sm mb-8">
            Enter your credentials to access your stable
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                className={formClass}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-white/80 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`${btnPrimary} disabled:opacity-50`}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-8 text-center text-white/60 text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-white hover:underline">
              Sign up
            </Link>
          </p>
          <p className="mt-3 text-center text-white/40 text-xs">
            Join code didn&apos;t work?{" "}
            <Link href="/get-my-id" className="text-white/70 hover:text-white">
              Get your personal ID
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white/60">Loading...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
