"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";

import { EASE_OUT_SOFT } from "@/lib/motion";
import { site } from "@/lib/site";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_OUT_SOFT },
  },
};

export function Hero() {
  return (
    <section
      id="top"
      className="flex min-h-[88vh] flex-col justify-center py-24"
    >
      <motion.div variants={container} initial="hidden" animate="show">
        <motion.div
          variants={item}
          className="flex items-center justify-between border-b border-(--rule) pb-3"
        >
          <div className="flex items-center gap-3">
            <Image
              src="/yhakamay.webp"
              alt={site.name}
              width={64}
              height={64}
              unoptimized
              className="h-8 w-8 rounded-full border border-(--rule) object-cover"
            />
            <span className="eyebrow">{site.name}</span>
          </div>
          <span className="text-xs text-(--muted)">Tokyo · 2026</span>
        </motion.div>

        <motion.h1
          variants={item}
          className="mt-12 max-w-[20ch] text-balance text-4xl font-medium leading-[1.12] tracking-tight sm:text-5xl md:text-6xl"
        >
          {site.tagline}
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-5 text-lg leading-relaxed text-(--muted)"
        >
          {site.role}
        </motion.p>

        <motion.nav
          variants={item}
          className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm"
        >
          {site.socials.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rule-link"
            >
              {s.label}
            </Link>
          ))}
        </motion.nav>
      </motion.div>
    </section>
  );
}
