"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";

import { Magnetic } from "@/components/magnetic";
import { ScrambleText } from "@/components/scramble-text";
import { EASE_OUT_SOFT } from "@/lib/motion";
import { site } from "@/lib/site";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
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
      className="relative flex min-h-[92vh] flex-col justify-center"
    >
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col items-start gap-6"
      >
        <motion.div variants={item} className="relative">
          <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-(--color-accent) via-(--color-accent-2) to-(--color-accent-3) opacity-60 blur-lg" />
          <Image
            src="/yhakamay.webp"
            alt={site.name}
            width={80}
            height={80}
            unoptimized
            className="relative h-16 w-16 rounded-full border border-(--border) object-cover sm:h-20 sm:w-20"
          />
        </motion.div>

        <motion.div
          variants={item}
          className="liquid inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-(--muted)"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--color-accent-2) opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-(--color-accent-2)" />
          </span>
          {site.role}
        </motion.div>

        <motion.h1
          variants={item}
          className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
        >
          Hi, I&apos;m <ScrambleText text={site.name} className="gradient-text" />.
          <br />
          {site.tagline}
        </motion.h1>

        <motion.p
          variants={item}
          className="max-w-2xl text-balance text-base leading-relaxed text-(--muted) sm:text-lg"
        >
          {site.intro}
        </motion.p>

        <motion.div variants={item} className="flex flex-wrap items-center gap-3">
          {site.socials.map((s) => (
            <Magnetic key={s.label}>
              <Link
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="liquid group rounded-full px-4 py-2 text-sm font-medium transition-shadow hover:shadow-lg hover:shadow-black/5"
              >
                {s.label}
                <span className="ml-1 inline-block text-(--muted) transition-transform group-hover:translate-x-0.5">
                  ↗
                </span>
              </Link>
            </Magnetic>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="pointer-events-none absolute bottom-6 left-0 flex items-center gap-2 text-xs text-(--muted)"
      >
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        >
          ↓
        </motion.span>
        scroll
      </motion.div>
    </section>
  );
}
