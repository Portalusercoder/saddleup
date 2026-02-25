"use client";

import { useState } from "react";
import Link from "next/link";
import { SUBSCRIPTION_PLANS } from "@/lib/constants";
import AuthModal from "@/components/landing/AuthModal";

export default function Home() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | undefined>();

  const openAuth = (planId?: string) => {
    setSelectedPlan(planId);
    setAuthModalOpen(true);
  };

  return (
    <main className="min-h-screen text-white">
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        planId={selectedPlan}
      />

      {/* Hero - parallax background */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat parallax-bg"
          style={{ backgroundImage: "url(/hero-bg.jpg)" }}
        />
        {/* Subtle dark overlay */}
        <div className="absolute inset-0 bg-black/35" />
        {/* Film grain overlay */}
        <div className="hero-grain" />
        {/* Subtle grid lines */}
        <div className="hero-grid" />

        {/* Hero content - left aligned, exact Black Horse typography */}
        <div className="relative flex-1 flex flex-col justify-center px-5 sm:px-8 md:px-14 lg:px-20 max-w-2xl">
          <h1 className="font-serif text-[2.75rem] sm:text-[3.5rem] md:text-[5rem] lg:text-[6.5rem] font-bold tracking-tight text-white leading-[1.05]">
            Saddle
            <br />
            Up
          </h1>
          <p className="mt-5 md:mt-6 text-white text-[0.95rem] md:text-[1rem] max-w-md font-serif leading-[1.6] font-normal">
            Modern horse & stable management for riding schools, trainers, and
            horse owners. Replace WhatsApp, notebooks, and Excel with one place
            for horses, riders, and training.
          </p>
          <button
            onClick={() => openAuth()}
            className="mt-6 md:mt-8 px-6 py-2.5 bg-white text-black font-medium hover:bg-white/95 transition uppercase tracking-[0.2em] text-[0.7rem]"
          >
            Get Started
          </button>
        </div>

        {/* Footer stats bar - exact Black Horse style */}
        <div className="relative border-t border-white/15 py-5 px-8 md:px-14 lg:px-20">
          <div className="flex flex-wrap justify-between gap-8 uppercase text-[0.65rem] md:text-[0.7rem] tracking-[0.25em] text-white/95">
            <div>
              <p className="text-white/70">Established</p>
              <p className="mt-1 text-white/95 font-normal">2024</p>
            </div>
            <div>
              <p className="text-white/70">The Area</p>
              <p className="mt-1 text-white/95 font-normal">Plans</p>
            </div>
            <div>
              <p className="text-white/70">Coaches</p>
              <p className="mt-1 text-white/95 font-normal">Features</p>
            </div>
            <div>
              <p className="text-white/70">Location</p>
              <p className="mt-1 text-white/95 font-normal">Web</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="bg-black py-12 sm:py-20 px-4 sm:px-6"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl font-normal mb-12">
            Built for the barn
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              title="Horse Profiles"
              description="Digital passport for each horse: temperament, skill level, training status, riding suitability."
            />
            <FeatureCard
              title="Training Punches"
              description="Log sessions, lessons, rest days. Build workload intelligence and avoid overworking horses."
            />
            <FeatureCard
              title="Workload Alerts"
              description="Get warned when a horse needs rest. Weekly workload, overuse risk, recommended rest days."
            />
            <FeatureCard
              title="Rider Management"
              description="Student profiles, riding levels, progress notes, instructor feedback."
            />
            <FeatureCard
              title="Health & Care Logs"
              description="Vet visits, vaccinations, deworming, farrier. Track costs and catch issues early."
            />
            <FeatureCard
              title="Schedule & Availability"
              description="Horse workload calendar. Avoid overworking. Plan lessons and training."
            />
          </div>
        </div>
      </section>

      {/* About */}
      <section
        id="about"
        className="border-y border-white/10 py-20 px-6"
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-normal text-white mb-6">
            One place for everything
          </h2>
          <p className="text-white/60 text-lg leading-relaxed">
            Saddle Up brings together horse profiles, rider management, training
            logs, and health records. No more scattered spreadsheets or
            WhatsApp threads. Built for stables that take their craft seriously.
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        className="bg-black py-12 sm:py-20 px-4 sm:px-6"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl font-normal text-white mb-4">
            Simple pricing
          </h2>
          <p className="text-white/60 mb-12 max-w-xl">
            Start free, upgrade as you grow. No hidden fees.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`border p-6 flex flex-col ${
                  plan.id === "starter"
                    ? "border-white/30 bg-white/5"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <h3 className="font-serif text-lg text-white uppercase tracking-wider">
                  {plan.name}
                </h3>
                <div className="mt-2">
                  {plan.price === 0 ? (
                    <span className="text-2xl font-bold">Free</span>
                  ) : plan.price === null ? (
                    <span className="text-xl font-semibold">Contact us</span>
                  ) : (
                    <>
                      <span className="text-2xl font-bold text-white">${plan.price}</span>
                      <span className="text-white/60 text-sm">/mo</span>
                    </>
                  )}
                </div>
                <ul className="mt-4 space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="text-sm text-white/60 flex items-center gap-2"
                    >
                      <span className="text-white/60">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() =>
                    openAuth(plan.id === "free" ? undefined : plan.id)
                  }
                  className={`mt-6 w-full py-2.5 rounded font-medium transition uppercase tracking-wider text-sm ${
                    plan.id === "starter"
                      ? "bg-white text-black hover:bg-white/95"
                      : plan.id === "free"
                        ? "bg-white/10 hover:bg-white/15 border border-white/20"
                        : "border border-white/20 hover:bg-white/5"
                  }`}
                >
                  {plan.id === "free"
                    ? "Get started free"
                    : plan.id === "enterprise"
                      ? "Contact sales"
                      : "Get started"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/10 py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-normal text-white mb-4">
            Ready to saddle up?
          </h2>
          <p className="text-white/60 mb-8">
            Start managing your horses, riders, and training in one place. Free
            for 2 horses and 10 riders.
          </p>
          <button
            onClick={() => openAuth()}
            className="px-8 py-3 bg-white text-black font-medium hover:bg-white/95 transition uppercase tracking-wider"
          >
            Get Started
          </button>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border border-white/10 p-6 hover:border-white/20 transition">
      <h3 className="font-serif text-lg text-white uppercase tracking-wider">
        {title}
      </h3>
      <p className="text-white/60 text-sm mt-2 leading-relaxed">{description}</p>
    </div>
  );
}
