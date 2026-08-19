import { describe, expect, it } from "vitest";

import { formatDate } from "@/lib/format";

describe("formatDate", () => {
  it("formats a valid ISO date", () => {
    expect(formatDate("2026-03-05T00:00:00Z")).toBe("Mar 2026");
  });

  it("returns an empty string for unparseable input", () => {
    expect(formatDate("not-a-date")).toBe("");
  });

  it("respects custom formatting options", () => {
    expect(
      formatDate("2026-03-05T00:00:00Z", { year: "numeric", month: "long", day: "numeric" })
    ).toBe("March 5, 2026");
  });
});
