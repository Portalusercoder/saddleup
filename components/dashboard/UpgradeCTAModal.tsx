"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useProfile } from "@/components/providers/ProfileProvider";

const TRIAL_SEEN_KEY = "saddleup_trial_cta_seen";
const UPGRADE_LAST_SHOWN_KEY = "saddleup_upgrade_cta_last_shown";
const INTERVAL_DAYS = 15;

function shouldShowUpgrade(): boolean {
  if (typeof window === "undefined") return false;
  const trialSeen = localStorage.getItem(TRIAL_SEEN_KEY);
  if (!trialSeen) return false; // show trial first, then upgrade later
  const lastShown = localStorage.getItem(UPGRADE_LAST_SHOWN_KEY);
  if (!lastShown) return true; // first time after trial
  const last = new Date(lastShown).getTime();
  const now = Date.now();
  const daysSince = (now - last) / (1000 * 60 * 60 * 24);
  return daysSince >= INTERVAL_DAYS;
}

export default function UpgradeCTAModal() {
  const { profile, loading } = useProfile();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Owners only; show every 15 days after they've seen the trial CTA once
  useEffect(() => {
    if (!mounted || typeof window === "undefined" || loading || !profile) return;
    if (profile.role !== "owner") return;
    if (shouldShowUpgrade()) setOpen(true);
  }, [mounted, loading, profile]);

  const handleClose = () => {
    localStorage.setItem(UPGRADE_LAST_SHOWN_KEY, new Date().toISOString());
    setOpen(false);
  };

  if (!open) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm cursor-pointer"
        aria-hidden
        onClick={handleClose}
      />
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-cta-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="pointer-events-auto relative w-full max-w-2xl overflow-hidden rounded-none border border-white/15 bg-black shadow-2xl cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 text-white/60 hover:text-white transition"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2 min-h-[320px] md:min-h-[380px]">
            <div className="relative aspect-square md:aspect-auto md:min-h-[380px] bg-white/5">
              <Image
                src="/hero-bg.jpg"
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
            <div className="flex flex-col justify-center p-8 md:p-10 text-white">
              <h2 id="upgrade-cta-title" className="font-serif text-2xl md:text-3xl font-normal text-white">
                Upgrade your plan
              </h2>
              <p className="mt-3 text-sm text-white/70 leading-relaxed">
                Get more horses and riders, unlock full features, and grow your stable. Upgrade when you’re ready — we’re here whenever you need more.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <a
                  href="/dashboard/settings"
                  className="w-full sm:w-auto px-6 py-3 bg-white text-black font-medium text-sm uppercase tracking-wider hover:bg-white/95 transition text-center"
                >
                  View plans
                </a>
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full sm:w-auto px-6 py-3 border border-white/25 text-white text-sm uppercase tracking-wider hover:bg-white/5 transition"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
