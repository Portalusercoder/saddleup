"use client";

import ScrollReveal from "@/components/ui/ScrollReveal";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function HowItWorks() {
  const { t } = useLanguage();

  const steps = [
    { n: "01", title: t("home.howStep1Title"), desc: t("home.howStep1Desc") },
    { n: "02", title: t("home.howStep2Title"), desc: t("home.howStep2Desc") },
    { n: "03", title: t("home.howStep3Title"), desc: t("home.howStep3Desc") },
  ];

  return (
    <section id="how-it-works" className="relative -mt-6 sm:-mt-10 pt-12 sm:pt-16 pb-20 sm:pb-32 px-5 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
          <p className="landing-section-label">{t("home.howItWorksTitle")}</p>
          <h2 className="landing-display mt-3 text-[1.75rem] sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#1d1d1f]">
            {t("home.howItWorksHeadline")}
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {steps.map((step, i) => (
            <ScrollReveal
              key={step.n}
              delay={i * 0.08}
              className={i === 2 ? "sm:col-span-2 lg:col-span-1 sm:max-w-md sm:mx-auto lg:max-w-none lg:mx-0 w-full" : ""}
            >
              <div className="landing-card p-6 sm:p-8 h-full">
                <span className="text-xs font-semibold text-accent/70 tracking-widest">{step.n}</span>
                <h3 className="landing-display mt-4 text-xl font-semibold text-[#1d1d1f]">{step.title}</h3>
                <p className="mt-3 text-[#1d1d1f]/55 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
