// Pure Minesweeper-style logic (unit-tested).
export interface Cell {
  mine: boolean;
  open: boolean;
  flag: boolean;
  n: number; // neighbouring mines
}

export interface Board {
  w: number;
  h: number;
  mines: number;
  cells: Cell[];
  placed: boolean;
  state: "ready" | "playing" | "won" | "lost";
}

export const newBoard = (w = 9, h = 9, mines = 10): Board => ({
  w,
  h,
  mines,
  cells: Array.from({ length: w * h }, () => ({ mine: false, open: false, flag: false, n: 0 })),
  placed: false,
  state: "ready",
});

export function neighbours(b: Board, i: number): number[] {
  const x = i % b.w;
  const y = Math.floor(i / b.w);
  const out: number[] = [];
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < b.w && ny < b.h) out.push(ny * b.w + nx);
    }
  return out;
}

/** Place mines avoiding the first-clicked cell and its neighbours. */
export function placeMines(b: Board, safe: number, rand: () => number = Math.random): Board {
  const avoid = new Set([safe, ...neighbours(b, safe)]);
  const cells = b.cells.map((c) => ({ ...c }));
  let left = Math.min(b.mines, cells.length - avoid.size);
  while (left > 0) {
    const i = Math.floor(rand() * cells.length);
    if (avoid.has(i) || cells[i]!.mine) continue;
    cells[i]!.mine = true;
    left--;
  }
  const board = { ...b, cells, placed: true };
  cells.forEach((c, i) => {
    c.n = neighbours(board, i).filter((j) => cells[j]!.mine).length;
  });
  return board;
}

export function reveal(b0: Board, i: number, rand?: () => number): Board {
  if (b0.state === "won" || b0.state === "lost") return b0;
  let b = b0.placed ? b0 : placeMines(b0, i, rand);
  if (b.cells[i]!.flag || b.cells[i]!.open) return b;
  const cells = b.cells.map((c) => ({ ...c }));
  b = { ...b, cells, state: "playing" };
  if (cells[i]!.mine) {
    cells.forEach((c) => {
      if (c.mine) c.open = true;
    });
    cells[i]!.open = true;
    return { ...b, state: "lost" };
  }
  const stack = [i];
  while (stack.length) {
    const j = stack.pop()!;
    const c = cells[j]!;
    if (c.open || c.flag) continue;
    c.open = true;
    if (c.n === 0) stack.push(...neighbours(b, j));
  }
  const won = cells.every((c) => c.mine || c.open);
  return { ...b, state: won ? "won" : "playing" };
}

export function toggleFlag(b: Board, i: number): Board {
  if (b.state === "won" || b.state === "lost" || b.cells[i]!.open) return b;
  const cells = b.cells.map((c, j) => (j === i ? { ...c, flag: !c.flag } : c));
  return { ...b, cells };
}
