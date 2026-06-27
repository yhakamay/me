"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

import { EASE_OUT_SOFT } from "@/lib/motion";
import { site } from "@/lib/site";

/* ------------------------------------------------------------------ *
 * "Places that made me" — an interactive flight-map of the three
 * cities that shaped me: Fukuoka → Shanghai → Tokyo. Cities are placed
 * by their real longitude/latitude on a graticule, connected by arcing
 * routes with travelling comets. The story panel auto-cycles through
 * each stop; hovering pauses it, clicking a stop pins it.
 * ------------------------------------------------------------------ */

const VIEW_W = 620;
const VIEW_H = 440;

// Geographic bounding box of the map (covers East Asia: China coast → Japan).
const LON_MIN = 118;
const LON_MAX = 143;
const LAT_MIN = 28.5;
const LAT_MAX = 38;

function project(lon: number, lat: number) {
  const x = ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * VIEW_W;
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * VIEW_H;
  return { x, y };
}

const stops = site.journey.map((s) => ({
  ...s,
  ...project(s.coord[0], s.coord[1]),
}));

// Quadratic arc between two points, bowed toward the top.
function arc(
  a: { x: number; y: number },
  b: { x: number; y: number },
): { d: string; cx: number; cy: number } {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dist = Math.hypot(b.x - a.x, b.y - a.y);
  const cx = mx;
  const cy = my - dist * 0.32; // lift the control point
  return { d: `M${a.x} ${a.y} Q${cx} ${cy} ${b.x} ${b.y}`, cx, cy };
}

const legs = stops.slice(0, -1).map((s, i) => arc(s, stops[i + 1]));

export function Journey() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setActive((a) => (a + 1) % stops.length);
    }, 3600);
    return () => clearInterval(id);
  }, [paused]);

  const current = site.journey[active];

  return (
    <div
      className="grid gap-6 lg:grid-cols-5"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ---- the map ---- */}
      <div className="glass overflow-hidden rounded-3xl lg:col-span-3">
        <div className="flex items-center justify-between border-b border-(--border) px-5 py-3">
          <p className="font-mono text-xs tracking-wider text-(--muted)">
            EAST ASIA · 福岡 → 上海 → 東京
          </p>
          <p className="font-mono text-xs text-(--muted)">
            {current.coord[1].toFixed(1)}°N {current.coord[0].toFixed(1)}°E
          </p>
        </div>

        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="block w-full"
          style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}
          role="img"
          aria-label="Map of Fukuoka, Shanghai and Tokyo connected by travel routes."
        >
          {/* graticule */}
          <g stroke="var(--border)" strokeWidth={1}>
            {Array.from({ length: 6 }, (_, i) => {
              const x = (VIEW_W / 5) * i;
              return <line key={`v${i}`} x1={x} y1={0} x2={x} y2={VIEW_H} />;
            })}
            {Array.from({ length: 5 }, (_, i) => {
              const y = (VIEW_H / 4) * i;
              return <line key={`h${i}`} x1={0} y1={y} x2={VIEW_W} y2={y} />;
            })}
          </g>
          {/* dotted texture at intersections */}
          <g fill="var(--border)">
            {Array.from({ length: 6 }).flatMap((_, c) =>
              Array.from({ length: 5 }).map((__, r) => (
                <circle
                  key={`d${c}-${r}`}
                  cx={(VIEW_W / 5) * c}
                  cy={(VIEW_H / 4) * r}
                  r={1.4}
                />
              )),
            )}
          </g>

          {/* routes */}
          {legs.map((leg, i) => (
            <path
              key={`leg${i}`}
              id={`leg-${i}`}
              d={leg.d}
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth={1.6}
              strokeOpacity={0.55}
              strokeDasharray="3 5"
              strokeLinecap="round"
            />
          ))}
          {/* travelling comets along each route */}
          {legs.map((_, i) => (
            <circle key={`comet${i}`} r={3} fill="var(--color-accent)">
              <animateMotion dur="3s" begin={`${i * 1.5}s`} repeatCount="indefinite">
                <mpath href={`#leg-${i}`} />
              </animateMotion>
            </circle>
          ))}

          {/* city markers */}
          {stops.map((s, i) => {
            const on = i === active;
            return (
              <g
                key={s.city}
                className="cursor-pointer"
                onClick={() => setActive(i)}
              >
                {on && (
                  <motion.circle
                    cx={s.x}
                    cy={s.y}
                    fill="none"
                    stroke="var(--color-accent)"
                    strokeWidth={1.5}
                    initial={{ r: 6, opacity: 0.7 }}
                    animate={{ r: 22, opacity: 0 }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                  />
                )}
                <circle
                  cx={s.x}
                  cy={s.y}
                  r={on ? 6 : 4}
                  fill={on ? "var(--color-accent)" : "var(--bg)"}
                  stroke="var(--color-accent)"
                  strokeWidth={1.8}
                  className="transition-all"
                />
                <text
                  x={s.x + 11}
                  y={s.y + 4}
                  fontSize={14}
                  fontWeight={on ? 700 : 500}
                  fill={on ? "var(--fg)" : "var(--muted)"}
                  className="select-none transition-colors"
                >
                  {s.jp}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* ---- story panel ---- */}
      <div className="flex flex-col justify-between gap-4 lg:col-span-2">
        <div className="flex flex-col gap-2">
          {site.journey.map((s, i) => (
            <button
              key={s.city}
              type="button"
              onClick={() => setActive(i)}
              className={`group flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all ${
                i === active
                  ? "glass border-(--border)"
                  : "border-transparent hover:bg-(--border)/40"
              }`}
            >
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold transition-colors ${
                  i === active
                    ? "bg-(--color-accent) text-white"
                    : "bg-(--border) text-(--muted)"
                }`}
              >
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold tracking-tight">
                  {s.city}{" "}
                  <span className="font-normal text-(--muted)">{s.jp}</span>
                </span>
                <span className="block text-xs text-(--muted)">{s.label}</span>
              </span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: EASE_OUT_SOFT }}
            className="text-balance text-sm leading-relaxed text-(--muted)"
          >
            {current.note}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
