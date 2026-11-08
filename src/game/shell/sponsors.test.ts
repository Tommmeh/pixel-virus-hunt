import { describe, expect, it } from "vitest";
import { nextSponsorIndex, sponsorAt, sponsorBackground, SPONSORS } from "./sponsors";

describe("sponsor easter egg", () => {
  it("has the HackCamp sponsors and the tools we built with, each once", () => {
    const ids = SPONSORS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    const names = SPONSORS.map((s) => s.name);
    for (const n of ["RBC", "Lovable", "Auth0", "n8n", "Freebuff", "Google Gemini"])
      expect(names).toContain(n);
  });

  it("gives every sponsor a background", () => {
    for (const s of SPONSORS) expect(sponsorBackground(s).length, s.id).toBeGreaterThan(10);
  });

  it("cycles default → every sponsor → back to default", () => {
    const seen: number[] = [];
    let i = -1;
    do {
      i = nextSponsorIndex(i);
      seen.push(i);
    } while (i !== -1);
    expect(seen).toHaveLength(SPONSORS.length + 1);
    expect(sponsorAt(-1)).toBeUndefined();
  });
});
