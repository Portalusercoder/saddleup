"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import ScrollReveal from "@/components/ui/ScrollReveal";
import LandingSectionHeader from "@/components/landing/LandingSectionHeader";
import { useLanguage } from "@/components/providers/LanguageProvider";

const STEP_IMAGES = ["/horseback.jpg", "/hero-bg.png", "/hero-bg.jpg"] as const;

const liquidEase = [0.22, 1, 0.36, 1] as const;

const panelSpring = {
  type: "spring" as const,
  stiffness: 320,
  damping: 34,
  mass: 0.92,
};

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
    <section id="how-it-works" className="landing-section landing-hiw">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <LandingSectionHeader
            title={{
              slash: true,
              muted: t("home.howItWorksHeadlineMuted"),
              strong: t("home.howItWorksHeadlineStrong"),
            }}
            description={t("home.howItWorksHeadline")}
          />
        </ScrollReveal>

        <LayoutGroup>
          <div className="landing-hiw-steps">
            {steps.map((step, i) => {
              const isActive = activeStep === i;
              const stepLabel = `${t("home.howItWorksStepLabel")} ${step.n}`;

              return (
                <motion.div key={step.n} layout="position" className="landing-hiw-step">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {isActive ? (
                      <motion.article
                        key={`panel-${step.n}`}
                        layout
                        className="landing-hiw-panel"
                        aria-current="step"
                        initial={reduceMotion ? false : { opacity: 0, y: 14, scale: 0.985 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={reduceMotion ? undefined : { opacity: 0, y: -10, scale: 0.99 }}
                        transition={{
                          layout: panelSpring,
                          opacity: { duration: 0.38, ease: liquidEase },
                          y: { duration: 0.48, ease: liquidEase },
                          scale: { duration: 0.48, ease: liquidEase },
                        }}
                      >
                        <div className="landing-hiw-panel-media" aria-hidden>
                          <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                              key={STEP_IMAGES[i]}
                              className="landing-hiw-panel-media-inner"
                              initial={reduceMotion ? false : { opacity: 0, scale: 1.04 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={reduceMotion ? undefined : { opacity: 0, scale: 1.02 }}
                              transition={{ duration: 0.5, ease: liquidEase }}
                            >
                              <Image
                                src={STEP_IMAGES[i]}
                                alt=""
                                fill
                                sizes="(max-width: 768px) 100vw, 1152px"
                                className="landing-hiw-panel-photo"
                              />
                            </motion.div>
                          </AnimatePresence>
                          <div className="landing-hiw-panel-scrim" />
                        </div>

                        <motion.div
                          className="landing-hiw-panel-inner"
                          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.42, delay: 0.06, ease: liquidEase }}
                        >
                          <div className="landing-hiw-panel-header">
                            <span className="landing-hiw-pill landing-hiw-pill--inverse">{stepLabel}</span>
                            <div className="landing-hiw-panel-copy">
                              <h3 className="landing-heading-step">{step.title}</h3>
                              <p>{step.desc}</p>
                            </div>
                          </div>
                        </motion.div>
                      </motion.article>
                    ) : (
                      <motion.button
                        key={`row-${step.n}`}
                        type="button"
                        layout
                        className="landing-hiw-row"
                        onClick={() => setActiveStep(i)}
                        aria-expanded={false}
                        initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
                        transition={{
                          layout: panelSpring,
                          opacity: { duration: 0.32, ease: liquidEase },
                          y: { duration: 0.38, ease: liquidEase },
                        }}
                      >
                        <span className="landing-hiw-pill">{stepLabel}</span>
                        <div className="landing-hiw-row-copy">
                          <h3 className="landing-heading-step">{step.title}</h3>
                          <p className="landing-hiw-row-desc">{step.desc}</p>
                        </div>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </LayoutGroup>
      </div>
    </section>
  );
}
