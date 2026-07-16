"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { trackEvent } from "@/lib/analytics/mixpanel-client";
import { useLanguage } from "@/components/providers/LanguageProvider";
import AuthShell, {
  authBtnPrimary,
  authFormClass,
  authLabelClass,
} from "@/components/landing/AuthShell";
import { safeInternalPath } from "@/lib/security/safe-redirect";

function LoginLoading() {
  const { t } = useLanguage();
  return <LoadingScreen fullPage message={t("common.loading")} />;
}

function LoginForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = safeInternalPath(searchParams.get("redirect"), "/dashboard");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    router.prefetch(redirect);
  }, [router, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    trackEvent("login_attempted", { has_redirect: Boolean(redirect) });

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        trackEvent("login_failed");
        setError(error.message);
        setLoading(false);
        return;
      }
      trackEvent("login_succeeded");
      window.location.assign(redirect);
      return;
    } catch {
      setError(t("auth.login.errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <h1 className="font-serif text-2xl md:text-3xl font-medium text-[#e8ece7] mb-2">
        {t("auth.login.title")}
      </h1>
      <p className="text-white/50 text-sm mb-8">{t("auth.login.subtitle")}</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className={authLabelClass}>
            {t("common.email")}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={authFormClass}
            placeholder={t("common.placeholderEmail")}
          />
        </div>

        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <label htmlFor="password" className="block text-xs uppercase tracking-widest text-white/50">
              {t("common.password")}
            </label>
            <Link
              href="/forgot-password"
              className="text-xs uppercase tracking-wider text-white/50 hover:text-white/80 font-medium shrink-0"
            >
              {t("auth.login.forgotPassword")}
            </Link>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={authFormClass}
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button type="submit" disabled={loading} className={`${authBtnPrimary} disabled:opacity-50`}>
          {loading ? t("auth.login.signingIn") : t("auth.login.submit")}
        </button>
      </form>

      <p className="mt-8 text-center text-white/50 text-sm">
        {t("auth.login.noAccount")}{" "}
        <Link href="/signup" className="text-[#0e1512] font-medium hover:underline">
          {t("auth.login.signUpLink")}
        </Link>
      </p>
      <p className="mt-3 text-center text-white/40 text-xs">
        {t("auth.login.joinCodeDidntWork")}{" "}
        <Link href="/get-my-id" className="text-white/60 hover:text-white/80 font-medium">
          {t("auth.login.getPersonalId")}
        </Link>
      </p>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
}
