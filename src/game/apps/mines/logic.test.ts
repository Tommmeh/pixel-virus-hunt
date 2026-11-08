import { describe, expect, it } from "vitest";
import { LEVELS, newBoard, newBoardFor, reveal, toggleFlag } from "./logic";

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

  it("the three fields get harder: 9×9/10, 12×12/25, 16×16/50", () => {
    expect(LEVELS.map((l) => [l.w, l.h, l.mines])).toEqual([
      [9, 9, 10],
      [12, 12, 25],
      [16, 16, 50],
    ]);
    for (let i = 0; i < LEVELS.length; i++) {
      const b = reveal(newBoardFor(i), 0, seeded(11));
      expect(b.state).not.toBe("lost"); // the first click is still safe on the big fields
      expect(b.cells.filter((c) => c.mine)).toHaveLength(LEVELS[i]!.mines);
    }
    expect(newBoardFor(99).mines).toBe(50); // clamped to the hardest field
    expect(newBoardFor(-3).mines).toBe(10);
  });

  it("revealing every safe cell wins", () => {
    let b = reveal(newBoard(), 40, seeded(7));
    b.cells.forEach((c, i) => {
      if (!c.mine) b = reveal(b, i);
    });
    expect(b.state).toBe("won");
  });
});
