"use client";

import ScrollReveal from "@/components/ui/ScrollReveal";
import { useLanguage } from "@/components/providers/LanguageProvider";

function IconHorse() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M4 20c2-4 5-6 8-6s6 2 8 6" strokeLinecap="round" />
      <path d="M8 14c1-3 3-5 6-5 2 0 4 1 5 3" strokeLinecap="round" />
      <circle cx="17" cy="8" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconSession() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
      <path d="M8 14h2v2H8z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconAlert() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 3L2 20h20L12 3z" strokeLinejoin="round" />
      <path d="M12 10v4M12 17h.01" strokeLinecap="round" />
    </svg>
  );
}

function IconRider() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="12" cy="7" r="3" />
      <path d="M6 20v-1a4 4 0 014-4h4a4 4 0 014 4v1" strokeLinecap="round" />
    </svg>
  );
}

function IconHealth() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
      <rect x="4" y="4" width="16" height="16" rx="3" />
    </svg>
  );
}

function IconSchedule() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ICONS = [IconHorse, IconSession, IconAlert, IconRider, IconHealth, IconSchedule];

export default function LandingFeatures() {
  const { t } = useLanguage();

  const features = [
    { title: t("home.feat1Title"), desc: t("home.feat1Desc") },
    { title: t("home.feat2Title"), desc: t("home.feat2Desc") },
    { title: t("home.feat3Title"), desc: t("home.feat3Desc") },
    { title: t("home.feat4Title"), desc: t("home.feat4Desc") },
    { title: t("home.feat5Title"), desc: t("home.feat5Desc") },
    { title: t("home.feat6Title"), desc: t("home.feat6Desc") },
  ];

  const [lead, ...rest] = features;

  return (
    <section id="features" className="bg-base text-black py-12 sm:py-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <h2 className="font-serif text-3xl md:text-4xl font-normal mb-12">{t("home.featuresTitle")}</h2>
        </ScrollReveal>

        <ScrollReveal delay={0.05}>
          <div className="border border-black/10 p-8 md:p-10 mb-8 hover:border-black/20 transition">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="shrink-0 text-accent">
                <IconHorse />
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-2xl text-black">{lead.title}</h3>
                <p className="text-black/60 mt-3 leading-relaxed max-w-2xl">{lead.desc}</p>
              </div>
              <div className="hidden lg:block w-40 h-28 border border-dashed border-black/15 bg-black/[0.02] rounded-sm shrink-0" aria-hidden />
            </div>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-6">
          {rest.map((feat, i) => {
            const Icon = ICONS[i + 1];
            return (
              <ScrollReveal key={feat.title} delay={0.08 + i * 0.05}>
                <div
                  className={`border border-black/10 p-6 h-full hover:border-black/20 transition ${
                    i === rest.length - 1 && rest.length % 2 !== 0 ? "md:col-span-2 md:max-w-lg md:justify-self-center md:w-full" : ""
                  }`}
                >
                  <div className="text-accent mb-4">
                    <Icon />
                  </div>
                  <h3 className="font-serif text-lg text-black">{feat.title}</h3>
                  <p className="text-black/60 text-sm mt-2 leading-relaxed">{feat.desc}</p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
