"use client";

import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import LandingSectionHeader from "@/components/landing/LandingSectionHeader";
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
    <section id="features" className="landing-section">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <LandingSectionHeader
            eyebrow={t("home.featuresEyebrow")}
            title={t("home.featuresHeadline")}
            description={t("home.featuresSub")}
          />
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
                  <h3 className="landing-heading-card">{feat.title}</h3>
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
