"use client";

import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import LandingSectionHeader from "@/components/landing/LandingSectionHeader";
import { useLanguage } from "@/components/providers/LanguageProvider";

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

  const [featured, ...rest] = features;

  return (
    <section id="features" className="landing-section landing-features-v2">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal className="max-w-2xl">
          <LandingSectionHeader
            eyebrow={t("home.featuresTitle")}
            title={t("home.featuresHeadline")}
            description={t("home.featuresSub")}
          />
        </ScrollReveal>

        <ScrollReveal delay={0.06}>
          <article className="landing-feature-spotlight">
            {featured.badge ? (
              <p className="landing-feature-lead-badge">{featured.badge}</p>
            ) : null}
            <h3 className="landing-feature-spotlight-title">{featured.title}</h3>
            <p className="landing-feature-spotlight-desc">{featured.desc}</p>
          </article>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <ol className="landing-feature-rail">
            {rest.map((feat, i) => (
              <li key={feat.title} className="landing-feature-rail-item">
                <span className="landing-feature-rail-num" aria-hidden>
                  {String(i + 2).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="landing-feature-rail-title">{feat.title}</h3>
                  <p className="landing-feature-rail-desc">{feat.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </ScrollReveal>

        <ScrollReveal delay={0.12} className="mt-12">
          <Link href="#pricing" className="landing-benefits-cta">
            {t("home.featuresCta")}
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
