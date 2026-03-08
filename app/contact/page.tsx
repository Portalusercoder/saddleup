"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const formClass =
  "w-full px-4 py-3 bg-base border border-black/20 text-black placeholder-black/40 focus:border-black/40 focus:outline-none";
const labelClass = "block text-xs uppercase tracking-widest text-black/60 mb-2";
const btnPrimary =
  "w-full py-3 bg-accent text-white font-medium uppercase tracking-wider text-sm hover:opacity-95 transition disabled:opacity-50";
const btnSecondary =
  "w-full py-3 border border-black/20 text-black font-medium uppercase tracking-wider text-sm hover:bg-black/5 transition";

type ContactType = "enterprise" | "general" | null;

const ENTERPRISE_STEPS = [
  "Company & legal",
  "Address",
  "Contact & message",
];

export default function ContactPage() {
  const searchParams = useSearchParams();
  const [contactType, setContactType] = useState<ContactType>(null);
  const [enterpriseStep, setEnterpriseStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "enterprise", ...enterprise }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send");
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "general", ...general }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send");
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 text-black">
        <div className="max-w-md w-full text-center border border-black/10 p-10">
          <h1 className="font-serif text-2xl text-black mb-2">Thank you</h1>
          <p className="text-black/70 mb-6">
            We&apos;ve received your enquiry and will get back to you soon.
          </p>
          <Link href="/" className={btnPrimary + " inline-block text-center"}>
            Back to home
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
          <h1 className="font-serif text-3xl text-black mb-2">Contact us</h1>
          <p className="text-black/60 mb-10">
            Choose how you&apos;d like to get in touch.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            <button
              type="button"
              onClick={() => setContactType("enterprise")}
              className="border border-black/20 p-8 text-left hover:bg-black/5 transition focus:outline-none focus:ring-2 focus:ring-black/20"
            >
              <span className="font-serif text-xl text-black block mb-2">
                Enterprise plan
              </span>
              <span className="text-sm text-black/60">
                Enquiry about custom pricing, legal details, and onboarding for
                larger stables.
              </span>
            </button>
            <button
              type="button"
              onClick={() => setContactType("general")}
              className="border border-black/20 p-8 text-left hover:bg-black/5 transition focus:outline-none focus:ring-2 focus:ring-black/20"
            >
              <span className="font-serif text-xl text-black block mb-2">
                General enquiry
              </span>
              <span className="text-sm text-black/60">
                Any other question: support, features, partnerships, or feedback.
              </span>
            </button>
          </div>
          <p className="mt-8 text-sm text-black/50">
            <Link href="/" className="underline hover:text-black">
              ← Back to home
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
            ← Change to Enterprise enquiry
          </Link>
          <h1 className="font-serif text-3xl text-black mb-2">
            General enquiry
          </h1>
          <p className="text-black/60 mb-8">
            Send us a message and we&apos;ll get back to you.
          </p>
          <form onSubmit={handleSubmitGeneral} className="space-y-5">
            <div>
              <label htmlFor="name" className={labelClass}>
                Name
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
                Email
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
                Subject
              </label>
              <input
                id="subject"
                type="text"
                required
                className={formClass}
                placeholder="e.g. Feature request, support"
                value={general.subject}
                onChange={(e) =>
                  setGeneral((p) => ({ ...p, subject: e.target.value }))
                }
              />
            </div>
            <div>
              <label htmlFor="message" className={labelClass}>
                Message
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
                {loading ? "Sending…" : "Send message"}
              </button>
              <button
                type="button"
                onClick={() => setContactType(null)}
                className={btnSecondary}
              >
                Back
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
          ← {enterpriseStep === 0 ? "Change to General enquiry" : "Previous step"}
        </Link>
        <h1 className="font-serif text-3xl text-black mb-2">
          Enterprise plan enquiry
        </h1>
        <p className="text-black/60 mb-2">
          Step {enterpriseStep + 1} of 3: {ENTERPRISE_STEPS[enterpriseStep]}
        </p>
        <div className="flex gap-2 mb-8">
          {ENTERPRISE_STEPS.map((_, i) => (
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
                  Company legal name
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
                  Type of entity
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
                  <option value="">Select…</option>
                  <option value="LLC">LLC</option>
                  <option value="Corporation">Corporation</option>
                  <option value="Sole proprietorship">Sole proprietorship</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Non-profit">Non-profit</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="registrationNumber" className={labelClass}>
                  Registration number
                </label>
                <input
                  id="registrationNumber"
                  type="text"
                  className={formClass}
                  placeholder="Optional"
                  value={enterprise.registrationNumber}
                  onChange={(e) =>
                    setEnterpriseField("registrationNumber", e.target.value)
                  }
                />
              </div>
              <div>
                <label htmlFor="countryOfRegistration" className={labelClass}>
                  Country of registration
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
                  Address line 1
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
                  Address line 2
                </label>
                <input
                  id="addressLine2"
                  type="text"
                  className={formClass}
                  placeholder="Optional"
                  value={enterprise.addressLine2}
                  onChange={(e) =>
                    setEnterpriseField("addressLine2", e.target.value)
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className={labelClass}>
                    City
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
                    State / Region
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
                    Postal code
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
                    Country
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
                  VAT number
                </label>
                <input
                  id="vatNumber"
                  type="text"
                  className={formClass}
                  placeholder="Optional"
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
                  Contact name
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
                  Job title
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
                  Email
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
                  Phone
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
                    Approx. horses
                  </label>
                  <input
                    id="approxHorses"
                    type="text"
                    className={formClass}
                    placeholder="e.g. 50"
                    value={enterprise.approxHorses}
                    onChange={(e) =>
                      setEnterpriseField("approxHorses", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label htmlFor="approxRiders" className={labelClass}>
                    Approx. riders
                  </label>
                  <input
                    id="approxRiders"
                    type="text"
                    className={formClass}
                    placeholder="e.g. 200"
                    value={enterprise.approxRiders}
                    onChange={(e) =>
                      setEnterpriseField("approxRiders", e.target.value)
                    }
                  />
                </div>
              </div>
              <div>
                <label htmlFor="message" className={labelClass}>
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className={formClass + " resize-y"}
                  placeholder="Tell us about your stable and what you need"
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
                  ? "Sending…"
                  : "Submit enquiry"
                : "Next"}
            </button>
            {enterpriseStep > 0 && (
              <button
                type="button"
                onClick={() => setEnterpriseStep((s) => s - 1)}
                className={btnSecondary}
              >
                Previous
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
