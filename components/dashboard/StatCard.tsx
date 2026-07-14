"use client";

import { useCountUp } from "@/lib/motion/useCountUp";

type StatCardProps = {
  title: string;
  value: string | number;
  index?: number;
};

export default function StatCard({ title, value, index = 0 }: StatCardProps) {
  const isNumeric = typeof value === "number";
  const animated = useCountUp(isNumeric ? value : 0, 800, isNumeric);
  const display = isNumeric ? animated : value;

  return (
    <div
      className="stat-card stat-card-enter py-4 pe-4 su-hairline-b"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <p className="text-black/50 text-xs uppercase tracking-widest dark:text-white/50">{title}</p>
      <p className="font-serif text-2xl text-black mt-2 dark:text-white">{display}</p>
    </div>
  );
}
