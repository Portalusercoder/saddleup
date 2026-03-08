"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function RemovedPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user ?? null));
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-base flex text-black items-center justify-center p-6">
        <div className="text-center">
          <p className="text-black/60">Loading...</p>
          <Link
            href="/login"
            className="mt-4 inline-block text-black/80 hover:text-black text-sm uppercase tracking-wider"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base flex text-black items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="border border-black/10 p-8 md:p-10 text-center">
          <div className="w-16 h-16 mx-auto mb-6 border border-black/20 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-black/80"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          </div>

          <h1 className="font-serif text-2xl md:text-3xl font-normal text-black mb-2">
            You have been removed from the team
          </h1>
          <p className="text-black/60 text-sm mb-6">
            Your stable owner or trainer has removed you from their organisation. You no longer have access to the dashboard.
          </p>

          <p className="text-black/50 text-sm mb-8">
            To rejoin, you can sign up again with a new join code, or share your personal ID with your stable owner so they can add you back.
          </p>

          <div className="space-y-4">
            <Link
              href="/get-my-id"
              className="block w-full py-3 bg-accent text-white font-medium uppercase tracking-wider text-sm hover:opacity-95 transition text-center"
            >
              Get my personal ID
            </Link>
            <Link
              href="/signup"
              className="block w-full py-3 border border-black/10 text-black font-medium uppercase tracking-wider text-sm hover:border-black/30 transition text-center"
            >
              Sign up with a new code
            </Link>
            <button
              onClick={handleSignOut}
              className="block w-full py-3 text-black/60 hover:text-black text-sm uppercase tracking-wider"
            >
              Sign out
            </button>
          </div>

          <p className="mt-8 text-center">
            <Link href="/" className="text-black/50 hover:text-black/70 text-xs uppercase tracking-wider">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
