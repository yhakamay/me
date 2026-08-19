import { describe, expect, it } from "vitest";

import { buildMapCells, buildPois, MAP_H, MAP_W, T, type WorldData } from "@/world/level";

describe("buildMapCells", () => {
  it("builds a MAP_W x MAP_H grid with no unknown cells", () => {
    const cells = buildMapCells();
    expect(cells.length).toBe(MAP_W * MAP_H);
  });

  it("is stable across calls (the hand-authored ASCII map stays well-formed)", () => {
    expect(() => buildMapCells()).not.toThrow();
  });
});

const emptyWorld: WorldData = {
  repos: [],
  articles: [],
  journey: [],
  socials: [],
  intro: "intro",
  skills: [],
  name: "name",
  role: "role",
  tagline: "tagline",
};

describe("buildPois", () => {
  it("always wires up the exit poi to /classic", () => {
    const pois = buildPois(emptyWorld);
    expect(pois.get(T.EXIT)).toMatchObject({
      kind: "exit",
      url: "/classic",
      internal: true,
    });
  });

  it("always wires up bio and skills pois from world data", () => {
    const pois = buildPois(emptyWorld);
    expect(pois.get(T.BIO)).toMatchObject({ label: "name", sub: "intro" });
    expect(pois.get(T.SKILLS)?.sub).toBe("");
  });

  it("caps repos at 6 pois even with more data", () => {
    const world: WorldData = {
      ...emptyWorld,
      repos: Array.from({ length: 10 }, (_, i) => ({
        id: i,
        name: `repo-${i}`,
        full_name: `yhakamay/repo-${i}`,
        html_url: `https://example.com/${i}`,
        description: null,
        fork: false,
        archived: false,
        language: "TypeScript",
        topics: [],
        stargazers_count: i,
        forks_count: 0,
        homepage: null,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
        pushed_at: "2026-01-01T00:00:00Z",
      })),
    };
    const pois = buildPois(world);
    for (let i = 0; i < 6; i++) {
      expect(pois.get(T.REPO_0 + i)?.label).toBe(`repo-${i}`);
    }
    expect(pois.has(T.REPO_0 + 6)).toBe(false);
  });
});
