"use client";

import ScrollReveal from "@/components/ui/ScrollReveal";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function HowItWorks() {
  const { t } = useLanguage();

  const steps = [
    { n: "1", title: t("home.howStep1Title"), desc: t("home.howStep1Desc") },
    { n: "2", title: t("home.howStep2Title"), desc: t("home.howStep2Desc") },
    { n: "3", title: t("home.howStep3Title"), desc: t("home.howStep3Desc") },
  ];

  return (
    <section id="how-it-works" className="bg-base border-y border-black/10 py-16 sm:py-20 px-4 sm:px-6 text-black">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <h2 className="font-serif text-3xl md:text-4xl font-normal mb-12 text-center">
            {t("home.howItWorksTitle")}
          </h2>
        </ScrollReveal>
        <div className="grid md:grid-cols-3 gap-8 md:gap-10">
          {steps.map((step, i) => (
            <ScrollReveal key={step.n} delay={i * 0.08}>
              <div className="text-center md:text-start">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-accent/40 bg-accent/10 text-accent font-serif text-base font-medium leading-none tabular-nums mb-4">
                  {step.n}
                </div>
                <h3 className="font-serif text-xl text-black">{step.title}</h3>
                <p className="text-black/60 mt-2 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
