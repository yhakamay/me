"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ------------------------------------------------------------------ *
 * A dependency-free, line-art ("線画風") interactive 3D map of
 * Nakano-ku, Tokyo — the ward I live in. Drag to orbit, it idles with a
 * slow auto-rotation. Every structure is rendered as monochrome
 * wireframe except Nakano-shimbashi Station (中野新橋駅), which is marked
 * in red.
 *
 * The whole thing is a tiny hand-rolled 3D engine: points live in model
 * space, get rotated (yaw + pitch) and perspective-projected to 2D, then
 * drawn as SVG paths. Geometry is generated deterministically so server
 * and client renders match (no hydration mismatch).
 * ------------------------------------------------------------------ */

type Vec3 = [number, number, number];
type Seg = [Vec3, Vec3];

const RED = "oklch(0.62 0.25 27)";

const VIEW_W = 820;
const VIEW_H = 470;
const FOCAL = 640;
const CAM_DIST = 560;
const Y_OFFSET = 18;

/* Stylized Nakano-ku outline (x = east, z = north, y = up). Loosely
 * traces the ward's elongated east–west footprint. */
const BOUNDARY: Vec3[] = [
  [-150, 0, -34],
  [-104, 0, -58],
  [-44, 0, -66],
  [22, 0, -60],
  [86, 0, -70],
  [138, 0, -42],
  [150, 0, 6],
  [112, 0, 48],
  [44, 0, 62],
  [-22, 0, 58],
  [-78, 0, 66],
  [-132, 0, 44],
  [-152, 0, 6],
];

/* Rail lines as polylines, drawn just above the ground plane. */
const RAILS: Vec3[][] = [
  // JR Chuo / Sobu line — runs east–west across the north
  [
    [-140, 2, -30],
    [-72, 2, -26],
    [-12, 2, -22],
    [54, 2, -28],
    [134, 2, -34],
  ],
  // Tokyo Metro Marunouchi line, Honancho branch — through the south
  [
    [70, 2, 16],
    [40, 2, 24],
    [6, 2, 33],
    [-32, 2, 41],
    [-78, 2, 48],
  ],
];

/* Kanda River (神田川) — Nakano-shimbashi ("new bridge") sits on it. */
const RIVER: Vec3[] = [
  [96, 0.6, 30],
  [58, 0.6, 30],
  [22, 0.6, 36],
  [-6, 0.6, 40],
  [-36, 0.6, 38],
  [-70, 0.6, 44],
  [-104, 0.6, 52],
];

type Station = {
  name: string;
  jp: string;
  pos: [number, number]; // x, z
  size: number;
  height: number;
  special?: boolean;
};

const STATIONS: Station[] = [
  { name: "Nakano", jp: "中野", pos: [-12, -22], size: 11, height: 26 },
  { name: "Nakano-sakaue", jp: "中野坂上", pos: [40, 24], size: 9, height: 22 },
  {
    name: "Nakano-shimbashi",
    jp: "中野新橋",
    pos: [6, 33],
    size: 11,
    height: 40,
    special: true,
  },
  { name: "Nakano-fujimicho", jp: "中野富士見町", pos: [-32, 41], size: 9, height: 20 },
  { name: "Honancho", jp: "方南町", pos: [-78, 48], size: 9, height: 20 },
];

/* ---- geometry helpers -------------------------------------------- */

function boxEdges(cx: number, cz: number, w: number, d: number, h: number): Seg[] {
  const x0 = cx - w;
  const x1 = cx + w;
  const z0 = cz - d;
  const z1 = cz + d;
  const b: Vec3[] = [
    [x0, 0, z0],
    [x1, 0, z0],
    [x1, 0, z1],
    [x0, 0, z1],
  ];
  const t: Vec3[] = b.map(([x, , z]) => [x, h, z]);
  const segs: Seg[] = [];
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4;
    segs.push([b[i], b[j]]); // base rectangle
    segs.push([t[i], t[j]]); // top rectangle
    segs.push([b[i], t[i]]); // vertical edge
  }
  return segs;
}

function pointInPolygon(x: number, z: number, poly: Vec3[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, , zi] = poly[i];
    const [xj, , zj] = poly[j];
    const hit = zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi;
    if (hit) inside = !inside;
  }
  return inside;
}

// Tiny deterministic PRNG so the scattered cityscape is stable.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---- the static scene (built once) ------------------------------- */

