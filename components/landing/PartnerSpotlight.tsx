"use client";

import { useEffect, useState } from "react";
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
        // keep section hidden on failure
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!partner?.active || !partner.destinationUrl) return null;

  return (
    <section
      className="border-t border-black/10 py-12 px-6 text-black bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/horseback.jpg')" }}
    >
      <div className="max-w-4xl mx-auto border border-black/15">
        <div className="p-6 sm:p-8 bg-black text-white">
          <p className="text-xs uppercase tracking-[0.28em] text-white/70">{t("home.partnerSpotlightLabel")}</p>
          <h3 className="font-serif text-2xl md:text-3xl mt-2">{partner.name}</h3>
          <p className="text-white/85 mt-3">
            {t("home.partnerSpotlightDesc")}
          </p>
          {partner.promoCode ? (
            <p className="mt-3 text-sm text-white/90">
              {t("home.partnerPromoPrefix")}{" "}
              <span className="font-semibold">{partner.promoCode}</span>{" "}
              {t("home.partnerPromoSuffix")}
            </p>
          ) : null}
          <a
            href={partner.destinationUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-block mt-6 px-6 py-2.5 bg-accent text-white uppercase tracking-wider text-sm hover:opacity-95 transition"
          >
            {partner.ctaText || t("home.partnerCtaDefault")}
          </a>
        </div>
      </div>
    </section>
  );
}
