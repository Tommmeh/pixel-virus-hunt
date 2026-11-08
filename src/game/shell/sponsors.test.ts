import { describe, expect, it } from "vitest";
import {
  nextSponsorIndex,
  sponsorAt,
  sponsorBackground,
  SPONSORS,
  WATERMARK_CHARS,
  watermarkRow,
} from "./sponsors";

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

  it("every sponsor name stands out clearly against its background", () => {
    const lum = (hex: string) => {
      const [r, g, b] = [1, 3, 5].map((i) => {
        const c = parseInt(hex.slice(i, i + 2), 16) / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
    };
    const contrast = (x: string, y: string) => {
      const [hi, lo] = [lum(x), lum(y)].sort((p, q) => q - p);
      return (hi! + 0.05) / (lo! + 0.05);
    };
    for (const s of SPONSORS) {
      expect(contrast(s.colors.ink, s.colors.a), s.id).toBeGreaterThanOrEqual(4.5);
      expect(contrast(s.colors.ink, s.colors.b), s.id).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("watermark rows cover the screen the same for short and long names", () => {
    for (const s of SPONSORS) {
      const row = watermarkRow(s.name);
      expect(row.length, s.id).toBeGreaterThanOrEqual(WATERMARK_CHARS);
      expect(row.startsWith(s.name), s.id).toBe(true);
    }
  });
});
