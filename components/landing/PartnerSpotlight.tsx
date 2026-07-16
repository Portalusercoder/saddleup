"use client";

import { useEffect, useState } from "react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useLanguage } from "@/components/providers/LanguageProvider";

type PartnerPayload = {
  slug: string;
  name: string;
  active: boolean;
  destinationUrl?: string;
  promoCode?: string | null;
  ctaText?: string;
};

export default function PartnerSpotlight() {
  const { t } = useLanguage();
  const [partner, setPartner] = useState<PartnerPayload | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/partners/ouma", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as PartnerPayload;
        if (!cancelled && data.active) {
          setPartner(data);
        }
      } catch {
        /* keep section hidden on failure */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!partner?.active || !partner.destinationUrl) return null;

  return (
    <section className="landing-section">
      <ScrollReveal className="max-w-4xl mx-auto">
        <div className="relative overflow-hidden rounded-control">
          <div
            className="relative p-8 sm:p-10 bg-cover bg-center"
            style={{
              backgroundImage:
                "linear-gradient(160deg, rgba(14,21,18,0.9) 0%, rgba(14,21,18,0.82) 100%), url('/horseback.jpg')",
            }}
          >
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/45">
              {t("home.partnerSpotlightLabel")}
            </p>
            <h3 className="landing-display mt-3 text-2xl sm:text-3xl font-medium text-white font-serif text-balance">
              {partner.name}
            </h3>
            <p className="text-white/65 mt-3 max-w-xl leading-relaxed">
              {t("home.partnerSpotlightDesc")}
            </p>
            {partner.promoCode ? (
              <p className="mt-4 text-sm text-white/80">
                {t("home.partnerPromoPrefix")}{" "}
                <span className="font-medium text-brass">{partner.promoCode}</span>{" "}
                {t("home.partnerPromoSuffix")}
              </p>
            ) : null}
            <a
              href={partner.destinationUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="su-btn-primary su-focus-ring mt-8 !bg-mist !text-forest inline-flex"
            >
              {partner.ctaText || t("home.partnerCtaDefault")}
            </a>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
