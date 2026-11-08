import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, resolveTheme, THEMES, WALLPAPERS } from "./settings";

describe("settings", () => {
  it("offers the four NES palettes, Classic by default", () => {
    expect(THEMES.map((t) => t.id)).toEqual(["classic", "night", "pocket", "retro"]);
    expect(DEFAULT_SETTINGS.theme).toBe("classic");
  });

  it("falls back to Classic for old or unknown theme ids", () => {
    expect(resolveTheme("luna-blue")).toBe("classic");
    expect(resolveTheme("nonsense")).toBe("classic");
    expect(resolveTheme(undefined)).toBe("classic");
    expect(resolveTheme("pocket")).toBe("pocket");
  });

  it("keeps the saved wallpaper ids working", () => {
    expect(WALLPAPERS.map((w) => w.id)).toEqual(["hills", "azul", "teal", "autumn"]);
  });
});
