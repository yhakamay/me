import { T, type WorldData } from "@/world/level";
import type { Article } from "@/types/article";
import type { Repo } from "@/types/repo";

export const TEX_SIZE = 256;
export const TEX_COUNT = 48;

const SERIF =
  '"Newsreader", Georgia, "Times New Roman", "Hiragino Mincho ProN", "Yu Mincho", serif';

export type Palette = {
  bg: string;
  fg: string;
  muted: string;
  rule: string;
  card: string;
  accent: string;
  dark: boolean;
};

export function readPalette(): Palette {
  const style = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) =>
    style.getPropertyValue(name).trim() || fallback;
  return {
    bg: v("--bg", "#f6f3ea"),
    fg: v("--fg", "#1c1a15"),
    muted: v("--muted", "#5b574c"),
    rule: v("--rule", "#d9d2c1"),
    card: v("--card", "#fbf9f2"),
    accent: v("--color-accent", "#7a3b1f"),
    dark: window.matchMedia("(prefers-color-scheme: dark)").matches,
  };
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full =
    h.length === 3 ? h.split("").map((c) => c + c).join("") : h.slice(0, 6);
  const n = parseInt(full, 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

/** Pack a CSS hex color as little-endian RGBA (the wasm layout). */
export function packColor(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return (r | (g << 8) | (b << 16)) >>> 0;
}

export function mixHex(a: string, b: string, t: number): string {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  const c = ca.map((v, i) => Math.round(v + (cb[i] - v) * t));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

// ------------------------------------------------------------------ helpers

type Ctx = CanvasRenderingContext2D;

/** Wrap text to a width; falls back to per-character breaks for CJK. */
function wrapText(ctx: Ctx, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = "";
  const push = () => {
    if (line) lines.push(line);
    line = "";
  };
  for (const word of text.split(/\s+/)) {
    if (!word) continue;
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      line = candidate;
      continue;
    }
    if (ctx.measureText(word).width <= maxWidth) {
      push();
      line = word;
      continue;
    }
    // Word longer than the line (or CJK without spaces): break by character.
    push();
    for (const ch of word) {
      if (ctx.measureText(line + ch).width > maxWidth) {
        push();
      }
      line += ch;
    }
  }
  push();
  return lines;
}

function drawLines(
  ctx: Ctx,
  lines: string[],
  x: number,
  y: number,
  lineHeight: number,
  maxLines: number
): number {
  const shown = lines.slice(0, maxLines);
  if (lines.length > maxLines && shown.length > 0) {
    shown[shown.length - 1] = shown[shown.length - 1].replace(/.{0,2}$/, "…");
  }
  for (const line of shown) {
    ctx.fillText(line, x, y);
    y += lineHeight;
  }
  return y;
}

function paper(ctx: Ctx, p: Palette, base?: string): void {
  // Flat paper — the film grain comes from the WebGPU pass, adding it here
  // too would alias into bright speckles when walls are minified.
  ctx.fillStyle = base ?? p.card;
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);
  // Cell edge so walls read as paneling.
  ctx.strokeStyle = p.rule;
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, TEX_SIZE - 2, TEX_SIZE - 2);
}

function doubleFrame(ctx: Ctx, p: Palette): void {
  ctx.strokeStyle = p.fg;
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, TEX_SIZE - 20, TEX_SIZE - 20);
  ctx.lineWidth = 1;
  ctx.strokeRect(16, 16, TEX_SIZE - 32, TEX_SIZE - 32);
}

function eyebrow(ctx: Ctx, p: Palette, text: string, x: number, y: number): void {
  ctx.fillStyle = p.accent;
  ctx.font = `600 12px ${SERIF}`;
  ctx.letterSpacing = "3px";
  ctx.fillText(text.toUpperCase(), x, y);
  ctx.letterSpacing = "0px";
}

function rule(ctx: Ctx, p: Palette, x1: number, x2: number, y: number): void {
  ctx.strokeStyle = p.rule;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x1, y + 0.5);
  ctx.lineTo(x2, y + 0.5);
  ctx.stroke();
}

// ------------------------------------------------------------------ painters

function paintPlain(ctx: Ctx, p: Palette): void {
  paper(ctx, p);
}

function paintRuled(ctx: Ctx, p: Palette): void {
  paper(ctx, p);
  ctx.strokeStyle = p.rule;
  ctx.lineWidth = 1;
  for (let y = 28; y < TEX_SIZE; y += 28) {
    ctx.beginPath();
    ctx.moveTo(14, y + 0.5);
    ctx.lineTo(TEX_SIZE - 14, y + 0.5);
    ctx.stroke();
  }
}

