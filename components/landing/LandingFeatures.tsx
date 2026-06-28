"use client";

import ScrollReveal from "@/components/ui/ScrollReveal";
import { useLanguage } from "@/components/providers/LanguageProvider";

function IconBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-10 w-10 rounded-xl bg-accent/[0.08] flex items-center justify-center text-accent mb-5">
      {children}
    </div>
  );
}

function IconHorse() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M4 20c2-4 5-6 8-6s6 2 8 6" strokeLinecap="round" />
      <path d="M8 14c1-3 3-5 6-5 2 0 4 1 5 3" strokeLinecap="round" />
      <circle cx="17" cy="8" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconSession() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
    </svg>
  );
}

function IconAlert() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 3L2 20h20L12 3z" strokeLinejoin="round" />
      <path d="M12 10v4M12 17h.01" strokeLinecap="round" />
    </svg>
  );
}

function IconRider() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="12" cy="7" r="3" />
      <path d="M6 20v-1a4 4 0 014-4h4a4 4 0 014 4v1" strokeLinecap="round" />
    </svg>
  );
}

function IconHealth() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M12 8v8M8 12h8" strokeLinecap="round" />
    </svg>
  );
}

function IconSchedule() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ICONS = [IconHorse, IconSession, IconAlert, IconRider, IconHealth, IconSchedule];

export default function LandingFeatures() {
  const { t } = useLanguage();

  const features = [
    { title: t("home.feat1Title"), desc: t("home.feat1Desc"), span: "md:col-span-2 md:row-span-2" },
    { title: t("home.feat2Title"), desc: t("home.feat2Desc"), span: "" },
    { title: t("home.feat3Title"), desc: t("home.feat3Desc"), span: "" },
    { title: t("home.feat4Title"), desc: t("home.feat4Desc"), span: "" },
    { title: t("home.feat5Title"), desc: t("home.feat5Desc"), span: "" },
    { title: t("home.feat6Title"), desc: t("home.feat6Desc"), span: "" },
  ];

  return (
    <section id="features" className="py-24 sm:py-32 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal className="max-w-2xl mb-16">
          <p className="landing-section-label">{t("home.featuresTitle")}</p>
          <h2 className="landing-display mt-3 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#1d1d1f]">
            {t("home.featuresHeadline")}
          </h2>
          <p className="mt-4 text-[#1d1d1f]/55 text-lg leading-relaxed">{t("home.featuresSub")}</p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-fr">
          {features.map((feat, i) => {
            const Icon = ICONS[i];
            return (
              <ScrollReveal key={feat.title} delay={0.05 + i * 0.05} className={feat.span}>
                <div
                  className={`landing-card p-7 sm:p-8 h-full flex flex-col ${
                    i === 0 ? "min-h-[280px] md:min-h-full bg-gradient-to-br from-white to-[#faf8f5]" : ""
                  }`}
                >
                  <IconBox>
                    <Icon />
                  </IconBox>
                  <h3 className="landing-display text-lg sm:text-xl font-semibold text-[#1d1d1f]">{feat.title}</h3>
                  <p className="mt-2 text-sm text-[#1d1d1f]/55 leading-relaxed flex-1">{feat.desc}</p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
