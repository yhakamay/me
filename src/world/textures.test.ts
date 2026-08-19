import { describe, expect, it } from "vitest";

import { mixHex, packColor } from "@/world/textures";

describe("packColor", () => {
  it("packs a 6-digit hex color as little-endian RGBA", () => {
    // r=0x11, g=0x22, b=0x33 -> r | (g<<8) | (b<<16)
    expect(packColor("#112233")).toBe(0x11 | (0x22 << 8) | (0x33 << 16));
  });

  it("expands a 3-digit hex color", () => {
    expect(packColor("#fff")).toBe(packColor("#ffffff"));
  });
});

describe("mixHex", () => {
  it("returns the first color at t=0", () => {
    expect(mixHex("#000000", "#ffffff", 0)).toBe("#000000");
  });

  it("returns the second color at t=1", () => {
    expect(mixHex("#000000", "#ffffff", 1)).toBe("#ffffff");
  });

  it("interpolates at t=0.5", () => {
    expect(mixHex("#000000", "#ffffff", 0.5)).toBe("#808080");
  });
});
