import { describe, expect, it } from "vitest";
import { ICONS, PALETTE } from "./icons";

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