function paintInk(ctx: Ctx, p: Palette): void {
  ctx.fillStyle = p.fg;
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);
  ctx.strokeStyle = p.bg;
  ctx.lineWidth = 1;
  ctx.strokeRect(8, 8, TEX_SIZE - 16, TEX_SIZE - 16);
}

function paintTrim(ctx: Ctx, p: Palette): void {
  paper(ctx, p);
  ctx.strokeStyle = p.fg;
  ctx.lineWidth = 10;
  ctx.strokeRect(10, 10, TEX_SIZE - 20, TEX_SIZE - 20);
  ctx.fillStyle = p.accent;
  for (const [x, y] of [
    [22, 22],
    [TEX_SIZE - 30, 22],
    [22, TEX_SIZE - 30],
    [TEX_SIZE - 30, TEX_SIZE - 30],
  ]) {
    ctx.fillRect(x, y, 8, 8);
  }
}

function paintSign(
  ctx: Ctx,
  p: Palette,
  index: string,
  word: string
): void {
  paper(ctx, p);
  ctx.textAlign = "center";
  ctx.strokeStyle = p.fg;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(28, 78);
  ctx.lineTo(TEX_SIZE - 28, 78);
  ctx.moveTo(28, 178);
  ctx.lineTo(TEX_SIZE - 28, 178);
  ctx.stroke();

  ctx.fillStyle = p.muted;
  ctx.font = `600 13px ${SERIF}`;
  ctx.letterSpacing = "4px";
  ctx.fillText(`SECTION ${index}`, TEX_SIZE / 2, 66);
  ctx.letterSpacing = "0px";

  ctx.fillStyle = p.fg;
  let size = 44;
  ctx.font = `600 ${size}px ${SERIF}`;
  ctx.letterSpacing = "5px";
  while (ctx.measureText(word).width > TEX_SIZE - 56 && size > 22) {
    size -= 2;
    ctx.font = `600 ${size}px ${SERIF}`;
  }
  ctx.fillText(word, TEX_SIZE / 2, 140);
  ctx.letterSpacing = "0px";

  ctx.fillStyle = p.accent;
  ctx.font = `italic 500 15px ${SERIF}`;
  ctx.fillText("¶", TEX_SIZE / 2, 206);
  ctx.textAlign = "left";
}

function paintMasthead(ctx: Ctx, p: Palette, data: WorldData): void {
  paper(ctx, p);
  ctx.textAlign = "center";
  const cx = TEX_SIZE / 2;

  ctx.strokeStyle = p.fg;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(20, 34);
  ctx.lineTo(TEX_SIZE - 20, 34);
  ctx.stroke();

  ctx.fillStyle = p.fg;
  ctx.font = `600 38px ${SERIF}`;
  const [first, ...rest] = data.name.split(" ");
  ctx.fillText(first.toUpperCase(), cx, 88);
  ctx.fillText(rest.join(" ").toUpperCase(), cx, 130);

  ctx.fillStyle = p.muted;
  ctx.font = `italic 400 16px ${SERIF}`;
  drawLines(ctx, wrapText(ctx, data.tagline, TEX_SIZE - 60), cx, 166, 20, 2);

  rule(ctx, p, 40, TEX_SIZE - 40, 196);
  ctx.fillStyle = p.accent;
  ctx.font = `600 11px ${SERIF}`;
  ctx.letterSpacing = "3px";
  ctx.fillText("EST. FUKUOKA — TOKYO 2026", cx, 220);
  ctx.letterSpacing = "0px";
  ctx.textAlign = "left";
}

function paintExit(ctx: Ctx, p: Palette): void {
  paper(ctx, p);
  ctx.fillStyle = p.accent;
  ctx.fillRect(28, 28, TEX_SIZE - 56, TEX_SIZE - 56);
  ctx.fillStyle = p.dark ? p.fg : p.card;
  ctx.textAlign = "center";
  ctx.font = `600 52px ${SERIF}`;
  ctx.letterSpacing = "8px";
  ctx.fillText("EXIT", TEX_SIZE / 2, 120);
  ctx.letterSpacing = "1px";
  ctx.font = `500 16px ${SERIF}`;
  ctx.fillText("CLASSIC EDITION →", TEX_SIZE / 2, 158);
  ctx.letterSpacing = "0px";
  ctx.strokeStyle = p.dark ? p.fg : p.card;
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 40, TEX_SIZE - 80, TEX_SIZE - 80);
  ctx.textAlign = "left";
}

