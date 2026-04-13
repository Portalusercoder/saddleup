"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function UnsubscribeClient() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const success = searchParams.get("success") === "1";
  const already = searchParams.get("already") === "1";
  const error = searchParams.get("error");

  return (
    <div className="min-h-screen bg-base text-black flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {success && (
          <>
            <h1 className="font-serif text-2xl md:text-3xl font-normal text-white mb-4">
              {t("newsletterUnsub.successTitle")}
            </h1>
            <p className="text-white/60 mb-8">
              {t("newsletterUnsub.successBody")}
            </p>
          </>
        )}
        {already && (
          <>
            <h1 className="font-serif text-2xl md:text-3xl font-normal text-white mb-4">
              {t("newsletterUnsub.alreadyTitle")}
            </h1>
            <p className="text-white/60 mb-8">
              {t("newsletterUnsub.alreadyBody")}
            </p>
          </>
        )}
        {error && (
          <>
            <h1 className="font-serif text-2xl md:text-3xl font-normal text-white mb-4">
              {t("newsletterUnsub.errorTitle")}
            </h1>
            <p className="text-white/60 mb-8">
              {t("newsletterUnsub.errorBody")}
            </p>
          </>
        )}
        {!success && !already && !error && (
          <>
            <h1 className="font-serif text-2xl md:text-3xl font-normal text-white mb-4">
              {t("newsletterUnsub.defaultTitle")}
            </h1>
            <p className="text-white/60 mb-8">
              {t("newsletterUnsub.defaultBody")}
            </p>
          </>
        )}
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-accent text-white font-medium hover:opacity-95 transition uppercase tracking-wider text-sm"
        >
          {t("newsletterUnsub.backHome")}
        </Link>
      </div>
    </div>
  );
}
