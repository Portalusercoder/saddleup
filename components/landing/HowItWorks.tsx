"use client";

import { useState } from "react";
import Image from "next/image";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useLanguage } from "@/components/providers/LanguageProvider";

const STEP_IMAGES = ["/horseback.jpg", "/hero-bg.png", "/hero-bg.jpg"] as const;

export default function HowItWorks() {
  const { t } = useLanguage();
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { n: "01", title: t("home.howStep1Title"), desc: t("home.howStep1Desc") },
    { n: "02", title: t("home.howStep2Title"), desc: t("home.howStep2Desc") },
    { n: "03", title: t("home.howStep3Title"), desc: t("home.howStep3Desc") },
  ];

  return (
    <section id="how-it-works" className="landing-section landing-hiw pt-12 sm:pt-16 pb-20 sm:pb-28 px-5 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <h2 className="landing-hiw-headline landing-display">
            <span className="landing-hiw-headline-muted">/</span>
            <span className="landing-hiw-headline-muted">{t("home.howItWorksHeadlineMuted")}</span>
            <span className="landing-hiw-headline-strong">{t("home.howItWorksHeadlineStrong")}</span>
          </h2>
        </ScrollReveal>

        <div className="landing-hiw-steps">
          {steps.map((step, i) => {
            const isActive = activeStep === i;
            const stepLabel = `${t("home.howItWorksStepLabel")} ${step.n}`;

            if (isActive) {
              return (
                <ScrollReveal key={step.n} delay={i * 0.04}>
                  <article className="landing-hiw-panel" aria-current="step">
                    <div className="landing-hiw-panel-media" aria-hidden>
                      <Image
                        src={STEP_IMAGES[i]}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 100vw, 1152px"
                        className="landing-hiw-panel-photo"
                      />
                      <div className="landing-hiw-panel-scrim" />
                    </div>

                    <div className="landing-hiw-panel-inner">
                      <div className="landing-hiw-panel-header">
                        <span className="landing-hiw-pill landing-hiw-pill--inverse">{stepLabel}</span>
                        <div className="landing-hiw-panel-copy">
                          <h3>{step.title}</h3>
                          <p>{step.desc}</p>
                        </div>
                      </div>
                    </div>
                  </article>
                </ScrollReveal>
              );
            }

            return (
              <ScrollReveal key={step.n} delay={i * 0.04}>
                <button
                  type="button"
                  className="landing-hiw-row"
                  onClick={() => setActiveStep(i)}
                  aria-expanded={false}
                >
                  <span className="landing-hiw-pill">{stepLabel}</span>
                  <div className="landing-hiw-row-copy">
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>
                  </div>
                </button>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