function buildScene() {
  const boundary: Seg[] = [];
  for (let i = 0; i < BOUNDARY.length; i++) {
    boundary.push([BOUNDARY[i], BOUNDARY[(i + 1) % BOUNDARY.length]]);
  }

  // faint ground grid, clipped to the ward outline
  const grid: Seg[] = [];
  for (let gx = -150; gx <= 150; gx += 26) {
    let prev: Vec3 | null = null;
    for (let gz = -70; gz <= 70; gz += 7) {
      const here: Vec3 = [gx, 0, gz];
      const inHere = pointInPolygon(gx, gz, BOUNDARY);
      if (prev && inHere && pointInPolygon(gx, gz - 7, BOUNDARY)) {
        grid.push([prev, here]);
      }
      prev = inHere ? here : null;
    }
  }
  for (let gz = -70; gz <= 70; gz += 26) {
    let prev: Vec3 | null = null;
    for (let gx = -150; gx <= 150; gx += 7) {
      const here: Vec3 = [gx, 0, gz];
      const inHere = pointInPolygon(gx, gz, BOUNDARY);
      if (prev && inHere && pointInPolygon(gx - 7, gz, BOUNDARY)) {
        grid.push([prev, here]);
      }
      prev = inHere ? here : null;
    }
  }

  // scattered wireframe buildings — the cityscape
  const rand = mulberry32(20231101);
  const buildings: Seg[] = [];
  let placed = 0;
  let guard = 0;
  while (placed < 30 && guard < 800) {
    guard++;
    const x = -150 + rand() * 300;
    const z = -68 + rand() * 132;
    if (!pointInPolygon(x, z, BOUNDARY)) continue;
    // keep buildings clear of the highlighted station
    const dn = Math.hypot(x - 6, z - 33);
    if (dn < 18) continue;
    const w = 4 + rand() * 7;
    const d = 4 + rand() * 7;
    const h = 7 + rand() * 26;
    buildings.push(...boxEdges(x, z, w, d, h));
    placed++;
  }

  // station structures
  const stationEdges: Seg[] = [];
  const specialEdges: Seg[] = [];
  for (const s of STATIONS) {
    const edges = boxEdges(s.pos[0], s.pos[1], s.size, s.size, s.height);
    if (s.special) specialEdges.push(...edges);
    else stationEdges.push(...edges);
  }

  // a red pillar + ground ring to draw the eye to Nakano-shimbashi
  const sx = STATIONS.find((s) => s.special)!.pos[0];
  const sz = STATIONS.find((s) => s.special)!.pos[1];
  const sh = STATIONS.find((s) => s.special)!.height;
  specialEdges.push([
    [sx, sh, sz],
    [sx, sh + 30, sz],
  ]);
  const ring: Vec3[] = [];
  for (let i = 0; i <= 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    ring.push([sx + Math.cos(a) * 20, 0.4, sz + Math.sin(a) * 20]);
  }

  return { boundary, grid, buildings, stationEdges, specialEdges, ring };
}

/* ---- projection -------------------------------------------------- */

function makeProject(yaw: number, pitch: number) {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const cx = Math.cos(pitch);
  const sx = Math.sin(pitch);
  return function project([px, py, pz]: Vec3) {
    // yaw around Y
    const x1 = px * cy + pz * sy;
    const z1 = -px * sy + pz * cy;
    // pitch around X
    const y2 = py * cx - z1 * sx;
    const z2 = py * sx + z1 * cx;
    const zc = z2 + CAM_DIST;
    const scale = FOCAL / zc;
    return {
      x: VIEW_W / 2 + x1 * scale,
      y: VIEW_H / 2 - y2 * scale - Y_OFFSET,
      z: zc,
    };
  };
}

function segPath(segs: Seg[], project: ReturnType<typeof makeProject>) {
  let d = "";
  for (const [a, b] of segs) {
    const pa = project(a);
    const pb = project(b);
    d += `M${pa.x.toFixed(1)} ${pa.y.toFixed(1)}L${pb.x.toFixed(1)} ${pb.y.toFixed(1)}`;
  }
  return d;
}

function linePath(pts: Vec3[], project: ReturnType<typeof makeProject>) {
  return pts
    .map((p, i) => {
      const pr = project(p);
      return `${i === 0 ? "M" : "L"}${pr.x.toFixed(1)} ${pr.y.toFixed(1)}`;
    })
    .join("");
}

/* ---- component --------------------------------------------------- */

