"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import TurnstileWidget from "@/components/security/TurnstileWidget";
import { hasTurnstileToken } from "@/lib/security/turnstile-client";
import { useLanguage } from "@/components/providers/LanguageProvider";

const formClass =
  "w-full px-4 py-3 bg-base border border-black/20 text-black placeholder-black/40 focus:border-black/40 focus:outline-none";
const labelClass = "block text-xs uppercase tracking-widest text-black/60 mb-2";
const btnPrimary =
  "w-full py-3 bg-accent text-white font-medium uppercase tracking-wider text-sm hover:opacity-95 transition disabled:opacity-50";
const btnSecondary =
  "w-full py-3 border border-black/20 text-black font-medium uppercase tracking-wider text-sm hover:bg-black/5 transition";

type ContactType = "enterprise" | "general" | null;

function ContactPageContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const enterpriseStepLabels = [
    t("contact.stepCompany"),
    t("contact.stepAddress"),
    t("contact.stepContact"),
  ];
  const [contactType, setContactType] = useState<ContactType>(null);
  const [enterpriseStep, setEnterpriseStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentType, setSentType] = useState<"enterprise" | "general" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");

  // Pre-select enterprise when coming from pricing "Contact sales"
  useEffect(() => {
    if (searchParams.get("type") === "enterprise") setContactType("enterprise");
  }, [searchParams]);

  // Enterprise form state (all steps)
  const [enterprise, setEnterprise] = useState({
    companyLegalName: "",
    entityType: "",
    registrationNumber: "",
    countryOfRegistration: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    stateRegion: "",
    postalCode: "",
    country: "",
    vatNumber: "",
    contactName: "",
    jobTitle: "",
    email: "",
    phone: "",
    approxHorses: "",
    approxRiders: "",
    message: "",
  });

  // General form state
  const [general, setGeneral] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const setEnterpriseField = (key: keyof typeof enterprise, value: string) => {
    setEnterprise((p) => ({ ...p, [key]: value }));
  };

  const handleSubmitEnterprise = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!hasTurnstileToken(turnstileToken)) {
      setError(t("contact.turnstileRequired"));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "enterprise",
          ...enterprise,
          turnstileToken: turnstileToken.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || t("contact.errorSend"));
      }
      const data = await res.json().catch(() => ({}));
      setSentType(data.type === "enterprise" ? "enterprise" : "general");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("contact.errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!hasTurnstileToken(turnstileToken)) {
      setError(t("contact.turnstileRequired"));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "general",
          ...general,
          turnstileToken: turnstileToken.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || t("contact.errorSend"));
      }
      const data = await res.json().catch(() => ({}));
      setSentType(data.type === "general" ? "general" : "enterprise");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("contact.errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    const isEnterprise = sentType === "enterprise";
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 text-black">
        <div className="max-w-md w-full text-center border border-black/10 p-10">
          <h1 className="font-serif text-2xl text-black mb-2">{t("contact.thankYou")}</h1>
          {isEnterprise ? (
            <>
              <p className="text-black/70 mb-2">
                {t("contact.thankEnterprise")}
              </p>
              <p className="text-black/60 text-sm mb-6">
                {t("contact.thankEnterpriseLead")}
              </p>
            </>
          ) : (
            <p className="text-black/70 mb-6">
              {t("contact.thankGeneral")}
            </p>
          )}
          <Link href="/" className={btnPrimary + " inline-block text-center"}>
            {t("contact.backToHomeBtn")}
          </Link>
        </div>
      </div>
    );
  }

  // Step 0: Choose type
  if (contactType === null) {
    return (
      <div className="min-h-[60vh] py-16 px-4 text-black">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-serif text-3xl text-black mb-2">{t("contact.title")}</h1>
          <p className="text-black/60 mb-10">
            {t("contact.chooseHow")}
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            <button
              type="button"
              onClick={() => setContactType("enterprise")}
              className="border border-black/20 p-8 text-left hover:bg-black/5 transition focus:outline-none focus:ring-2 focus:ring-black/20"
            >
              <span className="font-serif text-xl text-black block mb-2">
                {t("contact.enterpriseTitle")}
              </span>
              <span className="text-sm text-black/60">
                {t("contact.enterpriseDesc")}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setContactType("general")}
              className="border border-black/20 p-8 text-left hover:bg-black/5 transition focus:outline-none focus:ring-2 focus:ring-black/20"
            >
              <span className="font-serif text-xl text-black block mb-2">
                {t("contact.generalTitle")}
              </span>
              <span className="text-sm text-black/60">
                {t("contact.generalDesc")}
              </span>
            </button>
          </div>
          <p className="mt-8 text-sm text-black/50">
            <Link href="/" className="underline hover:text-black">
              {t("contact.backHome")}
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // General contact form (single step)
  if (contactType === "general") {
    return (
      <div className="min-h-[60vh] py-12 px-4 text-black">
        <div className="max-w-lg mx-auto">
          <Link
            href="/contact"
            onClick={(e) => {
              e.preventDefault();
              setContactType(null);
            }}
            className="text-sm text-black/60 hover:text-black mb-6 inline-block"
          >
            {t("contact.changeEnterprise")}
          </Link>
          <h1 className="font-serif text-3xl text-black mb-2">
            {t("contact.generalHeading")}
          </h1>
          <p className="text-black/60 mb-8">
            {t("contact.generalLead")}
          </p>
          <form onSubmit={handleSubmitGeneral} className="space-y-5">
            <div>
              <label htmlFor="name" className={labelClass}>
                {t("contact.name")}
              </label>
              <input
                id="name"
                type="text"
                required
                className={formClass}
                value={general.name}
                onChange={(e) =>
                  setGeneral((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div>
              <label htmlFor="email" className={labelClass}>
                {t("common.email")}
              </label>
              <input
                id="email"
                type="email"
                required
                className={formClass}
                value={general.email}
                onChange={(e) =>
                  setGeneral((p) => ({ ...p, email: e.target.value }))
                }
              />
            </div>
            <div>
              <label htmlFor="subject" className={labelClass}>
                {t("contact.subject")}
              </label>
              <input
                id="subject"
                type="text"
                required
                className={formClass}
                placeholder={t("contact.subjectPh")}
                value={general.subject}
                onChange={(e) =>
                  setGeneral((p) => ({ ...p, subject: e.target.value }))
                }
              />
            </div>
            <div>
              <TurnstileWidget onTokenChange={setTurnstileToken} />
            </div>
            <div>
              <label htmlFor="message" className={labelClass}>
                {t("contact.message")}
              </label>
              <textarea
                id="message"
                required
                rows={5}
                className={formClass + " resize-y"}
                value={general.message}
                onChange={(e) =>
                  setGeneral((p) => ({ ...p, message: e.target.value }))
                }
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 border border-red-200 bg-red-50/50 px-4 py-2">
                {error}
              </p>
            )}
            <div className="flex gap-3">
              <button type="submit" disabled={loading} className={btnPrimary}>
                {loading ? t("contact.sending") : t("contact.send")}
              </button>
              <button
                type="button"
                onClick={() => setContactType(null)}
                className={btnSecondary}
              >
                {t("common.back")}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Enterprise: multi-step form
  const isStep1 = enterpriseStep === 0;
  const isStep2 = enterpriseStep === 1;
  const isStep3 = enterpriseStep === 2;

  return (
    <div className="min-h-[60vh] py-12 px-4 text-black">
      <div className="max-w-lg mx-auto">
        <Link
          href="/contact"
          onClick={(e) => {
            e.preventDefault();
            if (enterpriseStep === 0) setContactType(null);
            else setEnterpriseStep((s) => s - 1);
          }}
          className="text-sm text-black/60 hover:text-black mb-6 inline-block"
        >
          {enterpriseStep === 0 ? t("contact.changeGeneral") : t("contact.prevStep")}
        </Link>
        <h1 className="font-serif text-3xl text-black mb-2">
          {t("contact.enterpriseHeading")}
        </h1>
        <p className="text-black/60 mb-2">
          {t("contact.stepOf", {
            n: String(enterpriseStep + 1),
            label: enterpriseStepLabels[enterpriseStep] ?? "",
          })}
        </p>
        <div className="flex gap-2 mb-8">
          {enterpriseStepLabels.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 ${
                i <= enterpriseStep ? "bg-black/30" : "bg-black/10"
              }`}
            />
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (isStep1) setEnterpriseStep(1);
            else if (isStep2) setEnterpriseStep(2);
            else handleSubmitEnterprise(e);
          }}
          className="space-y-5"
        >
          {isStep1 && (
            <>
              <div>
                <label htmlFor="companyLegalName" className={labelClass}>
                  {t("contact.companyLegalName")}
                </label>
                <input
                  id="companyLegalName"
                  type="text"
                  required
                  className={formClass}
                  value={enterprise.companyLegalName}
                  onChange={(e) =>
                    setEnterpriseField("companyLegalName", e.target.value)
                  }
                />
              </div>
              <div>
                <label htmlFor="entityType" className={labelClass}>
                  {t("contact.entityType")}
                </label>
                <select
                  id="entityType"
                  required
                  className={formClass}
                  value={enterprise.entityType}
                  onChange={(e) =>
                    setEnterpriseField("entityType", e.target.value)
                  }
                >
                  <option value="">{t("contact.entitySelect")}</option>
                  <option value="LLC">{t("contact.entityLLC")}</option>
                  <option value="Corporation">{t("contact.entityCorporation")}</option>
                  <option value="Sole proprietorship">{t("contact.entitySole")}</option>
                  <option value="Partnership">{t("contact.entityPartnership")}</option>
                  <option value="Non-profit">{t("contact.entityNonProfit")}</option>
                  <option value="Other">{t("contact.entityOther")}</option>
                </select>
              </div>
              <div>
                <label htmlFor="registrationNumber" className={labelClass}>
                  {t("contact.registrationNumber")}
                </label>
                <input
                  id="registrationNumber"
                  type="text"
                  className={formClass}
                  placeholder={t("common.optional")}
                  value={enterprise.registrationNumber}
                  onChange={(e) =>
                    setEnterpriseField("registrationNumber", e.target.value)
                  }
                />
              </div>
              <div>
                <label htmlFor="countryOfRegistration" className={labelClass}>
                  {t("contact.countryOfRegistration")}
                </label>
                <input
                  id="countryOfRegistration"
                  type="text"
                  required
                  className={formClass}
                  value={enterprise.countryOfRegistration}
                  onChange={(e) =>
                    setEnterpriseField("countryOfRegistration", e.target.value)
                  }
                />
              </div>
            </>
          )}

          {isStep2 && (
            <>
              <div>
                <label htmlFor="addressLine1" className={labelClass}>
                  {t("contact.addressLine1")}
                </label>
                <input
                  id="addressLine1"
                  type="text"
                  required
                  className={formClass}
                  value={enterprise.addressLine1}
                  onChange={(e) =>
                    setEnterpriseField("addressLine1", e.target.value)
                  }
                />
              </div>
              <div>
                <label htmlFor="addressLine2" className={labelClass}>
                  {t("contact.addressLine2")}
                </label>
                <input
                  id="addressLine2"
                  type="text"
                  className={formClass}
                  placeholder={t("common.optional")}
                  value={enterprise.addressLine2}
                  onChange={(e) =>
                    setEnterpriseField("addressLine2", e.target.value)
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className={labelClass}>
                    {t("contact.city")}
                  </label>
                  <input
                    id="city"
                    type="text"
                    required
                    className={formClass}
                    value={enterprise.city}
                    onChange={(e) =>
                      setEnterpriseField("city", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label htmlFor="stateRegion" className={labelClass}>
                    {t("contact.stateRegion")}
                  </label>
                  <input
                    id="stateRegion"
                    type="text"
                    className={formClass}
                    value={enterprise.stateRegion}
                    onChange={(e) =>
                      setEnterpriseField("stateRegion", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="postalCode" className={labelClass}>
                    {t("contact.postalCode")}
                  </label>
                  <input
                    id="postalCode"
                    type="text"
                    required
                    className={formClass}
                    value={enterprise.postalCode}
                    onChange={(e) =>
                      setEnterpriseField("postalCode", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label htmlFor="country" className={labelClass}>
                    {t("contact.country")}
                  </label>
                  <input
                    id="country"
                    type="text"
                    required
                    className={formClass}
                    value={enterprise.country}
                    onChange={(e) =>
                      setEnterpriseField("country", e.target.value)
                    }
                  />
                </div>
              </div>
              <div>
                <label htmlFor="vatNumber" className={labelClass}>
                  {t("contact.vatNumber")}
                </label>
                <input
                  id="vatNumber"
                  type="text"
                  className={formClass}
                  placeholder={t("common.optional")}
                  value={enterprise.vatNumber}
                  onChange={(e) =>
                    setEnterpriseField("vatNumber", e.target.value)
                  }
                />
              </div>
            </>
          )}

          {isStep3 && (
            <>
              <div>
                <label htmlFor="contactName" className={labelClass}>
                  {t("contact.contactName")}
                </label>
                <input
                  id="contactName"
                  type="text"
                  required
                  className={formClass}
                  value={enterprise.contactName}
                  onChange={(e) =>
                    setEnterpriseField("contactName", e.target.value)
                  }
                />
              </div>
              <div>
                <label htmlFor="jobTitle" className={labelClass}>
                  {t("contact.jobTitle")}
                </label>
                <input
                  id="jobTitle"
                  type="text"
                  className={formClass}
                  value={enterprise.jobTitle}
                  onChange={(e) =>
                    setEnterpriseField("jobTitle", e.target.value)
                  }
                />
              </div>
              <div>
                <label htmlFor="email" className={labelClass}>
                  {t("common.email")}
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className={formClass}
                  value={enterprise.email}
                  onChange={(e) =>
                    setEnterpriseField("email", e.target.value)
                  }
                />
              </div>
              <div>
                <label htmlFor="phone" className={labelClass}>
                  {t("contact.phone")}
                </label>
                <input
                  id="phone"
                  type="tel"
                  className={formClass}
                  value={enterprise.phone}
                  onChange={(e) =>
                    setEnterpriseField("phone", e.target.value)
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="approxHorses" className={labelClass}>
                    {t("contact.approxHorses")}
                  </label>
                  <input
                    id="approxHorses"
                    type="text"
                    className={formClass}
                    placeholder={t("contact.approxHorsesPh")}
                    value={enterprise.approxHorses}
                    onChange={(e) =>
                      setEnterpriseField("approxHorses", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label htmlFor="approxRiders" className={labelClass}>
                    {t("contact.approxRiders")}
                  </label>
                  <input
                    id="approxRiders"
                    type="text"
                    className={formClass}
                    placeholder={t("contact.approxRidersPh")}
                    value={enterprise.approxRiders}
                    onChange={(e) =>
                      setEnterpriseField("approxRiders", e.target.value)
                    }
                  />
                </div>
              </div>
              <div>
                <TurnstileWidget onTokenChange={setTurnstileToken} />
              </div>
              <div>
                <label htmlFor="message" className={labelClass}>
                  {t("contact.message")}
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className={formClass + " resize-y"}
                  placeholder={t("contact.messageEnterprisePh")}
                  value={enterprise.message}
                  onChange={(e) =>
                    setEnterpriseField("message", e.target.value)
                  }
                />
              </div>
            </>
          )}

          {error && (
            <p className="text-sm text-red-600 border border-red-200 bg-red-50/50 px-4 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button type="submit" disabled={loading} className={btnPrimary}>
              {isStep3
                ? loading
                  ? t("contact.sending")
                  : t("contact.submitEnquiry")
                : t("contact.next")}
            </button>
            {enterpriseStep > 0 && (
              <button
                type="button"
                onClick={() => setEnterpriseStep((s) => s - 1)}
                className={btnSecondary}
              >
                {t("contact.previous")}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function ContactLoading() {
  const { t } = useLanguage();
  return (
    <div className="min-h-[40vh] flex items-center justify-center text-black/60 text-sm">
      {t("common.loading")}
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<ContactLoading />}>
      <ContactPageContent />
    </Suspense>
  );
}
