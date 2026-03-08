"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ReactivatePage() {
  const router = useRouter();
  const [deletionAt, setDeletionAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reactivating, setReactivating] = useState(false);

  useEffect(() => {
    fetch("/api/stable")
      .then((r) => r.json())
      .then((d) => {
        setDeletionAt(d.scheduledDeletionAt ?? null);
      })
      .catch(() => setDeletionAt(null))
      .finally(() => setLoading(false));
  }, []);

  const handleReactivate = async () => {
    setReactivating(true);
    try {
      const res = await fetch("/api/account/reactivate", { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      router.push("/dashboard");
      router.refresh();
    } catch {
      setReactivating(false);
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-black/50">Loading...</p>
      </div>
    );
  }

  if (!deletionAt) {
    router.replace("/dashboard");
    return null;
  }

  const date = new Date(deletionAt);
  const formatted = date.toLocaleDateString(undefined, { dateStyle: "long" });

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="border border-black/10 p-8 text-center">
        <h1 className="font-serif text-2xl md:text-3xl font-normal text-black mb-4">
          Account scheduled for deletion
        </h1>
        <p className="text-black/70 text-sm mb-6">
          Your stable and data are scheduled to be permanently deleted on <strong>{formatted}</strong>. Until then, you can reactivate and keep everything.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={handleReactivate}
            disabled={reactivating}
            className="px-6 py-3 bg-accent text-white font-medium text-sm uppercase tracking-wider hover:opacity-95 transition disabled:opacity-50"
          >
            {reactivating ? "Reactivating..." : "Reactivate account"}
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="px-6 py-3 border border-black/20 text-black/80 text-sm uppercase tracking-wider hover:bg-black/5 transition"
          >
            No, sign me out
          </button>
        </div>
      </div>
    </div>
  );
}
