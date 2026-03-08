"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ConfirmEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your email";

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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          <h1 className="font-serif text-2xl md:text-3xl font-normal text-black mb-2">
            Confirm your email to set up
          </h1>
          <p className="text-black/60 text-sm mb-2">
            We&apos;ve sent a confirmation link to
          </p>
          <p className="text-black font-medium mb-6 break-all">{email}</p>
          <p className="text-black/60 text-sm mb-8">
            Click the link in the email to complete your signup. You can then
            sign in and access your dashboard.
          </p>

          <div className="space-y-4">
            <p className="text-black/40 text-xs uppercase tracking-wider">
              Didn&apos;t receive the email? Check your spam folder or{" "}
              <Link href="/signup" className="text-black font-medium hover:underline">
                try again
              </Link>
            </p>
            <Link
              href="/login"
              className="block w-full py-3 bg-accent text-white font-medium uppercase tracking-wider text-sm hover:opacity-95 transition text-center"
            >
              Go to sign in
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center">
          <Link href="/" className="text-black/50 hover:text-black/70 text-xs uppercase tracking-wider">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-base flex text-black items-center justify-center">
          <p className="text-black/60">Loading...</p>
        </div>
      }
    >
      <ConfirmEmailContent />
    </Suspense>
  );
}
