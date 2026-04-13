import type { Metadata } from "next";
import BlogIndexClient from "./BlogIndexClient";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.saddleup-sa.com";

export const metadata: Metadata = {
  title: "Guides for stables and riding schools",
  description:
    "Practical guides for stable operations, scheduling, and management in Saudi Arabia and the GCC.",
  alternates: { canonical: `${appUrl}/blog` },
};

export default function BlogIndexPage() {
  return <BlogIndexClient />;
}
