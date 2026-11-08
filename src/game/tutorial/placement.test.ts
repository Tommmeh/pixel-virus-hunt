import { describe, expect, it } from "vitest";
import { cornerRect, overlap, pickCorner, WEIGHT, type Rect } from "./placement";

const vw = 1280;
const vh = 800;
const box = { w: 420, h: 220 };
const base = { vw, vh, box, obstacles: [] };

describe("Scout placement", () => {
  it("never stands on what he's pointing at", () => {
    // Target in the bottom-right corner (e.g. the tray): he goes elsewhere.
    const tray: Rect = { x: 1080, y: 760, w: 190, h: 40 };
    const startBtn: Rect = { x: 0, y: 760, w: 110, h: 40 };
    const bottomRightRect = cornerRect("br", vw, vh, box);
    const target: Rect = { x: bottomRightRect.x + 50, y: bottomRightRect.y + 50, w: 60, h: 60 };
    const c = pickCorner({ ...base, target });
    expect(c).not.toBe("br");
    expect(overlap(cornerRect(c, vw, vh, box), target)).toBe(0);
    // Taskbar targets sit below every corner, so nothing blocks them.
    for (const t of [tray, startBtn])
      expect(overlap(cornerRect(pickCorner({ ...base, target: t }), vw, vh, box), t)).toBe(0);
  });

  it("stands next to the thing he's talking about when he can", () => {
    const passwordBox: Rect = { x: 300, y: 300, w: 200, h: 30 }; // left side, upper half
    expect(pickCorner({ ...base, target: passwordBox })).toBe("tl");
    const startBtn: Rect = { x: 0, y: 760, w: 110, h: 40 };
    expect(pickCorner({ ...base, target: startBtn })).toBe("bl");
  });

  it("keeps clear of pop-ups first, then the window you're using", () => {
    const popup = { rect: cornerRect("br", vw, vh, box), weight: WEIGHT.popup };
    const active = { rect: cornerRect("tr", vw, vh, box), weight: WEIGHT.active };
    const c = pickCorner({ ...base, obstacles: [popup, active] });
    expect(["tl", "bl"]).toContain(c);
  });

  it("doesn't hop for a tiny improvement, but does for a real one", () => {
    const small = {
      rect: { ...cornerRect("br", vw, vh, box), w: 20, h: 20 },
      weight: WEIGHT.window,
    };
    expect(pickCorner({ ...base, obstacles: [small], current: "br" })).toBe("br");
    const popup = { rect: cornerRect("br", vw, vh, box), weight: WEIGHT.popup };
    expect(pickCorner({ ...base, obstacles: [popup], current: "br" })).not.toBe("br");
  });
});
