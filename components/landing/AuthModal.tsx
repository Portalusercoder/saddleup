"use client";

import Link from "next/link";
import TextLogo from "@/components/brand/TextLogo";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId?: string;
}

export default function AuthModal({ isOpen, onClose, planId }: AuthModalProps) {
  const { t } = useLanguage();
  if (!isOpen) return null;

  const signupUrl = planId ? `/signup?plan=${planId}` : "/signup";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto sm:items-center"
      onClick={onClose}
    >
      <div
        className="bg-[#151a17] border border-white/10 rounded-control p-6 sm:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto my-auto text-[#e8ebe6]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <TextLogo className="text-[0.65rem] text-white/80 mb-4" />
            <h2 className="font-serif text-xl text-[#e8ebe6]">{t("authModal.title")}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white p-1 -m-1 rounded-control"
            aria-label={t("common.close")}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-white/50 text-sm mb-6">
          {planId ? t("authModal.withPlan") : t("authModal.default")}
        </p>

        <div className="space-y-3">
          <Link
            href={signupUrl}
            className="block w-full py-3 px-4 bg-accent text-white font-medium text-center text-sm uppercase tracking-wider hover:opacity-95 transition rounded-control"
          >
            {t("authModal.signUp")}
          </Link>
          <Link
            href="/login"
            className="block w-full py-3 px-4 border border-white/15 text-[#e8ebe6] font-medium text-center text-sm uppercase tracking-wider hover:border-white/30 transition rounded-control"
          >
            {t("authModal.signIn")}
          </Link>
        </div>

        <p className="text-white/35 text-xs mt-6 text-center uppercase tracking-wider">
          {t("authModal.footnote")}
        </p>
      </div>
    </div>
  );
}
