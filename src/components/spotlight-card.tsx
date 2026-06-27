"use client";

import Link from "next/link";
import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import type { MouseEvent, ReactNode } from "react";

import { EASE_OUT_SOFT } from "@/lib/motion";

type SpotlightCardProps = {
  href: string;
  index?: number;
  children: ReactNode;
};

/** Glass card with a cursor-following spotlight and reveal animation. */
export function SpotlightCard({ href, index = 0, children }: SpotlightCardProps) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  function handleMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mx.set(clientX - left);
    my.set(clientY - top);
  }

  const background = useMotionTemplate`radial-gradient(420px circle at ${mx}px ${my}px, color-mix(in oklch, var(--color-accent) 18%, transparent), transparent 70%)`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: EASE_OUT_SOFT }}
    >
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onMouseMove={handleMove}
        className="group relative block h-full overflow-hidden rounded-2xl glass p-px transition-transform duration-300 hover:-translate-y-1"
      >
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background }}
        />
        <div className="relative flex h-full flex-col rounded-2xl p-6">
          {children}
        </div>
      </Link>
    </motion.div>
  );
}
