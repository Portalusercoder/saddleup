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
        <div className="landing-card overflow-hidden">
          <div
            className="relative p-8 sm:p-10 bg-cover bg-center"
            style={{ backgroundImage: "linear-gradient(rgba(12,16,14,0.88), rgba(12,16,14,0.92)), url('/horseback.jpg')" }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-white/45">
              {t("home.partnerSpotlightLabel")}
            </p>
            <h3 className="landing-display mt-3 text-2xl sm:text-3xl font-semibold text-white font-serif">{partner.name}</h3>
            <p className="text-white/65 mt-3 max-w-xl leading-relaxed">{t("home.partnerSpotlightDesc")}</p>
            {partner.promoCode ? (
              <p className="mt-4 text-sm text-white/80">
                {t("home.partnerPromoPrefix")}{" "}
                <span className="font-semibold text-white">{partner.promoCode}</span>{" "}
                {t("home.partnerPromoSuffix")}
              </p>
            ) : null}
            <a
              href={partner.destinationUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="inline-flex mt-6 landing-cta-pill landing-cta-primary text-[#0e1512]"
            >
              {partner.ctaText || t("home.partnerCtaDefault")}
            </a>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
