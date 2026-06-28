"use client";

import { useEffect, useRef } from "react";

/**
 * A full-viewport halftone dot grid drawn on a canvas. Dots are tiny and
 * faint at rest; near the pointer they swell, brighten and tint toward
 * the accent, so a soft spotlight of larger dots tracks the cursor. A
 * slow ambient wave keeps the field breathing when the pointer is idle.
 *
 * Sits behind everything (z-index -1, pointer-events none). Under
 * `prefers-reduced-motion` it renders a single static frame.
 */
export function DotField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const GAP = 30; // grid spacing in CSS px
    const BASE_R = 1; // resting dot radius
    const MAX_R = 4.5; // radius right under the pointer
    const REACH = 150; // pointer influence radius in CSS px

    // Theme-aware ink: faint at rest, accent-tinted under the pointer.
    const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const base = dark ? [205, 210, 235] : [40, 40, 70];
    const accent = dark ? [185, 150, 255] : [120, 80, 230];

    let w = 0;
    let h = 0;
    let dpr = 1;
    // Pointer starts off-screen so nothing is highlighted until it moves.
    const pointer = { x: -9999, y: -9999 };

    function resize() {
      if (!canvas || !ctx) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw(t: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      const reach2 = REACH * REACH;

      for (let y = GAP / 2; y < h; y += GAP) {
        for (let x = GAP / 2; x < w; x += GAP) {
          // Distance to pointer drives the swell/tint.
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const d2 = dx * dx + dy * dy;
          const prox = d2 < reach2 ? 1 - Math.sqrt(d2) / REACH : 0;

          // Slow diagonal wave so the field breathes when idle.
          const wave = reduce
            ? 0
            : 0.5 + 0.5 * Math.sin(x * 0.015 + y * 0.015 + t * 0.0012);

          const r = BASE_R + (MAX_R - BASE_R) * prox + wave * 0.6;
          const alpha = 0.12 + 0.55 * prox + wave * 0.06;

          const cr = Math.round(base[0] + (accent[0] - base[0]) * prox);
          const cg = Math.round(base[1] + (accent[1] - base[1]) * prox);
          const cb = Math.round(base[2] + (accent[2] - base[2]) * prox);

          ctx.beginPath();
          ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`;
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    let raf = 0;
    function loop(t: number) {
      draw(t);
      raf = requestAnimationFrame(loop);
    }

    function onPointerMove(e: PointerEvent) {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove);

    if (reduce) {
      draw(0); // one static frame
    } else {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
    />
  );
}
