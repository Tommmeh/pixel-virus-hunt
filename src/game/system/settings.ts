import { createStore } from "./store";

export type ThemeId = "luna-blue" | "luna-olive" | "luna-silver" | "classic";
export type WallpaperId = "hills" | "azul" | "teal" | "autumn";

export const THEMES: { id: ThemeId; label: string; swatch: string }[] = [
  { id: "luna-blue", label: "PaneOS (Blue)", swatch: "#0a5fe0" },
  { id: "luna-olive", label: "PaneOS (Olive Green)", swatch: "#8a9a5b" },
  { id: "luna-silver", label: "PaneOS (Silver)", swatch: "#b7b9cb" },
  { id: "classic", label: "Classic", swatch: "#0a246a" },
];

export const WALLPAPERS: { id: WallpaperId; label: string }[] = [
  { id: "hills", label: "Green Hills" },
  { id: "azul", label: "Azul" },
  { id: "teal", label: "Teal" },
  { id: "autumn", label: "Autumn" },
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
  theme: "luna-blue",
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
