// Where Scout stands: one of four screen corners, picked so he covers as little as possible of what matters
// (the thing he's pointing at, pop-ups, the window you're using, notifications) and, all else equal, sits
// nearest the thing he's talking about. Pure, so it can be unit-tested.

export type Corner = "tl" | "tr" | "bl" | "br";
export const CORNERS: Corner[] = ["br", "tr", "bl", "tl"];

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Obstacle {
  rect: Rect;
  /** How bad it is to cover this (per pixel). */
  weight: number;
}

/** How much each kind of thing matters when Scout covers it. */
export const WEIGHT = { target: 100, popup: 6, balloon: 3, active: 2, window: 1 } as const;

/** Clear of the desktop-icon column on the left, and of the taskbar at the bottom. */
const INSET = { left: 152, right: 12, top: 12, bottom: 50 };

export function cornerRect(
  corner: Corner,
  vw: number,
  vh: number,
  box: { w: number; h: number },
): Rect {
  const left = corner === "tl" || corner === "bl";
  const top = corner === "tl" || corner === "tr";
  const x = left ? INSET.left : vw - INSET.right - box.w;
  const y = top ? INSET.top : vh - INSET.bottom - box.h;
  return { x: Math.max(0, x), y: Math.max(0, y), w: box.w, h: box.h };
}

export function overlap(a: Rect, b: Rect): number {
  const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return w > 0 && h > 0 ? w * h : 0;
}

const centre = (r: Rect) => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });

export interface PlacementInput {
  vw: number;
  vh: number;
  box: { w: number; h: number };
  /** What Scout is pointing at, if anything. */
  target?: Rect | null;
  obstacles: Obstacle[];
  /** Where he is now — he stays put unless somewhere else is clearly better. */
  current?: Corner | null;
}

export function pickCorner({ vw, vh, box, target, obstacles, current }: PlacementInput): Corner {
  const all = target ? [...obstacles, { rect: target, weight: WEIGHT.target }] : obstacles;
  const cost = (c: Corner) => {
    const r = cornerRect(c, vw, vh, box);
    return all.reduce((sum, o) => sum + overlap(r, o.rect) * o.weight, 0);
  };
  const distance = (c: Corner) => {
    if (!target) return CORNERS.indexOf(c); // no target: prefer bottom-right, then top-right...
    const a = centre(cornerRect(c, vw, vh, box));
    const b = centre(target);
    return Math.hypot(a.x - b.x, a.y - b.y);
  };
  // Costs within a small margin count as a tie, broken by closeness to the target.
  const bucket = Math.max(1, box.w * box.h * 0.05);
  const ranked = [...CORNERS].sort(
    (a, b) =>
      Math.round(cost(a) / bucket) - Math.round(cost(b) / bucket) || distance(a) - distance(b),
  );
  const best = ranked[0]!;
  if (!current || current === best) return best;
  // Hysteresis: only hop if it's clearly better, so he doesn't jitter between corners.
  const gain = cost(current) - cost(best);
  return gain > box.w * box.h * 0.15 ? best : current;
}
