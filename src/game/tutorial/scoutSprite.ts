// "Scout" — the tutorial mascot: an original pixel magnifying-glass detective with a deerstalker hat.
// Drawn from simple shapes (lens circle, gold rim, handle, hat, face) into a 24×24 character grid.
export const SIZE = 24;

export const SCOUT_PALETTE: Record<string, string> = {
  k: "#101018", // outline
  w: "#ffffff", // lens shine
  c: "#cfeeff", // lens
  C: "#9fd6f5", // lens shade
  y: "#ffd23f", // gold rim
  Y: "#d08a10", // gold rim shade
  h: "#a8743c", // hat
  H: "#7a5126", // hat check / brim
  p: "#f6a5b5", // cheeks
  r: "#c4302b", // handle
  R: "#8c2022", // handle shade
};

export type ScoutFrame = "idle" | "blink" | "cheer";

function build(frame: ScoutFrame): string[] {
  const g: string[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill("."));
  const set = (x: number, y: number, ch: string) => {
    if (x >= 0 && y >= 0 && x < SIZE && y < SIZE) g[y]![x] = ch;
  };

  // Lens with gold rim and outline.
  const cx = 9.5;
  const cy = 11.5;
  for (let y = 0; y < SIZE; y++)
    for (let x = 0; x < SIZE; x++) {
      const d = Math.hypot(x - cx, y - cy);
      if (d <= 6.3) set(x, y, x + y > cx + cy + 3 ? "C" : "c");
      else if (d <= 7.7) set(x, y, x + y > cx + cy ? "Y" : "y");
      else if (d <= 8.7) set(x, y, "k");
    }
  // Shine on the lens (top-left).
  [
    [5, 9],
    [5, 10],
    [6, 8],
    [7, 7],
  ].forEach(([x, y]) => set(x!, y!, "w"));

  // Handle, down to the bottom-right corner.
  for (let i = 0; i < 7; i++) {
    set(15 + i, 17 + i, "r");
    set(16 + i, 17 + i, "r");
    set(15 + i, 18 + i, "R");
    set(17 + i, 17 + i, "k");
    set(14 + i, 18 + i, "k");
  }

  // Deerstalker hat sitting on top of the lens.
  for (let x = 7; x <= 12; x++) set(x, 0, "k");
  set(6, 1, "k");
  set(13, 1, "k");
  for (let x = 7; x <= 12; x++) set(x, 1, x % 2 ? "h" : "H");
  set(5, 2, "k");
  set(14, 2, "k");
  for (let x = 6; x <= 13; x++) set(x, 2, (x + 2) % 2 ? "H" : "h");
  set(4, 3, "k");
  set(15, 3, "k");
  for (let x = 5; x <= 14; x++) set(x, 3, x % 2 ? "h" : "H");
  for (let x = 2; x <= 17; x++) set(x, 4, "H"); // brim
  set(1, 4, "k");
  set(18, 4, "k");
  for (let x = 2; x <= 17; x++) set(x, 5, "k");

  // Face.
  if (frame === "blink") {
    [
      [7, 11],
      [8, 11],
      [11, 11],
      [12, 11],
    ].forEach(([x, y]) => set(x!, y!, "k"));
  } else if (frame === "cheer") {
    // ^ ^ happy eyes
    [
      [7, 11],
      [8, 10],
      [9, 11],
      [10, 11],
      [11, 10],
      [12, 11],
    ].forEach(([x, y]) => set(x!, y!, "k"));
  } else {
    [
      [7, 10],
      [8, 10],
      [7, 11],
      [8, 11],
      [11, 10],
      [12, 10],
      [11, 11],
      [12, 11],
    ].forEach(([x, y]) => set(x!, y!, "k"));
    set(7, 10, "w");
    set(11, 10, "w");
  }
  set(5, 13, "p");
  set(14, 13, "p");
  // Smile.
  [
    [7, 14],
    [8, 15],
    [9, 15],
    [10, 15],
    [11, 15],
    [12, 14],
  ].forEach(([x, y]) => set(x!, y!, "k"));

  return g.map((row) => row.join(""));
}

export const SCOUT_FRAMES: Record<ScoutFrame, string[]> = {
  idle: build("idle"),
  blink: build("blink"),
  cheer: build("cheer"),
};
