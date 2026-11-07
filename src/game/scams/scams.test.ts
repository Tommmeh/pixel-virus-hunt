// Guards the shared scam data so four people can add content without breaking each other.
import { describe, expect, it } from "vitest";
import { ICONS, PALETTE } from "../components/icons";
import { MALWARE } from "../malware";
import type { LureLocation } from "../types";
import { SCAM_GROUPS, SCAMS } from "./index";

/** Locations that currently have a renderer. Add "chat" when Track D registers the Chat app. */
const RENDERED: LureLocation[] = ["email", "browser", "popup", "desktop", "tray", "chat"];

describe("scam data", () => {
  it("has unique ids", () => {
    const ids = SCAMS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("prefixes ids with the owning track", () => {
    for (const [prefix, list] of Object.entries(SCAM_GROUPS)) {
      for (const s of list) expect(s.id.startsWith(`${prefix}-`), s.id).toBe(true);
    }
  });

  it("gives every scam the content the achievement card needs", () => {
    for (const s of SCAMS) {
      expect(s.name.trim(), s.id).not.toBe("");
      expect(s.hint.trim(), s.id).not.toBe("");
      expect(s.whatHappened.trim(), s.id).not.toBe("");
      expect(s.tip.trim(), s.id).not.toBe("");
      expect(s.redFlags.length, s.id).toBeGreaterThan(0);
      expect(s.lure.bait.trim(), s.id).not.toBe("");
      expect(s.lure.title.trim(), s.id).not.toBe("");
    }
  });

  it("only uses lure locations that have a renderer", () => {
    for (const s of SCAMS) expect(RENDERED, s.id).toContain(s.lure.location);
  });

  it("gives every browser lure a unique url", () => {
    const urls = SCAMS.filter((s) => s.lure.location === "browser").map((s) => s.lure.url);
    expect(urls.every(Boolean)).toBe(true);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("only links to malware that exists", () => {
    for (const s of SCAMS) {
      if (s.malwareId)
        expect(
          MALWARE.map((m) => m.id),
          s.id,
        ).toContain(s.malwareId);
    }
  });
});

describe("pixel icons", () => {
  it("are 16×16 grids using palette colours", () => {
    for (const [name, rows] of Object.entries(ICONS)) {
      expect(rows.length, name).toBe(16);
      for (const row of rows) {
        expect(row.length, `${name}: "${row}"`).toBe(16);
        for (const ch of row) expect(ch === "." || ch in PALETTE, `${name}: ${ch}`).toBe(true);
      }
    }
  });
});
