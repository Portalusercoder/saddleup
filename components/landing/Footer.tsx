"use client";

import { useState } from "react";
import Link from "next/link";
import { SiGithub, SiInstagram, SiX } from "react-icons/si";

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#about", label: "About" },
  { href: "/login", label: "Sign in" },
  { href: "/signup", label: "Sign up" },
];

const socialLinks = [
  { href: "#", icon: SiGithub, label: "GitHub" },
  { href: "#", icon: SiInstagram, label: "Instagram" },
  { href: "#", icon: SiX, label: "X" },
];

export default function Footer({
  onGetStarted,
}: {
  onGetStarted?: () => void;
}) {
  return (
    <footer className="relative bg-black text-white overflow-hidden border-t border-white/[0.06]">
      {/* Very subtle white grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative max-w-4xl mx-auto py-16 sm:py-20 px-6 text-center">
        {/* Logo + Brand */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center mb-3">
            <span className="font-serif text-xl font-bold text-white">S</span>
          </div>
          <p className="text-sm uppercase tracking-[0.3em] text-white/90 font-medium">
            Saddle Up
          </p>
        </div>

        {/* Heading + CTA */}
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal text-white mb-6 max-w-xl mx-auto">
          Ready to manage your stable?
        </h2>
        <button
          onClick={onGetStarted}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-medium rounded-full hover:bg-white/95 transition uppercase tracking-wider text-sm"
        >
          Get Started
        </button>

        {/* Nav links with subtle separators */}
        <nav
          className="mt-12 flex flex-wrap items-center justify-center gap-x-4 gap-y-2"
          aria-label="Footer navigation"
        >
          {navLinks.map((link, i) => (
            <span key={link.href} className="flex items-center gap-4">
              {i > 0 && (
                <span
                  className="w-px h-4 bg-white/15 flex-shrink-0"
                  aria-hidden
                />
              )}
              <Link
                href={link.href}
                className="text-sm text-white/70 hover:text-white transition uppercase tracking-wider"
              >
                {link.label}
              </Link>
            </span>
          ))}
        </nav>

        {/* Social icons */}
        <div className="mt-10 flex items-center justify-center gap-6">
          {socialLinks.map(({ href, icon: Icon, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={label}
              className="text-white/50 hover:text-white/80 transition"
            >
              <Icon className="w-5 h-5" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
