"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { site } from "@/lib/site";

/* ------------------------------------------------------------------ *
 * ⌘K command palette — a keyboard-first launcher for the site. Open
 * with ⌘K / Ctrl+K (or the nav button, via the "open-command-palette"
 * event), search, navigate with ↑ ↓, run with Enter, close with Esc.
 * No dependencies beyond Motion, which the site already uses.
 * ------------------------------------------------------------------ */

type Item = {
  id: string;
  label: string;
  hint: string;
  group: "Navigate" | "Links" | "Actions";
  keywords: string;
  run: () => void;
};

function goTo(id: string) {
  const el = document.getElementById(id);
  if (el) {
    history.replaceState(null, "", `#${id}`);
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setIndex(0);
  }, []);

  const items = useMemo<Item[]>(() => {
    const nav: Item[] = [
      ["about", "About"],
      ["skills", "Skills & Tools"],
      ["work", "Selected Work"],
      ["writing", "Writing"],
    ].map(([id, label]) => ({
      id: `nav-${id}`,
      label: `Go to ${label}`,
      hint: "Section",
      group: "Navigate",
      keywords: `${label} ${id} jump scroll section`,
      run: () => {
        goTo(id);
        close();
      },
    }));

    const links: Item[] = site.socials.map((s) => ({
      id: `link-${s.label}`,
      label: `Open ${s.label}`,
      hint: "↗",
      group: "Links",
      keywords: `${s.label} social profile open external`,
      run: () => {
        window.open(s.href, "_blank", "noopener,noreferrer");
        close();
      },
    }));

    const actions: Item[] = [
      {
        id: "copy-url",
        label: "Copy link to this site",
        hint: "Clipboard",
        group: "Actions",
        keywords: "copy url link share clipboard address",
        run: () => {
          void navigator.clipboard?.writeText(site.url);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        },
      },
      {
        id: "top",
        label: "Back to top",
        hint: "Scroll",
        group: "Actions",
        keywords: "top start hero home scroll up",
        run: () => {
          window.scrollTo({ top: 0, behavior: "smooth" });
          history.replaceState(null, "", " ");
          close();
        },
      },
    ];

    return [...nav, ...links, ...actions];
  }, [close]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) =>
        it.label.toLowerCase().includes(q) ||
        it.keywords.toLowerCase().includes(q),
    );
  }, [items, query]);

  // global open shortcut + nav-button event
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-command-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-command-palette", onOpen);
    };
  }, []);

  // focus + scroll-lock while open
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 30);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prev;
    };
  }, [open]);

  function onInputKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      results[index]?.run();
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  }

  // flatten-with-headers for rendering, tracking the global result index
  let running = -1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <button
            type="button"
            aria-label="Close command palette"
            onClick={close}
            className="absolute inset-0 cursor-default bg-black/30 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="glass relative w-full max-w-xl overflow-hidden rounded-2xl shadow-2xl shadow-black/20"
          >
            <div className="flex items-center gap-3 border-b border-(--border) px-4">
              <span className="text-(--muted)" aria-hidden>
                ⌘
              </span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIndex(0);
                }}
                onKeyDown={onInputKey}
                placeholder="Type a command or search…"
                className="w-full bg-transparent py-4 text-base outline-none placeholder:text-(--muted)"
                autoComplete="off"
                spellCheck={false}
              />
              <kbd className="hidden rounded-md border border-(--border) px-1.5 py-0.5 font-mono text-[10px] text-(--muted) sm:block">
                ESC
              </kbd>
            </div>

            <div className="max-h-[52vh] overflow-y-auto p-2">
              {results.length === 0 && (
                <p className="px-3 py-8 text-center text-sm text-(--muted)">
                  No results for “{query}”.
                </p>
              )}

              {(["Navigate", "Links", "Actions"] as const).map((group) => {
                const groupItems = results.filter((r) => r.group === group);
                if (groupItems.length === 0) return null;
                return (
                  <div key={group} className="mb-1">
                    <p className="px-3 pb-1 pt-2 font-mono text-[10px] uppercase tracking-wider text-(--muted)">
                      {group}
                    </p>
                    {groupItems.map((it) => {
                      running += 1;
                      const selected = running === index;
                      const me = running;
                      return (
                        <button
                          key={it.id}
                          type="button"
                          onMouseMove={() => setIndex(me)}
                          onClick={it.run}
                          className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                            selected
                              ? "bg-(--color-accent) text-white"
                              : "text-(--fg) hover:bg-(--border)/50"
                          }`}
                        >
                          <span className="font-medium">{it.label}</span>
                          <span
                            className={`shrink-0 text-xs ${
                              selected ? "text-white/70" : "text-(--muted)"
                            }`}
                          >
                            {it.hint}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t border-(--border) px-4 py-2.5 text-[11px] text-(--muted)">
              <span className="flex items-center gap-2">
                <Key>↑</Key>
                <Key>↓</Key>
                to navigate
                <Key>↵</Key>
                to select
              </span>
              <span>{copied ? "Link copied ✓" : `${results.length} results`}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded-md border border-(--border) bg-(--card) px-1.5 py-0.5 font-mono text-[10px]">
      {children}
    </kbd>
  );
}
