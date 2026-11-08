import { describe, expect, it } from "vitest";
import { ICONS, PALETTE } from "./icons";

describe("pixel icons", () => {
  it("are square grids (16×16, or 12×12 for tray-*) using palette colours", () => {
    for (const [name, rows] of Object.entries(ICONS)) {
      const size = name.startsWith("tray-") ? 12 : 16;
      expect(rows.length, name).toBe(size);
      for (const row of rows) {
        expect(row.length, `${name}: "${row}"`).toBe(size);
        for (const ch of row) expect(ch === "." || ch in PALETTE, `${name}: ${ch}`).toBe(true);
      }
    }
  });
});
