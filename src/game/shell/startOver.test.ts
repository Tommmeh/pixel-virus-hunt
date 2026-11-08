import { describe, expect, it } from "vitest";
import { socialStore } from "../apps/webvoyager/sites/friendspace/store";
import { scamStore } from "../scams/store";
import { aaronStore, infect, post } from "../storylines/aaron/story";
import { threatStore } from "../system/threats";
import { windowStore, wm } from "../system/windows";
import { resetStory } from "./startOver";

describe("resetStory", () => {
  it("removes the PhotoWorm infection and everything it left behind", () => {
    post();
    infect();
    wm.open("worm-popup", { level: "0" }, { key: "worm:1", title: "Special Offer!" });
    expect(threatStore.get().threats).toHaveLength(1);

    resetStory();

    expect(aaronStore.get().stage).toBe("idle");
    expect(threatStore.get().threats).toEqual([]);
    expect(socialStore.get().posts.some((p) => p.id === "aaron-mum-photos")).toBe(false);
    expect(Object.keys(scamStore.get().unlocked)).toEqual([]);
    expect(windowStore.get().wins).toEqual([]);
  });
});
