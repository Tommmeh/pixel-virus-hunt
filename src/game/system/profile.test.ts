import { afterEach, describe, expect, it } from "vitest";
import { readFile } from "./fs";
import { personalize, playerName } from "./profile";
import { settingsStore, updateSettings } from "./settings";

afterEach(() => settingsStore.reset());

describe("player name", () => {
  it("defaults to Jamie and follows Settings / the signed-in user", () => {
    expect(playerName()).toBe("Jamie");
    updateSettings({ userName: "Aaron" });
    expect(playerName()).toBe("Aaron");
    updateSettings({ userName: "   " });
    expect(playerName()).toBe("Jamie");
  });

  it("fills {name} into story text", () => {
    updateSettings({ userName: "Priya" });
    expect(personalize("Hi {name}! Bye {name}.")).toBe("Hi Priya! Bye Priya.");
    expect(personalize("no placeholder")).toBe("no placeholder");
  });

  it("personalizes text files like the USB stick's readme", () => {
    updateSettings({ userName: "Zhuming" });
    expect(readFile("E:\\readme.txt")).toContain("belongs to Zhuming");
  });
});
