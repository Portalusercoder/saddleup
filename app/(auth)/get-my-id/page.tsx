"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function GetMyIdPage() {
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/me/invite-code")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setError(d.error);
          return;
        }
        setInviteCode(d.inviteCode);
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  const copyCode = () => {
    if (!inviteCode) return;
    navigator.clipboard.writeText(inviteCode);
  };

  return (
    <div className="min-h-screen bg-base flex text-black items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="border border-black/10 p-8 md:p-10">
          <h1 className="font-serif text-2xl md:text-3xl font-normal text-black mb-2">
            Your personal ID
          </h1>
          <p className="text-black/60 text-sm mb-6">
            Share this ID with your stable owner or trainer if the join code didn&apos;t work. They can add you manually.
          </p>

          {loading ? (
            <p className="text-black/50">Loading...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : inviteCode ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <code className="flex-1 px-4 py-3 bg-base border border-black/10 font-mono text-lg text-black">
                  {inviteCode}
                </code>
                <button
                  onClick={copyCode}
                  className="px-4 py-3 bg-accent text-white font-medium text-sm uppercase tracking-wider hover:opacity-95 transition whitespace-nowrap"
                >
                  Copy
                </button>
              </div>
              <p className="text-black/40 text-xs">
                Your owner or trainer can add you in Team Management → Add member by personal ID.
              </p>
            </div>
          ) : null}

          <div className="mt-8 pt-6 border-t border-black/10">
            <Link
              href="/dashboard"
              className="block w-full py-3 border border-black/10 text-black font-medium uppercase tracking-wider text-sm hover:border-black/30 transition text-center"
            >
              Go to dashboard
            </Link>
            <Link
              href="/"
              className="block mt-3 text-center text-black/50 hover:text-black/70 text-xs uppercase tracking-wider"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