function paintRepoPoster(
  ctx: Ctx,
  p: Palette,
  repo: Repo | undefined,
  index: number
): void {
  paper(ctx, p);
  doubleFrame(ctx, p);
  const x = 30;
  if (!repo) {
    ctx.fillStyle = p.muted;
    ctx.font = `italic 400 18px ${SERIF}`;
    ctx.textAlign = "center";
    ctx.fillText("This wall awaits", TEX_SIZE / 2, 120);
    ctx.fillText("its next exhibit.", TEX_SIZE / 2, 146);
    ctx.textAlign = "left";
    return;
  }
  eyebrow(ctx, p, `Selected work · No.${index + 1}`, x, 52);
  rule(ctx, p, x, TEX_SIZE - 30, 64);

  ctx.fillStyle = p.fg;
  ctx.font = `600 27px ${SERIF}`;
  const titleEnd = drawLines(ctx, wrapText(ctx, repo.name, TEX_SIZE - 60), x, 98, 32, 2);

  ctx.fillStyle = p.muted;
  ctx.font = `400 15px ${SERIF}`;
  drawLines(
    ctx,
    wrapText(ctx, repo.description ?? "No description.", TEX_SIZE - 60),
    x,
    titleEnd + 8,
    20,
    4
  );

  rule(ctx, p, x, TEX_SIZE - 30, 208);
  ctx.fillStyle = p.fg;
  ctx.font = `500 14px ${SERIF}`;
  const meta = [repo.language, `★ ${repo.stargazers_count}`]
    .filter(Boolean)
    .join("  ·  ");
  ctx.fillText(meta, x, 230);
  ctx.fillStyle = p.accent;
  ctx.textAlign = "right";
  ctx.fillText("↗", TEX_SIZE - 30, 230);
  ctx.textAlign = "left";
}

function paintArticlePoster(
  ctx: Ctx,
  p: Palette,
  article: Article | undefined,
  index: number
): void {
  paper(ctx, p);
  doubleFrame(ctx, p);
  const x = 30;
  if (!article) {
    ctx.fillStyle = p.muted;
    ctx.font = `italic 400 18px ${SERIF}`;
    ctx.textAlign = "center";
    ctx.fillText("Unwritten.", TEX_SIZE / 2, 130);
    ctx.textAlign = "left";
    return;
  }
  eyebrow(ctx, p, `Writing · Zenn ${index + 1}`, x, 52);
  rule(ctx, p, x, TEX_SIZE - 30, 64);

  ctx.fillStyle = p.fg;
  ctx.font = `500 21px ${SERIF}`;
  drawLines(ctx, wrapText(ctx, article.title, TEX_SIZE - 60), x, 96, 28, 4);

  rule(ctx, p, x, TEX_SIZE - 30, 208);
  ctx.fillStyle = p.muted;
  ctx.font = `italic 400 14px ${SERIF}`;
  const date = article.pubDate
    ? new Date(article.pubDate).toISOString().slice(0, 10)
    : "";
  ctx.fillText(date, x, 230);
  ctx.fillStyle = p.accent;
  ctx.textAlign = "right";
  ctx.fillText("↗", TEX_SIZE - 30, 230);
  ctx.textAlign = "left";
}

function paintJourneyMural(
  ctx: Ctx,
  p: Palette,
  data: WorldData,
  index: number
): void {
  const stop = data.journey[index];
  paper(ctx, p);
  doubleFrame(ctx, p);
  if (!stop) return;
  ctx.textAlign = "center";
  const cx = TEX_SIZE / 2;

  eyebrow(ctx, p, `Chapter ${index + 1} · ${stop.label}`, cx, 48);
  // eyebrow() uses left alignment metrics but we set center — recenter:
  ctx.fillStyle = p.fg;
  ctx.font = `600 74px ${SERIF}`;
  ctx.fillText(stop.jp, cx, 138);

  ctx.font = `600 16px ${SERIF}`;
  ctx.letterSpacing = "5px";
  ctx.fillText(stop.city.toUpperCase(), cx, 168);
  ctx.letterSpacing = "0px";

  ctx.fillStyle = p.muted;
  ctx.font = `italic 400 13px ${SERIF}`;
  drawLines(ctx, wrapText(ctx, stop.note, TEX_SIZE - 64), cx, 194, 17, 3);
  ctx.textAlign = "left";
}

function paintBio(ctx: Ctx, p: Palette, data: WorldData): void {
  paper(ctx, p);
  doubleFrame(ctx, p);
  const x = 30;
  eyebrow(ctx, p, "About the author", x, 52);
  rule(ctx, p, x, TEX_SIZE - 30, 64);
  ctx.fillStyle = p.fg;
  ctx.font = `400 15px ${SERIF}`;
  drawLines(ctx, wrapText(ctx, data.intro, TEX_SIZE - 60), x, 92, 21, 6);
  ctx.fillStyle = p.accent;
  ctx.font = `italic 500 16px ${SERIF}`;
  ctx.fillText(`— ${data.name.split(" ")[0]}`, x, 228);
}

