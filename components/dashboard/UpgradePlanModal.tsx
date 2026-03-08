"use client";

import Link from "next/link";

interface UpgradePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "horses" | "riders";
}

export default function UpgradePlanModal({
  isOpen,
  onClose,
  type,
}: UpgradePlanModalProps) {
  if (!isOpen) return null;

  const message =
    type === "horses"
      ? "You've reached your horse limit. Upgrade your plan to add more horses."
      : "You've reached your rider limit. Upgrade your plan to add more riders.";

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto sm:items-center"
      onClick={onClose}
    >
      <div
        className="bg-base border border-black/10 p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-serif text-xl text-black mb-2">Plan limit reached</h2>
        <p className="text-black/70 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <Link
            href="/dashboard/settings"
            className="flex-1 px-4 py-2.5 bg-accent text-white font-medium text-sm uppercase tracking-wider text-center hover:opacity-95 transition"
          >
            Upgrade plan
          </Link>
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-black/10 text-black text-sm uppercase tracking-wider hover:border-black/30 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
