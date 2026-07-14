"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useLanguage } from "@/components/providers/LanguageProvider";

const STEP_IMAGES = ["/horseback.jpg", "/hero-bg.jpg", "/hero-bg.png"] as const;

export default function HowItWorks() {
  const { t } = useLanguage();
  const [activeStep, setActiveStep] = useState(0);
  const reduceMotion = useReducedMotion();

  const steps = [
    { n: "01", title: t("home.howStep1Title"), desc: t("home.howStep1Desc") },
    { n: "02", title: t("home.howStep2Title"), desc: t("home.howStep2Desc") },
    { n: "03", title: t("home.howStep3Title"), desc: t("home.howStep3Desc") },
  ];

  return (
    <section id="how-it-works" className="landing-section landing-hiw-v2">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <header className="landing-section-header landing-section-header--start mb-10 sm:mb-14">
            <p className="landing-section-eyebrow">{t("home.howItWorksTitle")}</p>
            <h2 className="landing-section-title landing-display">
              <span className="landing-section-title-strong">
                {t("home.howItWorksHeadline")}
              </span>
            </h2>
          </header>
        </ScrollReveal>

        <div className="landing-hiw-v2-grid">
          <div className="landing-hiw-v2-steps" role="tablist" aria-label={t("home.howItWorksTitle")}>
            {steps.map((step, i) => {
              const active = activeStep === i;
              return (
                <button
                  key={step.n}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={`landing-hiw-v2-step su-focus-ring ${active ? "is-active" : ""}`}
                  onClick={() => setActiveStep(i)}
                >
                  <span className="landing-hiw-v2-num" aria-hidden>
                    {step.n}
                  </span>
                  <span className="landing-hiw-v2-copy">
                    <span className="landing-hiw-v2-title">{step.title}</span>
                    <span className="landing-hiw-v2-desc">{step.desc}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="landing-hiw-v2-media" aria-hidden>
            <motion.div
              key={STEP_IMAGES[activeStep]}
              className="landing-hiw-v2-media-inner"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src={STEP_IMAGES[activeStep]}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover object-center"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
