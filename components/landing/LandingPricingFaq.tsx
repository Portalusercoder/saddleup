"use client";

import ScrollReveal from "@/components/ui/ScrollReveal";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function LandingPricingFaq() {
  const { t } = useLanguage();

  const categories = [
    {
      title: t("home.pricingFaqCatBillingTitle"),
      description: t("home.pricingFaqCatBillingDesc"),
      items: [
        { q: t("home.pricingFaq1Q"), a: t("home.pricingFaq1A") },
        { q: t("home.pricingFaq3Q"), a: t("home.pricingFaq3A") },
      ],
    },
    {
      title: t("home.pricingFaqCatDataTitle"),
      description: t("home.pricingFaqCatDataDesc"),
      items: [{ q: t("home.pricingFaq2Q"), a: t("home.pricingFaq2A") }],
    },
    {
      title: t("home.pricingFaqCatStartTitle"),
      description: t("home.pricingFaqCatStartDesc"),
      items: [{ q: t("home.pricingFaq4Q"), a: t("home.pricingFaq4A") }],
    },
  ];

  return (
    <ScrollReveal delay={0.1} className="mt-20 sm:mt-24">
      <div className="landing-faq-header">
        <span className="landing-faq-badge">{t("home.pricingFaqBadge")}</span>
        <h2 className="landing-display landing-ink text-3xl sm:text-4xl font-semibold tracking-tight mt-5">
          {t("home.pricingFaqHeadline")}
        </h2>
        <p className="landing-ink-muted text-base sm:text-lg mt-3 max-w-2xl mx-auto leading-relaxed">
          {t("home.pricingFaqSub")}
        </p>
      </div>

      <div className="landing-faq-categories">
        {categories.map((category) => (
          <article key={category.title} className="landing-faq-category">
            <div className="landing-faq-category-aside">
              <h3 className="landing-display landing-ink text-xl sm:text-2xl font-semibold leading-snug">
                {category.title}
              </h3>
              <p className="landing-ink-muted text-sm sm:text-[0.9375rem] mt-3 leading-relaxed">
                {category.description}
              </p>
            </div>
            <div className="landing-faq-list">
              {category.items.map((item) => (
                <details key={item.q} className="landing-faq-item group">
                  <summary className="landing-faq-question">
                    <span className="landing-faq-question-text">{item.q}</span>
                    <span className="landing-faq-toggle" aria-hidden>
                      <span className="landing-faq-toggle-icon">+</span>
                    </span>
                  </summary>
                  <div className="landing-faq-answer">
                    <p>{item.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </article>
        ))}
      </div>
    </ScrollReveal>
  );
}
