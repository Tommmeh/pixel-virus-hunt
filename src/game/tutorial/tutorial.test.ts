import { beforeEach, describe, expect, it } from "vitest";
import { mailStore } from "../apps/webvoyager/sites/hotpost/store";
import { initialWm, windowStore, type Win } from "../system/windows";
import { SCOUT_FRAMES, SCOUT_PALETTE, SIZE } from "./scoutSprite";
import { STEPS, TOUR_TARGETS } from "./steps";
import {
  finishTutorial,
  nextStep,
  prevStep,
  skipTutorial,
  startTutorial,
  stepBack,
  tutorialProgress,
  tutorialSession,
} from "./store";

const fakeWin: Win = {
  key: "w",
  app: "w",
  title: "",
  icon: "",
  x: 0,
  y: 0,
  w: 100,
  h: 100,
  z: 1,
  min: false,
  max: false,
  flash: false,
  shake: 0,
};
const stepId = () => STEPS[tutorialSession.get().step]!.id;
const goTo = (id: string) => {
  while (tutorialSession.get().active && stepId() !== id) nextStep();
};

beforeEach(() => {
  tutorialProgress.reset();
  tutorialSession.reset();
  mailStore.reset();
  windowStore.set(initialWm);
});

describe("tutorial script", () => {
  it("has unique step ids and only points at known tour targets", () => {
    const ids = STEPS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of STEPS) if (s.target) expect(TOUR_TARGETS).toContain(s.target);
  });

  it("explains the purpose, then hands off to the email inbox at the end", () => {
    const all = STEPS.map((s) => [s.title, ...s.text].join(" "))
      .join(" ")
      .toLowerCase();
    expect(all).toContain("pretend");
    expect(all).toContain("hunt");
    expect(STEPS.at(-1)!.id).toBe("sign-in");
    expect(STEPS.at(-1)!.after?.title).toBe("You've got mail!");
  });

  it("is short: 7 cards that still cover the essentials", () => {
    expect(STEPS).toHaveLength(7);
    const all = STEPS.map((s) => [s.title, ...s.text].join(" "))
      .join(" ")
      .toLowerCase();
    for (const topic of ["fake", "8 viruses", "quests", "paneguard", "start", "double-click", "notes.txt"])
      expect(all, topic).toContain(topic);
  });

  it("every 'do it yourself' step tells the player what to do", () => {
    for (const s of STEPS) if (s.waitFor) expect(s.hint?.trim(), s.id).toBeTruthy();
  });
});

describe("Scout sprite", () => {
  it("is a 24×24 grid of palette colours in every frame", () => {
    for (const [name, rows] of Object.entries(SCOUT_FRAMES)) {
      expect(rows, name).toHaveLength(SIZE);
      for (const row of rows) {
        expect(row.length, name).toBe(SIZE);
        for (const ch of row)
          expect(ch === "." || ch in SCOUT_PALETTE, `${name}: ${ch}`).toBe(true);
      }
    }
    expect(SCOUT_FRAMES.blink).not.toEqual(SCOUT_FRAMES.idle);
  });
});

describe("tutorial flow", () => {
  it("starts, steps forward and back, and finishes", () => {
    startTutorial();
    expect(tutorialSession.get()).toEqual({ active: true, step: 0, script: "tour" });
    nextStep();
    nextStep();
    expect(stepId()).toBe("paneguard");
    prevStep();
    expect(stepId()).toBe("goal");
    finishTutorial();
    expect(tutorialSession.get().active).toBe(false);
    expect(tutorialProgress.get().done).toBe(true);
  });

  it("skip marks it done; replaying starts from the top", () => {
    startTutorial();
    nextStep();
    skipTutorial();
    expect(tutorialProgress.get().done).toBe(true);
    startTutorial();
    expect(tutorialSession.get().step).toBe(0);
  });

  it("steps back with the player when they undo a step (e.g. close the browser)", () => {
    windowStore.set({ ...initialWm, wins: [{ ...fakeWin, key: "webvoyager", app: "webvoyager" }] });
    startTutorial();
    goTo("open-mail");
    expect(STEPS.find((s) => s.id === "open-mail")!.undoIf?.()).toBe(false);
    windowStore.set(initialWm); // browser closed
    expect(STEPS.find((s) => s.id === "open-mail")!.undoIf?.()).toBe(true);
    stepBack();
    expect(stepId()).toBe("open-browser");
  });

  it("skips the browser step if it's already open, and knows when sign-in is already done", () => {
    windowStore.set({ ...initialWm, wins: [{ ...fakeWin, key: "webvoyager", app: "webvoyager" }] });
    startTutorial();
    goTo("taskbar");
    nextStep();
    expect(stepId()).toBe("open-mail");
    const signIn = STEPS.find((s) => s.id === "sign-in")!;
    expect(signIn.doneIf?.()).toBe(false);
    mailStore.set((s) => ({ ...s, signedIn: true }));
    expect(signIn.doneIf?.()).toBe(true); // Scout goes straight to the send-off
  });
});
