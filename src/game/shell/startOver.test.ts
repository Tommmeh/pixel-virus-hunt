import { describe, expect, it } from "vitest";
import { socialStore } from "../apps/webvoyager/sites/friendspace/store";
import { scamStore } from "../scams/store";
import { aaronStore, infect, post } from "../storylines/aaron/story";
import { threatStore } from "../system/threats";
import { windowStore, wm } from "../system/windows";
import { startTutorial, tutorialProgress, tutorialSession } from "../tutorial/store";
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

  it("brings Scout's tour back, even if it was finished or skipped", () => {
    tutorialProgress.set({ done: true });
    startTutorial();
    resetStory();
    expect(tutorialProgress.get().done).toBe(false);
    expect(tutorialSession.get().active).toBe(false);
  });
});
