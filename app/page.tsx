"use client";

import { useState } from "react";
import AuthModal from "@/components/landing/AuthModal";
import Footer from "@/components/landing/Footer";
import PartnerSpotlight from "@/components/landing/PartnerSpotlight";
import LandingFeatures from "@/components/landing/LandingFeatures";
import HowItWorks from "@/components/landing/HowItWorks";
import LandingPricing from "@/components/landing/LandingPricing";
import LandingTestimonial from "@/components/landing/LandingTestimonial";
import BlurText from "@/components/ui/BlurText";
import ScrollReveal from "@/components/ui/ScrollReveal";
import TextLogo from "@/components/brand/TextLogo";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { HORSE_NEWS_HEADLINES } from "@/lib/horseNewsHeadlines";
import { SUBSCRIPTION_PLANS } from "@/lib/constants";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useEffect } from "react";

export default function Home() {
  const { t } = useLanguage();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | undefined>();

  const openAuth = (planId?: string) => {
    setSelectedPlan(planId);
    setAuthModalOpen(true);
  };

  return (
    <main className="min-h-screen text-white">
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        planId={selectedPlan}
      />

      {/* Hero — keep visual direction */}
      <section className="relative min-h-screen w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] flex flex-col overflow-hidden -mt-20 pt-20">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat parallax-bg"
          style={{ backgroundImage: "url(/hero-bg.png)" }}
        />
        <div className="absolute inset-0 bg-black/50" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, rgba(0,0,0,0.75) 0%, transparent 45%), linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.85) 100%)",
          }}
        />
        <div className="hero-grid" />

        <div className="relative flex-1 flex flex-col justify-end pb-24 sm:pb-28 md:pb-32">
          <div className="px-5 sm:px-8 md:px-14 lg:px-20 max-w-5xl">
            <TextLogo className="mb-3 text-[0.72rem] sm:text-[0.78rem] text-[#d4a574]" />

            <div role="heading" aria-level={1} className="[&>p]:flex [&>p]:flex-col [&>p]:items-start">
              <BlurText
                text={t("home.heroLine1")}
                delay={100}
                animateBy="words"
                direction="top"
                className="font-serif text-[3.25rem] sm:text-[4.5rem] md:text-[6rem] lg:text-[7.5rem] font-extrabold tracking-tight text-white leading-[0.92] uppercase"
              />
              <BlurText
                text={t("home.heroLine2")}
                delay={150}
                animateBy="words"
                direction="top"
                className="font-serif text-[3.25rem] sm:text-[4.5rem] md:text-[6rem] lg:text-[7.5rem] font-extrabold tracking-tight text-white leading-[0.92] uppercase mt-1"
              />
            </div>

            <p className="mt-5 font-sans text-sm sm:text-base uppercase tracking-[0.18em] text-white/90 max-w-xl">
              {t("home.heroSub")}
            </p>

            <p className="mt-4 text-sm text-white/70 max-w-lg">{t("home.socialProof")}</p>

            <p className="mt-2 text-xs text-[#d4a574]/90 tracking-wide">{t("home.arabicCallout")}</p>

            <div className="mt-10 flex flex-wrap gap-10 sm:gap-14">
              <button
                type="button"
                onClick={() => openAuth()}
                className="group flex flex-col items-start text-start"
              >
                <span className="font-sans text-sm uppercase tracking-[0.25em] text-[#d4a574] group-hover:text-[#e5b685] transition flex items-center gap-2">
                  {t("home.ctaPrimary")}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7h-10v10" />
                  </svg>
                </span>
                <span className="mt-1 font-sans text-xs text-white/70">{t("home.ctaPrimarySub")}</span>
              </button>
              <a href="#how-it-works" className="group flex flex-col items-start text-start">
                <span className="font-sans text-sm uppercase tracking-[0.25em] text-[#d4a574] group-hover:text-[#e5b685] transition flex items-center gap-2">
                  {t("home.ctaSecondary")}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7h-10v10" />
                  </svg>
                </span>
                <span className="mt-1 font-sans text-xs text-white/70">{t("home.ctaSecondarySub")}</span>
              </a>
            </div>
          </div>
        </div>

        <a
          href="#features"
          aria-label={t("home.scrollFeatures")}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center text-white/40 hover:text-white/70 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </a>

        <ScrollReveal className="relative border-t border-white/10 py-5 px-8 md:px-14 lg:px-20 min-h-[6.5rem]">
          <div className="flex flex-wrap justify-between gap-x-8 gap-y-6 items-start uppercase text-[0.65rem] md:text-[0.7rem] tracking-[0.25em] text-white/80 font-sans">
            <div className="shrink-0">
              <p className="text-white/50">{t("home.statEstablished")}</p>
              <div className="mt-1 h-[3.75rem] md:h-[4rem] flex items-start overflow-hidden">
                <p className="text-white/90 font-normal leading-snug line-clamp-3">2024</p>
              </div>
            </div>
            <div className="shrink-0 w-[min(100%,18rem)] sm:w-[16rem] md:w-[18rem]">
              <p className="text-white/50">{t("home.statPlan")}</p>
              <div className="mt-1 h-[3.75rem] md:h-[4rem] flex items-start overflow-hidden">
                <HeroRotatingPlan />
              </div>
            </div>
            <div className="shrink-0 max-w-[11rem] sm:max-w-none">
              <p className="text-white/50">{t("home.statBuiltFor")}</p>
              <div className="mt-1 h-[3.75rem] md:h-[4rem] flex items-start overflow-hidden">
                <p className="text-white/90 font-normal leading-snug line-clamp-3">{t("home.statBuiltForValue")}</p>
              </div>
            </div>
            <div className="min-w-0 w-full sm:w-[min(100%,18rem)] md:w-[min(100%,22rem)] shrink-0 basis-full sm:basis-auto">
              <p className="text-white/50">{t("home.statNews")}</p>
              <div className="mt-1 h-[3.75rem] md:h-[4rem] w-full flex items-start overflow-hidden">
                <HeroRotatingHorseNews />
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <HowItWorks />
      <LandingFeatures />
      <LandingPricing onSelectPlan={openAuth} />
      <PartnerSpotlight />
      <LandingTestimonial onStartFree={() => openAuth()} />

      <ScrollReveal>
        <Footer onGetStarted={() => openAuth()} />
      </ScrollReveal>

      <div className="fixed bottom-6 end-6 z-50">
        <ThemeToggle variant="dark" />
      </div>
    </main>
  );
}

