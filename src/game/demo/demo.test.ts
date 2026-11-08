import { beforeEach, describe, expect, it } from "vitest";
import { socialStore } from "../apps/webvoyager/sites/friendspace/store";
import { aaronStore, click, infect } from "../storylines/aaron/story";
import { emit } from "../system/events";
import { sessionStore } from "../system/session";
import { threatStore } from "../system/threats";
import { initialWm, windowStore } from "../system/windows";
import { TOUR_TARGETS } from "../tutorial/steps";
import {
  nextStep,
  startTutorial,
  stepsFor,
  tutorialProgress,
  tutorialSession,
} from "../tutorial/store";
import { DEMO_SCRIPT, DEMO_STEPS } from "./steps";
import { demoStore, exitDemo, finishDemo, leaveDemoMode, startDemo } from "./store";

const current = () => DEMO_STEPS[tutorialSession.get().step]!.id;

beforeEach(() => {
  demoStore.reset();
  tutorialSession.reset();
  tutorialProgress.reset();
  aaronStore.reset();
  threatStore.reset();
  socialStore.reset();
  sessionStore.reset();
  windowStore.set(initialWm);
});

describe("demo script", () => {
  it("is registered with Scout and has unique ids and known targets", () => {
    expect(stepsFor(DEMO_SCRIPT)).toBe(DEMO_STEPS);
    const ids = DEMO_STEPS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of DEMO_STEPS) {
      const targets =
        s.target === undefined ? [] : typeof s.target === "string" ? [s.target] : s.target;
      for (const t of targets) expect(TOUR_TARGETS, s.id).toContain(t);
    }
  });

  it("tells the player what to do on every hands-on step", () => {
    for (const s of DEMO_STEPS) if (s.waitFor) expect(s.hint?.trim(), s.id).toBeTruthy();
  });

  it("points at the http in the address bar before asking for the download", () => {
    const http = DEMO_STEPS.findIndex((s) => s.target === "addr-http");
    const download = DEMO_STEPS.findIndex((s) => s.id === "demo-download");
    expect(http).toBeGreaterThan(-1);
    expect(http).toBeLessThan(download);
  });

  it("walks the PhotoWorm story from the post to the clean-up", () => {
    startTutorial(DEMO_SCRIPT);
    expect(current()).toBe("demo-hello");
    nextStep();
    nextStep();
    emit({ type: "app.open", app: "webvoyager" });
    expect(current()).toBe("demo-browser"); // events are handled by TutorialGuide, not the store
    nextStep(); // → FriendSpace
    nextStep(); // → Mum's post: Scout makes Mum post the link
    expect(current()).toBe("demo-post");
    expect(aaronStore.get().stage).toBe("posted");
    expect(socialStore.get().posts.some((p) => p.id === "aaron-mum-photos")).toBe(true);
    click();
    nextStep();
    expect(current()).toBe("demo-http");
    infect();
    nextStep(); // download step is skipped: already infected
    expect(current()).toBe("demo-infected");
  });

  it("doesn't mark the intro tour as done", () => {
    startTutorial(DEMO_SCRIPT);
    while (tutorialSession.get().active) nextStep();
    expect(tutorialProgress.get().done).toBe(false);
  });
});

describe("demo mode", () => {
  it("starts on a fresh story and goes to the desktop", () => {
    infect();
    startDemo();
    expect(demoStore.get().active).toBe(true);
    expect(sessionStore.get().phase).toBe("desktop");
    expect(aaronStore.get().stage).toBe("idle");
    expect(threatStore.get().threats).toEqual([]);
  });

  it("ends on the demo ending, then 'full experience' goes home with the story reset", () => {
    startDemo();
    infect();
    finishDemo();
    expect(sessionStore.get().phase).toBe("demo-end");
    exitDemo();
    expect(sessionStore.get().phase).toBe("welcome");
    expect(demoStore.get().active).toBe(false);
    expect(aaronStore.get().stage).toBe("idle");
  });

  it("a normal login leaves demo mode without touching a normal game", () => {
    infect();
    leaveDemoMode(); // not in a demo: nothing happens
    expect(aaronStore.get().stage).toBe("infected");
  });
});
