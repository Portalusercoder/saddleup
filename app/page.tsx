"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SUBSCRIPTION_PLANS } from "@/lib/constants";
import AuthModal from "@/components/landing/AuthModal";
import PixelCard from "@/components/ui/PixelCard";
import BlurText from "@/components/ui/BlurText";
import Footer from "@/components/landing/Footer";
import ScrollReveal from "@/components/ui/ScrollReveal";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { HORSE_NEWS_HEADLINES } from "@/lib/horseNewsHeadlines";
import PartnerSpotlight from "@/components/landing/PartnerSpotlight";
import TextLogo from "@/components/brand/TextLogo";
import { useLanguage } from "@/components/providers/LanguageProvider";

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

      {/* Hero - extends under nav so transparent nav shows hero, not body bg */}
      <section className="relative min-h-screen w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] flex flex-col overflow-hidden -mt-20 pt-20">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat parallax-bg"
          style={{ backgroundImage: "url(/hero-bg.png)" }}
        />
        {/* Dark overlay + gradient (left/bottom) - FASTRACK-style */}
        <div className="absolute inset-0 bg-black/50" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to right, rgba(0,0,0,0.75) 0%, transparent 45%), linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.85) 100%)",
          }}
        />
        <div className="hero-grid" />

        {/* Main content - left aligned */}
        <div className="relative flex-1 flex flex-col justify-end pb-24 sm:pb-28 md:pb-32">
          <div className="px-5 sm:px-8 md:px-14 lg:px-20 max-w-5xl">
            {/* Brand text above headline - FASTRACK style */}
            <TextLogo className="mb-3 text-[0.72rem] sm:text-[0.78rem] text-[#d4a574]" />

            {/* Main headline - Playfair Display (previous fonts) */}
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

            {/* Sub-headline - Inter */}
            <p className="mt-5 font-sans text-sm sm:text-base uppercase tracking-[0.18em] text-white/90 max-w-xl">
              {t("home.heroSub")}
            </p>

            {/* Two CTAs at bottom - FASTRACK style */}
            <div className="mt-12 flex flex-wrap gap-10 sm:gap-14">
              <button
                onClick={() => openAuth()}
                className="group flex flex-col items-start text-left"
              >
                <span className="font-sans text-sm uppercase tracking-[0.25em] text-[#d4a574] group-hover:text-[#e5b685] transition flex items-center gap-2">
                  {t("home.ctaRace")}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7h-10v10" />
                  </svg>
                </span>
                <span className="mt-1 font-sans text-xs text-white/70">{t("home.ctaRaceSub")}</span>
              </button>
              <a
                href="#features"
                className="group flex flex-col items-start text-left"
              >
                <span className="font-sans text-sm uppercase tracking-[0.25em] text-[#d4a574] group-hover:text-[#e5b685] transition flex items-center gap-2">
                  {t("home.ctaReady")}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7h-10v10" />
                  </svg>
                </span>
                <span className="mt-1 font-sans text-xs text-white/70">{t("home.ctaReadySub")}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <a
          href="#features"
          aria-label={t("home.scrollFeatures")}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center text-white/40 hover:text-white/70 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </a>

        {/* Footer stats bar — fixed value heights so news length doesn’t resize the hero */}
        <ScrollReveal className="relative border-t border-white/10 py-5 px-8 md:px-14 lg:px-20 min-h-[6.5rem]">
          <div className="flex flex-wrap justify-between gap-x-8 gap-y-6 items-start uppercase text-[0.65rem] md:text-[0.7rem] tracking-[0.25em] text-white/80 font-sans">
            <div className="shrink-0">
              <p className="text-white/50">{t("home.statEstablished")}</p>
              <div className="mt-1 h-[3.75rem] md:h-[4rem] flex items-start overflow-hidden">
                <p className="text-white/90 font-normal leading-snug line-clamp-3">
                  2024
                </p>
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
                <p className="text-white/90 font-normal leading-snug line-clamp-3">
                  {t("home.statBuiltForValue")}
                </p>
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

      {/* Features */}
      <section
        id="features"
        className="bg-base text-black py-12 sm:py-20 px-4 sm:px-6"
      >
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <h2 className="font-serif text-3xl md:text-4xl font-normal mb-12">
              {t("home.featuresTitle")}
            </h2>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ScrollReveal delay={0.05}>
              <FeatureCard
                title={t("home.feat1Title")}
                description={t("home.feat1Desc")}
              />
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <FeatureCard
                title={t("home.feat2Title")}
                description={t("home.feat2Desc")}
              />
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <FeatureCard
                title={t("home.feat3Title")}
                description={t("home.feat3Desc")}
              />
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <FeatureCard
                title={t("home.feat4Title")}
                description={t("home.feat4Desc")}
              />
            </ScrollReveal>
            <ScrollReveal delay={0.25}>
              <FeatureCard
                title={t("home.feat5Title")}
                description={t("home.feat5Desc")}
              />
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <FeatureCard
                title={t("home.feat6Title")}
                description={t("home.feat6Desc")}
              />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* About */}
      <section
        id="about"
        className="bg-base border-y border-black/10 py-20 px-6 text-black"
      >
        <ScrollReveal className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-normal mb-6">
            {t("home.aboutTitle")}
          </h2>
          <p className="text-black/60 text-lg leading-relaxed">
            {t("home.aboutBody")}
          </p>
        </ScrollReveal>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        className="bg-base text-black py-12 sm:py-20 px-4 sm:px-6"
      >
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <h2 className="font-serif text-3xl md:text-4xl font-normal mb-4">
              {t("home.pricingTitle")}
            </h2>
            <p className="text-black/60 mb-12 max-w-xl">
              {t("home.pricingSub")}
            </p>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {SUBSCRIPTION_PLANS.map((plan, i) => (
                <ScrollReveal key={plan.id} delay={i * 0.08}>
                <PixelCard
                  key={plan.id}
                  variant="white"
                  className={`flex flex-col ${
                    plan.id === "starter" ? "border-black/30" : ""
                  }`}
                >
                  <div className="absolute inset-0 p-6 flex flex-col z-10">
                    <h3 className="font-serif text-lg text-black uppercase tracking-wider">
                      {t(`pricing.${plan.id}.name`)}
                    </h3>
                    <div className="mt-2">
                      {plan.price === 0 ? (
                        <span className="text-2xl font-bold">{t("home.priceFree")}</span>
                      ) : plan.price === null ? (
                        <span className="text-xl font-semibold">{t("home.priceContact")}</span>
                      ) : (
                        <>
                          <span className="text-2xl font-bold text-black">${plan.price}</span>
                          <span className="text-black/60 text-sm">{t("home.pricePerMo")}</span>
                        </>
                      )}
                    </div>
                    <ul className="mt-4 space-y-2 flex-1">
                      {(plan.id === "free"
                        ? (["f0", "f1", "f2"] as const)
                        : plan.id === "starter"
                          ? (["f0", "f1", "f2", "f3"] as const)
                          : plan.id === "stable"
                            ? (["f0", "f1", "f2", "f3", "f4"] as const)
                            : (["f0", "f1", "f2"] as const)
                      ).map((fk) => (
                        <li
                          key={fk}
                          className="text-sm text-black/60 flex items-center gap-2"
                        >
                          <span className="text-black/60">✓</span>
                          {t(`pricing.${plan.id}.${fk}`)}
                        </li>
                      ))}
                    </ul>
                    {plan.id === "enterprise" ? (
                      <Link
                        href="/contact?type=enterprise"
                        className="mt-6 w-full py-2.5 font-medium transition uppercase tracking-wider text-sm border border-black/20 hover:bg-black/5 text-black block text-center"
                      >
                        {t("home.contactSales")}
                      </Link>
                    ) : (
                      <button
                        onClick={() =>
                          openAuth(plan.id === "free" ? undefined : plan.id)
                        }
                        className={`mt-6 w-full py-2.5 font-medium transition uppercase tracking-wider text-sm ${
                          plan.id === "starter"
                            ? "bg-accent text-white hover:opacity-95"
                            : plan.id === "free"
                              ? "bg-black/10 hover:bg-black/15 border border-black/20 text-black"
                              : "border border-black/20 hover:bg-black/5 text-black"
                        }`}
                      >
                        {plan.id === "free"
                          ? t("home.getStartedFree")
                          : t("home.getStarted")}
                      </button>
                    )}
                  </div>
                </PixelCard>
                </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <PartnerSpotlight />

      <ScrollReveal>
        <Footer onGetStarted={() => openAuth()} />
      </ScrollReveal>

      {/* Theme toggle — fixed bottom-right */}
      <div className="fixed bottom-6 right-6 z-50">
        <ThemeToggle variant="dark" />
      </div>
    </main>
  );
}

function HeroRotatingHorseNews() {
  const [headlines, setHeadlines] = useState<string[]>(() => [
    ...HORSE_NEWS_HEADLINES,
  ]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/news/horse-headlines");
        if (!res.ok) return;
        const data = (await res.json()) as { headlines?: unknown };
        if (
          cancelled ||
          !Array.isArray(data.headlines) ||
          data.headlines.length === 0
        )
          return;
        const next = data.headlines.filter(
          (h): h is string => typeof h === "string" && h.length > 0
        );
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
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % headlines.length);
    }, 5000);
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
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SUBSCRIPTION_PLANS.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, []);

  const plan = SUBSCRIPTION_PLANS[index];
  if (!plan) return null;

  const name = t(`pricing.${plan.id}.name`);
  const line =
    plan.price === null
      ? `${name} · ${t("home.planHeroUnlimited")}`
      : plan.price === 0
        ? `${name} · ${t("home.planHeroFree", {
            horses: String(plan.horses),
            riders: String(plan.riders),
          })}`
        : `${name} · ${t("home.planHeroPaid", {
            horses: String(plan.horses),
            riders: String(plan.riders),
          })}`;

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

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border border-black/10 p-6 hover:border-black/20 transition">
      <h3 className="font-serif text-lg text-black uppercase tracking-wider">
        {title}
      </h3>
      <p className="text-black/60 text-sm mt-2 leading-relaxed">{description}</p>
    </div>
  );
}
