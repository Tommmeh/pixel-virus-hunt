import { createStore } from "./store";

/** NES.css palettes. CSS tokens live on `.os[data-theme]` in src/styles.css. */
export type ThemeId = "classic" | "night" | "pocket" | "retro";
export type WallpaperId = "hills" | "azul" | "teal" | "autumn";

export const THEMES: { id: ThemeId; label: string; swatch: string }[] = [
  { id: "classic", label: "Classic", swatch: "#209cee" },
  { id: "night", label: "Night", swatch: "#212529" },
  { id: "pocket", label: "Pocket Green", swatch: "#8bac0f" },
  { id: "retro", label: "Retro Red", swatch: "#c4302b" },
];

/** Saved settings may hold an old/unknown theme id (e.g. the XP-era "luna-blue"): fall back to Classic. */
export function resolveTheme(id: string | undefined): ThemeId {
  return THEMES.some((t) => t.id === id) ? (id as ThemeId) : "classic";
}

// Ids kept for saved-settings compatibility; the art is NES-style pixel scenery.
export const WALLPAPERS: { id: WallpaperId; label: string }[] = [
  { id: "hills", label: "Pixel Hills" },
  { id: "azul", label: "Night Sky" },
  { id: "teal", label: "Teal" },
  { id: "autumn", label: "Sunset" },
];

export const AVATARS = ["🐱", "🚀", "⚽", "🎸", "🌻", "🐢", "🎮", "🦊"];

export interface Settings {
  theme: ThemeId;
  wallpaper: WallpaperId;
  userName: string;
  avatar: string;
  muted: boolean;
  volume: number;
  clock24: boolean;
  wifi: string | null;
  chatStatus: "online" | "away" | "busy" | "offline";
}

export const DEFAULT_SETTINGS: Settings = {
  theme: "classic",
  wallpaper: "hills",
  userName: "Jamie",
  avatar: "🐱",
  muted: false,
  volume: 70,
  clock24: false,
  wifi: "Taylor_Home",
  chatStatus: "online",
};

export const settingsStore = createStore<Settings>("vh-settings", DEFAULT_SETTINGS);
export const useSettings = settingsStore.use;

export function updateSettings(patch: Partial<Settings>) {
  settingsStore.set((s) => ({ ...s, ...patch }));
}
