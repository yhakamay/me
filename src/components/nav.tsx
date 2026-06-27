"use client";

import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "motion/react";
import { useState } from "react";

import { site } from "@/lib/site";

const links = [
  { label: "About", href: "#about" },
  { label: "Journey", href: "#journey" },
  { label: "Skills", href: "#skills" },
  { label: "Work", href: "#work" },
  { label: "Writing", href: "#writing" },
];

export function Nav() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
    >
      <nav
        className={`flex w-full max-w-3xl items-center justify-between rounded-full px-5 py-2.5 transition-all duration-300 ${
          scrolled ? "glass shadow-lg shadow-black/5" : "bg-transparent"
        }`}
      >
        <Link href="#top" className="group flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-(--color-accent) to-(--color-accent-2) text-xs font-bold text-white">
            y
          </span>
          <span className="text-sm font-medium tracking-tight">
            {site.handle}
          </span>
        </Link>
        <div className="hidden items-center gap-1 sm:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-1.5 text-sm text-(--muted) transition-colors hover:bg-(--border) hover:text-(--fg)"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              window.dispatchEvent(new Event("open-command-palette"))
            }
            aria-label="Open command palette"
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm text-(--muted) transition-colors hover:bg-(--border) hover:text-(--fg)"
          >
            <span className="hidden sm:inline">Search</span>
            <kbd className="rounded border border-(--border) px-1.5 py-0.5 font-mono text-[10px]">
              ⌘K
            </kbd>
          </button>
          <Link
            href={site.contact}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-(--fg) px-4 py-1.5 text-sm font-medium text-(--bg) transition-opacity hover:opacity-85"
          >
            Contact
          </Link>
        </div>
      </nav>
    </motion.header>
  );
}
