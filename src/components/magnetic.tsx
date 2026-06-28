"use client";

import { useRef, type ReactNode } from "react";

type MagneticProps = {
  children: ReactNode;
  /** How strongly the element leans toward the cursor (0–1-ish). */
  strength?: number;
  className?: string;
};

/**
 * Wraps an interactive element so it magnetically leans toward the
 * cursor while hovered and springs back on leave. Inline-block so it
 * keeps its place in a flex/inline flow. Disabled under
 * `prefers-reduced-motion`.
 */
export function Magnetic({ children, strength = 0.35, className }: MagneticProps) {
  const ref = useRef<HTMLSpanElement>(null);

  function reduced() {
    return (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function onMouseMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el || reduced()) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  }

  function onMouseLeave() {
    const el = ref.current;
    if (el) el.style.transform = "";
  }

  return (
    <span
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={className}
      style={{
        display: "inline-block",
        transition: "transform 0.3s var(--ease-out-soft)",
        willChange: "transform",
      }}
    >
      {children}
    </span>
  );
}
