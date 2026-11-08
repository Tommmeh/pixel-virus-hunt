import { beforeEach, describe, expect, it } from "vitest";
import { ACHIEVEMENTS, achievementStore, earn } from "../../achievements/achievements";
import { resetStory } from "../../shell/startOver";
import { SITE_INFO } from "../webvoyager/catalog";
import { gta6Store, installGta6 } from "./install";

beforeEach(() => {
  gta6Store.reset();
  achievementStore.reset();
});

describe("GTA6", () => {
  it("sits at the very right-hand end of the Favorites bar", () => {
    const favs = SITE_INFO.filter((s) => s.favorite);
    expect(favs.at(-1)?.favLabel).toBe("GTA6");
    expect(favs.at(-1)?.name).toBe("GTA6");
  });

  it("installs a program when the download finishes", () => {
    expect(gta6Store.get().installed).toBe(false);
    installGta6();
    expect(gta6Store.get().installed).toBe(true);
  });

  it("is gone when the PC restarts, because the install is session-only", () => {
    installGta6();
    expect(gta6Store.get().installed).toBe(true);
    expect(gta6Store.key).toBe(null); // nothing saved, so a reboot forgets it
    resetStory();
    expect(gta6Store.get().installed).toBe(false);
  });

  it("Rickroll is hidden until it's earned, and says the right thing", () => {
    const a = ACHIEVEMENTS.find((x) => x.id === "rickroll");
    expect(a?.hidden).toBe(true);
    expect(a?.name).toBe("Rickroll");
    expect(a?.description).toBe("You got rickrolled before GTA6");
    expect(earn({ type: "app.open", app: "rickroll" }).map((x) => x.id)).toEqual(["rickroll"]);
    expect(earn({ type: "app.open", app: "rickroll" })).toEqual([]); // only once
  });
});
