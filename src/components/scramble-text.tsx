"use client";

import { useEffect, useRef, useState } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#%&*<>/";

type ScrambleTextProps = {
  /** The final, settled text. */
  text: string;
  className?: string;
  /** Decode duration in ms. */
  duration?: number;
  /** Re-run the decode whenever the pointer enters. */
  scrambleOnHover?: boolean;
};

/**
 * Kinetic "decode" typography: the text lands scrambled and resolves
 * left-to-right into the real characters, like a terminal coming online.
 * Hovering re-runs it. Honours `prefers-reduced-motion`.
 */
export function ScrambleText({
  text,
  className,
  duration = 1000,
  scrambleOnHover = true,
}: ScrambleTextProps) {
  const [display, setDisplay] = useState(text);
  const [runId, setRunId] = useState(0);
  const frame = useRef<number>(0);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      // `display` already initialises to `text`; nothing to animate.
      return;
    }

    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      // Ease the reveal so it accelerates as it settles.
      const revealed = Math.floor(p * p * text.length);
      let out = "";
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch === " ") {
          out += " ";
        } else if (i < revealed) {
          out += ch;
        } else {
          out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
      }
      setDisplay(out);
      if (p < 1) {
        frame.current = requestAnimationFrame(tick);
      } else {
        setDisplay(text);
      }
    };

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [text, duration, runId]);

  return (
    <span
      className={className}
      aria-label={text}
      onMouseEnter={scrambleOnHover ? () => setRunId((n) => n + 1) : undefined}
    >
      <span aria-hidden>{display}</span>
    </span>
  );
}
