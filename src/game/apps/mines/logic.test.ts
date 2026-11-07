import { describe, expect, it } from "vitest";
import { newBoard, reveal, toggleFlag } from "./logic";

const seeded = (seed: number) => () => {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
};

describe("mines", () => {
  it("first click is always safe and places the right number of mines", () => {
    for (let s = 1; s < 20; s++) {
      const b = reveal(newBoard(), 40, seeded(s));
      expect(b.state).not.toBe("lost");
      expect(b.cells.filter((c) => c.mine)).toHaveLength(10);
    }
  });

  it("clicking a mine loses; flags block reveals", () => {
    let b = reveal(newBoard(), 0, seeded(3));
    const mine = b.cells.findIndex((c) => c.mine);
    b = toggleFlag(b, mine);
    expect(reveal(b, mine).state).toBe("playing");
    b = toggleFlag(b, mine);
    expect(reveal(b, mine).state).toBe("lost");
  });

  it("revealing every safe cell wins", () => {
    let b = reveal(newBoard(), 40, seeded(7));
    b.cells.forEach((c, i) => {
      if (!c.mine) b = reveal(b, i);
    });
    expect(b.state).toBe("won");
  });
});
