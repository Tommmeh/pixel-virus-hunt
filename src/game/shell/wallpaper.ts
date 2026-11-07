// Pixel-art wallpapers drawn on a tiny canvas and scaled up with `image-rendering: pixelated`.
// Client-only (the desktop never renders on the server). Results are cached per wallpaper id.
import type { WallpaperId } from "../system/settings";

const W = 96;
const H = 54;
const cache = new Map<string, string>();

/** Deterministic pseudo-random numbers so wallpapers look the same every time. */
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

type Ctx = CanvasRenderingContext2D;

const rect = (c: Ctx, color: string, x: number, y: number, w: number, h: number) => {
  c.fillStyle = color;
  c.fillRect(x, y, w, h);
};

/** Horizontal colour bands (stepped "gradient"). */
function bands(c: Ctx, colors: string[], top: number, bottom: number) {
  const h = (bottom - top) / colors.length;
  colors.forEach((col, i) => rect(c, col, 0, Math.round(top + i * h), W, Math.ceil(h) + 1));
}

/** A hill silhouette: for each column, fill from a sine-shaped top edge down to the bottom. */
function hill(
  c: Ctx,
  color: string,
  base: number,
  amp: number,
  freq: number,
  phase: number,
  edge?: string,
) {
  for (let x = 0; x < W; x++) {
    const top = Math.round(base - amp * Math.sin(x * freq + phase));
    rect(c, color, x, top, 1, H - top);
    if (edge) rect(c, edge, x, top, 1, 1);
  }
}

function cloud(c: Ctx, x: number, y: number, s: number) {
  rect(c, "#ffffff", x + s, y, s * 3, s);
  rect(c, "#ffffff", x, y + s, s * 5, s);
  rect(c, "#d8ecff", x, y + s * 2 - 1, s * 5, 1);
}

const DRAW: Record<WallpaperId, (c: Ctx) => void> = {
  hills(c) {
    bands(c, ["#209cee", "#3aa9f0", "#5cb8f2", "#7fc8f5", "#a5d9f8"], 0, 34);
    cloud(c, 10, 6, 2);
    cloud(c, 58, 11, 2);
    cloud(c, 80, 4, 1);
    hill(c, "#4aa548", 38, 6, 0.09, 1.2, "#6cc35f");
    hill(c, "#92cc41", 44, 4, 0.13, 3.5, "#b4e06a");
    rect(c, "#76a832", 0, 50, W, 4);
  },
  azul(c) {
    bands(c, ["#0b1030", "#121a45", "#1a2560", "#24317a"], 0, 44);
    const r = rng(7);
    for (let i = 0; i < 70; i++) {
      const x = Math.floor(r() * W);
      const y = Math.floor(r() * 38);
      rect(c, r() > 0.8 ? "#f7d51d" : "#ffffff", x, y, 1, 1);
    }
    // pixel moon
    rect(c, "#f2ead8", 74, 6, 6, 8);
    rect(c, "#f2ead8", 73, 8, 8, 4);
    rect(c, "#0b1030", 77, 6, 4, 6);
    hill(c, "#0e1428", 46, 4, 0.11, 0.5);
  },
  teal(c) {
    rect(c, "#008080", 0, 0, W, H);
    const r = rng(3);
    for (let i = 0; i < 40; i++) rect(c, "#0a8f8f", Math.floor(r() * W), Math.floor(r() * H), 1, 1);
  },
  autumn(c) {
    bands(c, ["#3b1d4a", "#6b2a5b", "#a63a50", "#d9583b", "#f08a24", "#f7b733"], 0, 40);
    // striped setting sun
    for (let y = 0; y < 12; y++) {
      if (y % 3 === 2 && y > 4) continue;
      const half = Math.round(Math.sqrt(Math.max(0, 144 - (y - 12) ** 2)));
      rect(c, "#ffe066", 48 - half, 28 + y, half * 2, 1);
    }
    hill(c, "#4a2340", 42, 5, 0.1, 2, "#6b3358");
    hill(c, "#2b1427", 48, 3, 0.16, 0.2);
  },
};

/** CSS `url(...)` for a wallpaper, or null when canvas isn't available (SSR/tests). */
export function wallpaperUrl(id: WallpaperId): string | null {
  if (typeof document === "undefined") return null;
  const hit = cache.get(id);
  if (hit) return hit;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const c = canvas.getContext("2d");
    if (!c) return null;
    (DRAW[id] ?? DRAW.hills)(c);
    const url = `url(${canvas.toDataURL("image/png")})`;
    cache.set(id, url);
    return url;
  } catch {
    return null;
  }
}