function paintSkills(ctx: Ctx, p: Palette, data: WorldData): void {
  paper(ctx, p);
  doubleFrame(ctx, p);
  const x = 30;
  eyebrow(ctx, p, "Skills & tools", x, 52);
  rule(ctx, p, x, TEX_SIZE - 30, 64);
  ctx.fillStyle = p.fg;
  ctx.font = `500 17px ${SERIF}`;
  let y = 94;
  for (const skill of data.skills.slice(0, 8)) {
    ctx.fillStyle = p.accent;
    ctx.fillText("·", x, y);
    ctx.fillStyle = p.fg;
    ctx.fillText(skill, x + 16, y);
    y += 21;
  }
}

function paintSocial(
  ctx: Ctx,
  p: Palette,
  data: WorldData,
  index: number
): void {
  const social = data.socials[index];
  paper(ctx, p);
  doubleFrame(ctx, p);
  if (!social) return;
  const x = 30;
  eyebrow(ctx, p, "Elsewhere", x, 52);
  rule(ctx, p, x, TEX_SIZE - 30, 64);
  ctx.fillStyle = p.fg;
  ctx.font = `600 36px ${SERIF}`;
  ctx.fillText(social.label, x, 130);
  ctx.fillStyle = p.muted;
  ctx.font = `400 14px ${SERIF}`;
  drawLines(
    ctx,
    wrapText(ctx, social.href.replace(/^https?:\/\//, ""), TEX_SIZE - 60),
    x,
    160,
    18,
    2
  );
  ctx.fillStyle = p.accent;
  ctx.font = `600 44px ${SERIF}`;
  ctx.textAlign = "right";
  ctx.fillText("↗", TEX_SIZE - 32, 226);
  ctx.textAlign = "left";
}

// ------------------------------------------------------------------ atlas

/**
 * Paint every wall texture and copy the pixels into the wasm atlas.
 * `atlas` is a Uint8Array view over the wasm texture memory.
 */
export async function buildAtlas(
  atlas: Uint8Array,
  data: WorldData,
  p: Palette
): Promise<void> {
  // Make sure the serif face is available to the canvas before painting.
  try {
    await Promise.all([
      document.fonts.load(`600 44px ${SERIF}`),
      document.fonts.load(`italic 400 16px ${SERIF}`),
      document.fonts.ready,
    ]);
  } catch {
    // Fonts API unavailable — system serif fallback is fine.
  }

  const canvas = document.createElement("canvas");
  canvas.width = TEX_SIZE;
  canvas.height = TEX_SIZE;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("2d context unavailable");

  const painters = new Map<number, (c: Ctx) => void>([
    [T.PAPER, (c) => paintPlain(c, p)],
    [T.RULED, (c) => paintRuled(c, p)],
    [T.INK, (c) => paintInk(c, p)],
    [T.TRIM, (c) => paintTrim(c, p)],
    [T.SIGN_WORK, (c) => paintSign(c, p, "04", "WORK")],
    [T.SIGN_WRITING, (c) => paintSign(c, p, "05", "WRITING")],
    [T.SIGN_JOURNEY, (c) => paintSign(c, p, "02", "JOURNEY")],
    [T.SIGN_ABOUT, (c) => paintSign(c, p, "01", "ABOUT")],
    [T.MASTHEAD, (c) => paintMasthead(c, p, data)],
    [T.EXIT, (c) => paintExit(c, p)],
    [T.BIO, (c) => paintBio(c, p, data)],
    [T.SKILLS, (c) => paintSkills(c, p, data)],
  ]);
  for (let i = 0; i < 6; i++) {
    painters.set(T.REPO_0 + i, (c) => paintRepoPoster(c, p, data.repos[i], i));
    painters.set(T.ARTICLE_0 + i, (c) =>
      paintArticlePoster(c, p, data.articles[i], i)
    );
  }
  for (let i = 0; i < 3; i++) {
    painters.set(T.JOURNEY_0 + i, (c) => paintJourneyMural(c, p, data, i));
  }
  for (let i = 0; i < 4; i++) {
    painters.set(T.SOCIAL_0 + i, (c) => paintSocial(c, p, data, i));
  }

  const bytesPerTex = TEX_SIZE * TEX_SIZE * 4;
  for (let id = 1; id <= TEX_COUNT; id++) {
    const painter = painters.get(id) ?? ((c: Ctx) => paintPlain(c, p));
    ctx.save();
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    painter(ctx);
    ctx.restore();
    const pixels = ctx.getImageData(0, 0, TEX_SIZE, TEX_SIZE).data;
    atlas.set(pixels, (id - 1) * bytesPerTex);
  }
}
