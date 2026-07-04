import type { Article } from "@/types/article";
import type { Repo } from "@/types/repo";

/**
 * The gallery floor plan. Each character is one map cell; the legend below
 * maps characters to wall-texture ids (0 = walkable).
 *
 * Layout: a lobby in the south, a WORK gallery to the west, a WRITING
 * gallery to the east, and a JOURNEY corridor leading north to the ABOUT
 * room. The masthead (M) and the EXIT door to the classic edition (E) are
 * on the lobby's south wall.
 */
const ROWS = [
  "###########BK###########",
  "########=......=########",
  "########G......I########",
  "########X......Z########",
  "########=......=########",
  "##########A..+##########",
  "##########3..###########",
  "##########=..=##########",
  "###########..2##########",
  "##########=..=##########",
  "##########1..###########",
  "##d#e#####J..+#####j#k##",
  "a.....=..........=.....g",
  "#.....W..........R.....#",
  "b......................h",
  "#......................#",
  "c.....+..........+.....i",
  "#.....=..........=.....#",
  "###f#####+ME+#######l###",
  "########################",
] as const;

/** Wall texture ids. Poster ids are contiguous so they can be indexed. */
export const T = {
  PAPER: 1,
  RULED: 2,
  INK: 3,
  TRIM: 4,
  SIGN_WORK: 5,
  SIGN_WRITING: 6,
  SIGN_JOURNEY: 7,
  SIGN_ABOUT: 8,
  MASTHEAD: 9,
  REPO_0: 10, // ..15
  ARTICLE_0: 20, // ..25
  JOURNEY_0: 30, // ..32
  BIO: 33,
  SKILLS: 34,
  SOCIAL_0: 40, // ..43
  EXIT: 44,
} as const;

const LEGEND: Record<string, number> = {
  ".": 0,
  "#": T.PAPER,
  "=": T.RULED,
  "%": T.INK,
  "+": T.TRIM,
  W: T.SIGN_WORK,
  R: T.SIGN_WRITING,
  J: T.SIGN_JOURNEY,
  A: T.SIGN_ABOUT,
  M: T.MASTHEAD,
  a: T.REPO_0,
  b: T.REPO_0 + 1,
  c: T.REPO_0 + 2,
  d: T.REPO_0 + 3,
  e: T.REPO_0 + 4,
  f: T.REPO_0 + 5,
  g: T.ARTICLE_0,
  h: T.ARTICLE_0 + 1,
  i: T.ARTICLE_0 + 2,
  j: T.ARTICLE_0 + 3,
  k: T.ARTICLE_0 + 4,
  l: T.ARTICLE_0 + 5,
  "1": T.JOURNEY_0,
  "2": T.JOURNEY_0 + 1,
  "3": T.JOURNEY_0 + 2,
  B: T.BIO,
  K: T.SKILLS,
  G: T.SOCIAL_0,
  X: T.SOCIAL_0 + 1,
  I: T.SOCIAL_0 + 2,
  Z: T.SOCIAL_0 + 3,
  E: T.EXIT,
};

export const MAP_W = ROWS[0].length;
export const MAP_H = ROWS.length;

export const SPAWN = { x: 12.0, y: 15.5, ang: -Math.PI / 2 };

export function buildMapCells(): Uint8Array {
  const cells = new Uint8Array(MAP_W * MAP_H);
  for (let y = 0; y < MAP_H; y++) {
    const row = ROWS[y];
    if (row.length !== MAP_W) {
      throw new Error(`level row ${y} has length ${row.length}, want ${MAP_W}`);
    }
    for (let x = 0; x < MAP_W; x++) {
      const id = LEGEND[row.charAt(x)];
      if (id === undefined) {
        throw new Error(`level row ${y}: unknown cell '${row.charAt(x)}'`);
      }
      cells[y * MAP_W + x] = id;
    }
  }
  return cells;
}

export type Poi = {
  kind: "repo" | "article" | "social" | "exit" | "info";
  label: string;
  sub?: string;
  url?: string;
  /** Same-origin navigation (view transition) instead of a new tab. */
  internal?: boolean;
};

export type JourneyStop = {
  city: string;
  jp: string;
  label: string;
  note: string;
};

export type Social = { label: string; href: string };

/** Everything the level needs from the outside world, serializable. */
export type WorldData = {
  repos: Repo[];
  articles: Article[];
  journey: JourneyStop[];
  socials: Social[];
  intro: string;
  skills: string[];
  name: string;
  role: string;
  tagline: string;
};

/** Map wall-texture id → interaction target. */
export function buildPois(data: WorldData): Map<number, Poi> {
  const pois = new Map<number, Poi>();

  data.repos.slice(0, 6).forEach((repo, i) => {
    pois.set(T.REPO_0 + i, {
      kind: "repo",
      label: repo.name,
      sub: [repo.language, `★ ${repo.stargazers_count}`]
        .filter(Boolean)
        .join(" · "),
      url: repo.html_url,
    });
  });

  data.articles.slice(0, 6).forEach((article, i) => {
    pois.set(T.ARTICLE_0 + i, {
      kind: "article",
      label: article.title,
      sub: "Read on Zenn",
      url: article.link,
    });
  });

  data.journey.slice(0, 3).forEach((stop, i) => {
    pois.set(T.JOURNEY_0 + i, {
      kind: "info",
      label: `${stop.city} ${stop.jp} — ${stop.label}`,
      sub: stop.note,
    });
  });

  pois.set(T.BIO, { kind: "info", label: data.name, sub: data.intro });
  pois.set(T.SKILLS, {
    kind: "info",
    label: "Skills & Tools",
    sub: data.skills.join(" · "),
  });

  data.socials.slice(0, 4).forEach((social, i) => {
    pois.set(T.SOCIAL_0 + i, {
      kind: "social",
      label: social.label,
      sub: social.href.replace(/^https?:\/\//, ""),
      url: social.href,
    });
  });

  pois.set(T.EXIT, {
    kind: "exit",
    label: "Exit — Classic edition",
    sub: "Leave the gallery and read the print version",
    url: "/classic",
    internal: true,
  });

  return pois;
}
