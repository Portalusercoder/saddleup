"use client";

import Link from "next/link";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId?: string;
}

export default function AuthModal({ isOpen, onClose, planId }: AuthModalProps) {
  if (!isOpen) return null;

  const signupUrl = planId ? `/signup?plan=${planId}` : "/signup";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 overflow-y-auto sm:items-center"
      onClick={onClose}
    >
      <div
        className="bg-base border border-black/10 p-6 sm:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <h2 className="font-serif text-xl text-black">Get started with Saddle Up</h2>
          <button
            onClick={onClose}
            className="text-black/60 hover:text-black p-1 -m-1"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-black/60 text-sm mb-6">
          {planId
            ? "Create an account or sign in to subscribe to this plan."
            : "Create an account or sign in to get started."}
        </p>

        <div className="space-y-3">
          <Link
            href={signupUrl}
            className="block w-full py-3 px-4 bg-accent text-white font-medium text-center text-sm uppercase tracking-wider hover:opacity-95 transition"
          >
            Sign up
          </Link>
          <Link
            href="/login"
            className="block w-full py-3 px-4 border border-black/10 text-black font-medium text-center text-sm uppercase tracking-wider hover:border-black/30 transition"
          >
            Sign in
          </Link>
        </div>

        <p className="text-black/40 text-xs mt-6 text-center uppercase tracking-wider">
          Free plan includes 2 horses and 10 riders. Upgrade anytime.
        </p>
      </div>
    </div>
  );
}