function HeroRotatingHorseNews() {
  const [headlines, setHeadlines] = useState<string[]>(() => [...HORSE_NEWS_HEADLINES]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/news/horse-headlines");
        if (!res.ok) return;
        const data = (await res.json()) as { headlines?: unknown };
        if (cancelled || !Array.isArray(data.headlines) || data.headlines.length === 0) return;
        const next = data.headlines.filter((h): h is string => typeof h === "string" && h.length > 0);
        if (next.length > 0) {
          setHeadlines(next);
          setIndex(0);
        }
      } catch {
        /* keep bundled fallback */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (headlines.length === 0) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % headlines.length), 5000);
    return () => window.clearInterval(id);
  }, [headlines]);

  const line = headlines[index] ?? "";

  return (
    <p
      className="text-white/90 font-normal normal-case tracking-normal text-[0.65rem] md:text-[0.7rem] leading-snug line-clamp-3 overflow-hidden w-full"
      title={line}
      aria-live="polite"
      aria-atomic="true"
    >
      {line}
    </p>
  );
}

function HeroRotatingPlan() {
  const { t } = useLanguage();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % SUBSCRIPTION_PLANS.length), 5000);
    return () => window.clearInterval(id);
  }, []);

  const plan = SUBSCRIPTION_PLANS[index];
  if (!plan) return null;

  const name = t(`pricing.${plan.id}.name`);
  const line =
    plan.price === null
      ? `${name} · ${t("home.planHeroUnlimited")}`
      : plan.price === 0
        ? `${name} · ${t("home.planHeroFree", { horses: String(plan.horses), riders: String(plan.riders) })}`
        : `${name} · ${t("home.planHeroPaid", { horses: String(plan.horses), riders: String(plan.riders) })}`;

  return (
    <p
      className="w-full text-white/90 font-normal normal-case tracking-normal text-[0.65rem] md:text-[0.7rem] leading-snug line-clamp-3 overflow-hidden"
      title={line}
      aria-live="polite"
      aria-atomic="true"
    >
      {line}
    </p>
  );
}