export function NakanoMap() {
  const scene = useMemo(() => buildScene(), []);
  const [yaw, setYaw] = useState(-0.5);
  const [pitch, setPitch] = useState(0.62);

  const drag = useRef<{ x: number; y: number } | null>(null);
  const dragging = useRef(false);

  // idle auto-rotation (respects reduced-motion)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    let raf = 0;
    const tick = () => {
      if (!dragging.current) {
        setYaw((y) => y + 0.0024);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  function onPointerDown(e: React.PointerEvent<SVGSVGElement>) {
    dragging.current = true;
    drag.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!dragging.current || !drag.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    drag.current = { x: e.clientX, y: e.clientY };
    setYaw((y) => y + dx * 0.006);
    setPitch((p) => Math.min(1.15, Math.max(0.12, p + dy * 0.005)));
  }
  function onPointerUp(e: React.PointerEvent<SVGSVGElement>) {
    dragging.current = false;
    drag.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  const project = makeProject(yaw, pitch);

  const labels = STATIONS.map((s) => {
    const p = project([s.pos[0], s.height + 8, s.pos[1]]);
    return { ...s, sx: p.x, sy: p.y, sz: p.z };
  }).sort((a, b) => b.sz - a.sz);

  return (
    <div className="glass overflow-hidden rounded-3xl">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-(--border) px-5 py-3">
        <div>
          <p className="text-sm font-semibold tracking-tight">中野区 · Nakano-ku</p>
          <p className="text-xs text-(--muted)">The ward I call home, Tokyo</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-(--muted)">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: RED }}
          />
          中野新橋駅
        </div>
      </div>

      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="block w-full cursor-grab touch-none select-none active:cursor-grabbing"
        style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        role="img"
        aria-label="Interactive 3D line-art map of Nakano-ku, Tokyo, with Nakano-shimbashi Station marked in red."
      >
        {/* faint ground grid */}
        <path
          d={segPath(scene.grid, project)}
          fill="none"
          stroke="var(--border)"
          strokeWidth={1}
        />
        {/* ward boundary */}
        <path
          d={segPath(scene.boundary, project)}
          fill="none"
          stroke="var(--fg)"
          strokeWidth={1.6}
          strokeOpacity={0.5}
          strokeLinejoin="round"
        />
        {/* Kanda river */}
        <path
          d={linePath(RIVER, project)}
          fill="none"
          stroke="var(--color-accent-2)"
          strokeWidth={1.4}
          strokeOpacity={0.6}
          strokeLinecap="round"
        />
        {/* rail lines */}
        {RAILS.map((line, i) => (
          <path
            key={i}
            d={linePath(line, project)}
            fill="none"
            stroke="var(--muted)"
            strokeWidth={1.6}
            strokeDasharray="2 4"
            strokeLinecap="round"
          />
        ))}
        {/* cityscape buildings */}
        <path
          d={segPath(scene.buildings, project)}
          fill="none"
          stroke="var(--fg)"
          strokeWidth={1}
          strokeOpacity={0.32}
          strokeLinejoin="round"
        />
        {/* ordinary stations */}
        <path
          d={segPath(scene.stationEdges, project)}
          fill="none"
          stroke="var(--fg)"
          strokeWidth={1.2}
          strokeOpacity={0.7}
          strokeLinejoin="round"
        />
        {/* Nakano-shimbashi — the red mark */}
        <path
          d={segPath(scene.ring.slice(0, -1).map((p, i) => [p, scene.ring[i + 1]]), project)}
          fill="none"
          stroke={RED}
          strokeWidth={1.4}
          strokeOpacity={0.7}
        />
        <path
          d={segPath(scene.specialEdges, project)}
          fill="none"
          stroke={RED}
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* station labels (depth-sorted) */}
        {labels.map((l) => (
          <g key={l.name}>
            <circle
              cx={l.sx}
              cy={l.sy}
              r={l.special ? 3 : 2}
              fill={l.special ? RED : "var(--muted)"}
            />
            <text
              x={l.sx + 6}
              y={l.sy - 4}
              fontSize={l.special ? 15 : 11}
              fontWeight={l.special ? 700 : 500}
              fill={l.special ? RED : "var(--muted)"}
              className="font-sans"
            >
              {l.jp}
            </text>
            {l.special && (
              <text
                x={l.sx + 6}
                y={l.sy + 11}
                fontSize={9}
                fill={RED}
                fillOpacity={0.8}
                className="font-mono"
              >
                Nakano-shimbashi Stn.
              </text>
            )}
          </g>
        ))}
      </svg>

      <p className="px-5 py-3 text-xs text-(--muted)">
        ドラッグで回転 · Drag to orbit
      </p>
    </div>
  );
}
