"use client";

import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { FEATURE_ILLUSTRATIONS } from "@/components/landing/LandingFeatureIllustrations";

export default function LandingFeatures() {
  const { t } = useLanguage();

  const features = [
    { title: t("home.feat1Title"), desc: t("home.feat1Desc"), badge: t("home.featuresFreeBadge") },
    { title: t("home.feat2Title"), desc: t("home.feat2Desc") },
    { title: t("home.feat3Title"), desc: t("home.feat3Desc") },
    { title: t("home.feat4Title"), desc: t("home.feat4Desc") },
    { title: t("home.feat5Title"), desc: t("home.feat5Desc") },
    { title: t("home.feat6Title"), desc: t("home.feat6Desc") },
  ];

  return (
    <section id="features" className="landing-section py-20 sm:py-28 px-5 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal className="mb-10 sm:mb-12">
          <p className="landing-benefits-eyebrow">{t("home.featuresEyebrow")}</p>
          <h2 className="landing-display landing-ink mt-4 text-3xl sm:text-4xl md:text-[2.75rem] font-semibold tracking-tight max-w-3xl">
            {t("home.featuresHeadline")}
          </h2>
          <p className="mt-4 landing-ink-muted text-base sm:text-lg leading-relaxed max-w-2xl">
            {t("home.featuresSub")}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.06}>
          <div className="landing-benefits-grid">
            {features.map((feat, i) => {
              const Illustration = FEATURE_ILLUSTRATIONS[i];
              return (
                <article key={feat.title} className="landing-benefits-cell">
                  {feat.badge ? (
                    <span className="landing-benefits-badge">{feat.badge}</span>
                  ) : null}
                  <h3 className="landing-display landing-ink text-lg sm:text-xl font-semibold leading-snug pr-2">
                    {feat.title}
                  </h3>
                  <p className="mt-3 text-sm sm:text-[0.9375rem] landing-ink-muted leading-relaxed max-w-md">
                    {feat.desc}
                  </p>
                  <div className="landing-benefits-visual mt-auto pt-8 sm:pt-10">
                    <Illustration />
                  </div>
                </article>
              );
            })}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.12} className="mt-10 sm:mt-12">
          <Link href="#pricing" className="landing-benefits-cta">
            {t("home.featuresCta")}
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
