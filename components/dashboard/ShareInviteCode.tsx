"use client";

import { useEffect, useState } from "react";

export default function ShareInviteCode() {
  const [stable, setStable] = useState<{
    name: string;
    joinCode: string;
    role: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/stable")
      .then((res) => res.json())
      .then((data) => {
        if (data.joinCode) {
          setStable({
            name: data.name || "Your Stable",
            joinCode: data.joinCode,
            role: data.role,
          });
        }
      })
      .catch(() => {});
  }, []);

  const copyCode = () => {
    if (!stable) return;
    navigator.clipboard.writeText(stable.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!stable) return null;

  return (
    <div className="border border-white/10 p-6">
      <h2 className="font-serif text-lg text-white mb-2">Invite trainers & students</h2>
      <p className="text-white/60 text-sm mb-4">
        Share this code so trainers and students can join {stable.name}.
      </p>
      <div className="flex items-center gap-3">
        <code className="flex-1 px-4 py-3 bg-black border border-white/10 font-mono text-lg text-white">
          {stable.joinCode}
        </code>
        <button
          onClick={copyCode}
          className="px-4 py-3 bg-white text-black font-medium text-sm uppercase tracking-wider hover:opacity-95 transition whitespace-nowrap"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <p className="text-white/40 text-xs mt-3 uppercase tracking-wider">
        New users sign up at /signup and enter this code when choosing Trainer or Student. If it doesn&apos;t work, they can share their personal ID from /get-my-id and you can add them in &quot;Add member by ID&quot; below.
      </p>
    </div>
  );
}
