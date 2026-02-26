"use client";

import { motion, useReducedMotion } from "framer-motion";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down";
}

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: ScrollRevealProps) {
  const reduceMotion = useReducedMotion();
  const y = direction === "up" ? 40 : -40;

  const target = { opacity: 1, y: 0, filter: "blur(0px)" as const };

  return (
    <motion.div
      initial={
        reduceMotion ? target : { opacity: 0, y, filter: "blur(12px)" }
      }
      whileInView={target}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: reduceMotion ? 0 : 0.6,
        delay: reduceMotion ? 0 : delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
