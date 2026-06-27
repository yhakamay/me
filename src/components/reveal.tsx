"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

import { EASE_OUT_SOFT } from "@/lib/motion";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
};

/** Fades + lifts its children into view once, when scrolled to. */
export function Reveal({ children, delay = 0, y = 24, className }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: EASE_OUT_SOFT }}
    >
      {children}
    </motion.div>
  );
}
