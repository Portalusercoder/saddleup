"use client";

import { useState } from "react";
import Link from "next/link";
import {
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiTailwindcss,
  SiSupabase,
  SiStripe,
  SiPrisma,
} from "react-icons/si";
import { SUBSCRIPTION_PLANS } from "@/lib/constants";
import AuthModal from "@/components/landing/AuthModal";
import PixelCard from "@/components/ui/PixelCard";
import LogoLoop from "@/components/ui/LogoLoop";
import BlurText from "@/components/ui/BlurText";
import Footer from "@/components/landing/Footer";
import ScrollReveal from "@/components/ui/ScrollReveal";

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

      {/* Hero - extends under nav so transparent nav shows hero, not body bg */}
      <section className="relative min-h-screen flex flex-col overflow-hidden -mt-20 pt-20">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat parallax-bg"
          style={{ backgroundImage: "url(/hero-bg.jpg)" }}
        />
        {/* Dark overlay + gradient (left/bottom) - FASTRACK-style */}
        <div className="absolute inset-0 bg-black/50" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to right, rgba(0,0,0,0.75) 0%, transparent 45%), linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.85) 100%)",
          }}
        />
        <div className="hero-grid" />

        {/* Main content - left aligned */}
        <div className="relative flex-1 flex flex-col justify-end pb-24 sm:pb-28 md:pb-32">
          <div className="px-5 sm:px-8 md:px-14 lg:px-20 max-w-5xl">
            {/* Brand text above headline - FASTRACK style */}
            <p className="font-sans text-[0.7rem] sm:text-[0.75rem] uppercase tracking-[0.35em] text-[#d4a574] mb-3">
              Saddle Up
            </p>

            {/* Main headline - Playfair Display (previous fonts) */}
            <div role="heading" aria-level={1} className="[&>p]:flex [&>p]:flex-col [&>p]:items-start">
              <BlurText
                text="Your home"
                delay={100}
                animateBy="words"
                direction="top"
                className="font-serif text-[3.25rem] sm:text-[4.5rem] md:text-[6rem] lg:text-[7.5rem] font-extrabold tracking-tight text-white leading-[0.92] uppercase"
              />
              <BlurText
                text="for the barn."
                delay={150}
                animateBy="words"
                direction="top"
                className="font-serif text-[3.25rem] sm:text-[4.5rem] md:text-[6rem] lg:text-[7.5rem] font-extrabold tracking-tight text-white leading-[0.92] uppercase mt-1"
              />
            </div>

            {/* Sub-headline - Inter */}
            <p className="mt-5 font-sans text-sm sm:text-base uppercase tracking-[0.18em] text-white/90 max-w-xl">
              Modern horse & stable management for riding schools, trainers, and horse owners.
            </p>

            {/* Two CTAs at bottom - FASTRACK style */}
            <div className="mt-12 flex flex-wrap gap-10 sm:gap-14">
              <button
                onClick={() => openAuth()}
                className="group flex flex-col items-start text-left"
              >
                <span className="font-sans text-sm uppercase tracking-[0.25em] text-[#d4a574] group-hover:text-[#e5b685] transition flex items-center gap-2">
                  Get in the race
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7h-10v10" />
                  </svg>
                </span>
                <span className="mt-1 font-sans text-xs text-white/70">Create your account</span>
              </button>
              <a
                href="#features"
                className="group flex flex-col items-start text-left"
              >
                <span className="font-sans text-sm uppercase tracking-[0.25em] text-[#d4a574] group-hover:text-[#e5b685] transition flex items-center gap-2">
                  Get ready
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7h-10v10" />
                  </svg>
                </span>
                <span className="mt-1 font-sans text-xs text-white/70">See features</span>
              </a>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <a
          href="#features"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/40 hover:text-white/70 transition text-[0.65rem] uppercase tracking-[0.3em] font-sans"
        >
          <span>Scroll</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </a>

        {/* Footer stats bar */}
        <ScrollReveal className="relative border-t border-white/10 py-5 px-8 md:px-14 lg:px-20">
          <div className="flex flex-wrap justify-between gap-8 uppercase text-[0.65rem] md:text-[0.7rem] tracking-[0.25em] text-white/80 font-sans">
            <div>
              <p className="text-white/50">Established</p>
              <p className="mt-1 text-white/90 font-normal">2024</p>
            </div>
            <div>
              <p className="text-white/50">The Area</p>
              <p className="mt-1 text-white/90 font-normal">Plans</p>
            </div>
            <div>
              <p className="text-white/50">Coaches</p>
              <p className="mt-1 text-white/90 font-normal">Features</p>
            </div>
            <div>
              <p className="text-white/50">Location</p>
              <p className="mt-1 text-white/90 font-normal">Web</p>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Features */}
      <section
        id="features"
        className="bg-base text-black py-12 sm:py-20 px-4 sm:px-6"
      >
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <h2 className="font-serif text-3xl md:text-4xl font-normal mb-12">
              Built for the barn
            </h2>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ScrollReveal delay={0.05}>
              <FeatureCard
                title="Horse Profiles"
                description="Digital passport for each horse: temperament, skill level, training status, riding suitability."
              />
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <FeatureCard
                title="Training Punches"
                description="Log sessions, lessons, rest days. Build workload intelligence and avoid overworking horses."
              />
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <FeatureCard
                title="Workload Alerts"
                description="Get warned when a horse needs rest. Weekly workload, overuse risk, recommended rest days."
              />
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <FeatureCard
                title="Rider Management"
                description="Student profiles, riding levels, progress notes, instructor feedback."
              />
            </ScrollReveal>
            <ScrollReveal delay={0.25}>
              <FeatureCard
                title="Health & Care Logs"
                description="Vet visits, vaccinations, deworming, farrier. Track costs and catch issues early."
              />
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <FeatureCard
                title="Schedule & Availability"
                description="Horse workload calendar. Avoid overworking. Plan lessons and training."
              />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* About */}
      <section
        id="about"
        className="bg-base border-y border-black/10 py-20 px-6 text-black"
      >
        <ScrollReveal className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-normal mb-6">
            One place for everything
          </h2>
          <p className="text-black/60 text-lg leading-relaxed">
            Saddle Up brings together horse profiles, rider management, training
            logs, and health records. No more scattered spreadsheets or
            WhatsApp threads. Built for stables that take their craft seriously.
          </p>
        </ScrollReveal>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        className="bg-base text-black py-12 sm:py-20 px-4 sm:px-6"
      >
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <h2 className="font-serif text-3xl md:text-4xl font-normal mb-4">
              Simple pricing
            </h2>
            <p className="text-black/60 mb-12 max-w-xl">
              Start free, upgrade as you grow. No hidden fees.
            </p>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {SUBSCRIPTION_PLANS.map((plan, i) => (
                <ScrollReveal key={plan.id} delay={i * 0.08}>
                <PixelCard
                  key={plan.id}
                  variant="white"
                  className={`flex flex-col ${
                    plan.id === "starter" ? "border-black/30" : ""
                  }`}
                >
                  <div className="absolute inset-0 p-6 flex flex-col z-10">
                    <h3 className="font-serif text-lg text-black uppercase tracking-wider">
                      {plan.name}
                    </h3>
                    <div className="mt-2">
                      {plan.price === 0 ? (
                        <span className="text-2xl font-bold">Free</span>
                      ) : plan.price === null ? (
                        <span className="text-xl font-semibold">Contact us</span>
                      ) : (
                        <>
                          <span className="text-2xl font-bold text-black">${plan.price}</span>
                          <span className="text-black/60 text-sm">/mo</span>
                        </>
                      )}
                    </div>
                    <ul className="mt-4 space-y-2 flex-1">
                      {plan.features.map((f) => (
                        <li
                          key={f}
                          className="text-sm text-black/60 flex items-center gap-2"
                        >
                          <span className="text-black/60">✓</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                    {plan.id === "enterprise" ? (
                      <Link
                        href="/contact?type=enterprise"
                        className="mt-6 w-full py-2.5 font-medium transition uppercase tracking-wider text-sm border border-black/20 hover:bg-black/5 text-black block text-center"
                      >
                        Contact sales
                      </Link>
                    ) : (
                      <button
                        onClick={() =>
                          openAuth(plan.id === "free" ? undefined : plan.id)
                        }
                        className={`mt-6 w-full py-2.5 font-medium transition uppercase tracking-wider text-sm ${
                          plan.id === "starter"
                            ? "bg-accent text-white hover:opacity-95"
                            : plan.id === "free"
                              ? "bg-black/10 hover:bg-black/15 border border-black/20 text-black"
                              : "border border-black/20 hover:bg-black/5 text-black"
                        }`}
                      >
                        {plan.id === "free"
                          ? "Get started free"
                          : "Get started"}
                      </button>
                    )}
                  </div>
                </PixelCard>
                </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-base border-t border-black/10 py-20 px-6 text-black">
        <ScrollReveal className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-normal mb-4">
            Ready to saddle up?
          </h2>
          <p className="text-black/60 mb-8">
            Start managing your horses, riders, and training in one place. Free
            for 2 horses and 10 riders.
          </p>
          <button
            onClick={() => openAuth()}
            className="px-8 py-3 bg-accent text-white font-medium hover:opacity-95 transition uppercase tracking-wider"
          >
            Get Started
          </button>
        </ScrollReveal>
      </section>

      {/* Tech stack */}
      <section className="bg-base border-t border-black/10 py-12 overflow-hidden text-black dark:border-white/10">
        <ScrollReveal>
          <p className="text-center text-black/70 dark:text-white/90 text-xs uppercase tracking-[0.3em] mb-8">
            Built with
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <div className="h-16 relative">
          <LogoLoop
            logos={[
              { node: <SiReact />, title: "React", href: "https://react.dev" },
              {
                node: <SiNextdotjs />,
                title: "Next.js",
                href: "https://nextjs.org",
              },
              {
                node: <SiTypescript />,
                title: "TypeScript",
                href: "https://www.typescriptlang.org",
              },
              {
                node: <SiTailwindcss />,
                title: "Tailwind CSS",
                href: "https://tailwindcss.com",
              },
              {
                node: <SiSupabase />,
                title: "Supabase",
                href: "https://supabase.com",
              },
              { node: <SiStripe />, title: "Stripe", href: "https://stripe.com" },
              {
                node: <SiPrisma />,
                title: "Prisma",
                href: "https://prisma.io",
              },
            ]}
            speed={80}
            direction="left"
            logoHeight={32}
            gap={48}
            hoverSpeed={0}
            scaleOnHover
            fadeOut
            ariaLabel="Technology stack"
          />
          </div>
        </ScrollReveal>
      </section>

      <ScrollReveal>
        <Footer onGetStarted={() => openAuth()} />
      </ScrollReveal>
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
    <div className="border border-black/10 p-6 hover:border-black/20 transition">
      <h3 className="font-serif text-lg text-black uppercase tracking-wider">
        {title}
      </h3>
      <p className="text-black/60 text-sm mt-2 leading-relaxed">{description}</p>
    </div>
  );
}
