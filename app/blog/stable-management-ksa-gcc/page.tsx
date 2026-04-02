import type { Metadata } from "next";
import Link from "next/link";
import { SeoArticle } from "@/components/landing/SeoArticle";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.saddleup-sa.com";

export const metadata: Metadata = {
  title: "Stable management software for riding schools in KSA and GCC",
  description:
    "How stables in Saudi Arabia and the Gulf run operations: horses, riders, bookings, and team coordination with Saddle Up.",
  alternates: { canonical: `${appUrl}/blog/stable-management-ksa-gcc` },
  openGraph: {
    title: "Stable management software for KSA and GCC | Saddle Up",
    description:
      "Modern stable operations for riding schools across Saudi Arabia and the GCC.",
    url: "/blog/stable-management-ksa-gcc",
    type: "article",
  },
};

export default function StableManagementKsaGccPage() {
  return (
    <main className="min-h-screen">
      <SeoArticle
        title="Stable management software for riding schools in Saudi Arabia and the GCC"
        description="Riding schools and equestrian stables in KSA and the wider Gulf region juggle horses, trainers, students, guardians, and schedules every day. The right software keeps everyone aligned without replacing the craft of horsemanship."
      >
        <h2>Who this is for</h2>
        <p>
          This guide is for stable owners, barn managers, and head trainers who run commercial riding schools or training yards. If you operate multiple horses, regular lessons, and a team, you are the core audience for purpose-built stable management tools.
        </p>

        <h2>Common pain points at busy stables</h2>
        <ul>
          <li>
            Lesson requests and schedule changes scattered across WhatsApp, calls, and paper.
          </li>
          <li>
            Horse workload and rest days tracked informally, increasing risk of overuse or missed care.
          </li>
          <li>
            Rider progress and health or incident notes living in different places.
          </li>
          <li>
            Guardians and owners asking for visibility without overloading staff.
          </li>
        </ul>

        <h2>What stable management software should cover</h2>
        <p>
          A serious platform for stables usually combines horse profiles and care history, rider or student records, booking or lesson flows, scheduling and availability, team roles (owner, trainer, student, guardian), and notices or announcements. The goal is one operational source of truth, not another spreadsheet.
        </p>

        <h2>KSA and GCC context</h2>
        <p>
          Facilities across the Gulf often serve mixed audiences: local families, expat communities, and competitive riders. Bilingual communication and clear guardian-facing touchpoints matter. Software should adapt to how your stable already speaks to customers.
        </p>

        <h2>How Saddle Up helps</h2>
        <p>
          <Link href="/" className="text-accent underline underline-offset-2 hover:opacity-90">
            Saddle Up
          </Link>{" "}
          is built for riding schools, trainers, and owners: horse profiles, training sessions, bookings, schedule blocks, team management, notices, and plans that scale with stable size. See{" "}
          <Link href="/#features" className="text-accent underline underline-offset-2 hover:opacity-90">
            features
          </Link>
          , then{" "}
          <Link href="/signup" className="text-accent underline underline-offset-2 hover:opacity-90">
            get started
          </Link>{" "}
          or{" "}
          <Link href="/contact" className="text-accent underline underline-offset-2 hover:opacity-90">
            contact us
          </Link>
          .
        </p>

        <h2>Next steps</h2>
        <ul>
          <li>Map your weekly lesson volume and number of active horses.</li>
          <li>List who needs access: owners, trainers, office staff, guardians.</li>
          <li>Pilot one module (bookings and schedule) before rolling out everything.</li>
        </ul>
      </SeoArticle>
    </main>
  );
}
