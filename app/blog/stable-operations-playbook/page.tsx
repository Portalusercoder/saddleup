import type { Metadata } from "next";
import Link from "next/link";
import { SeoArticle } from "@/components/landing/SeoArticle";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.saddleup-sa.com";

export const metadata: Metadata = {
  title: "How to run a modern riding stable — operations playbook",
  description:
    "Daily, weekly, and monthly checklist for professional stable operations at riding schools in KSA and GCC.",
  alternates: { canonical: `${appUrl}/blog/stable-operations-playbook` },
  openGraph: {
    title: "Stable operations playbook | Saddle Up",
    description: "Rhythms for lessons, horse care, staff, and reporting.",
    url: "/blog/stable-operations-playbook",
    type: "article",
  },
};

export default function StableOperationsPlaybookPage() {
  return (
    <main className="min-h-screen">
      <SeoArticle
        title="How to run a modern riding stable: an operations playbook"
        description="A lightweight framework for riding schools and training stables in the Gulf. Adapt cadence and roles to your barn size and discipline."
      >
        <h2>Daily rhythm</h2>
        <ul>
          <li>
            Confirm today&apos;s lessons and assigned horses; resolve conflicts before riders arrive.
          </li>
          <li>
            Quick check: horses on medical rest, farrier hold, or competition prep.
          </li>
          <li>
            Log training sessions so workload data stays honest for the week.
          </li>
          <li>
            Surface urgent notices (arena closure, heat policy) in one channel staff and clients trust.
          </li>
        </ul>

        <h2>Weekly rhythm</h2>
        <ul>
          <li>Review farrier, vet, and vaccination follow-ups against your care log.</li>
          <li>
            Balance horse workload: rotate high-use horses and flag overtraining risk early.
          </li>
          <li>
            Short team huddle: capacity, incidents, and guardian questions.
          </li>
          <li>
            Tidy waitlists and pending booking requests so no slot sits ambiguous.
          </li>
        </ul>

        <h2>Monthly rhythm</h2>
        <ul>
          <li>
            Owner summary: utilization, lesson volume, and major care costs.
          </li>
          <li>
            Update rider levels and instructor notes; archive completed competition blocks if applicable.
          </li>
          <li>
            Review access and roles if staff changed.
          </li>
        </ul>

        <h2>Where software fits</h2>
        <p>
          Spreadsheets and group chats work until volume breaks them. One system for{" "}
          <Link href="/#features" className="text-accent underline underline-offset-2 hover:opacity-90">
            horses, riders, bookings, and schedule
          </Link>{" "}
          reduces duplicate entry.{" "}
          <Link href="/" className="text-accent underline underline-offset-2 hover:opacity-90">
            Saddle Up
          </Link>{" "}
          is built around that workflow.
        </p>

        <h2>GCC-friendly operations</h2>
        <p>
          Heat, seasonal events, and local holidays affect peak lesson times. Build buffer into scheduling and communicate early through structured notices. Customers trust predictable communication.
        </p>
      </SeoArticle>
    </main>
  );
}
