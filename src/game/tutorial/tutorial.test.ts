import { beforeEach, describe, expect, it } from "vitest";
import { mailStore } from "../apps/webvoyager/sites/hotpost/store";
import { initialWm, windowStore } from "../system/windows";
import { SCOUT_FRAMES, SCOUT_PALETTE, SIZE } from "./scoutSprite";
import { STEPS, TOUR_TARGETS } from "./steps";
import {
  finishTutorial,
  nextStep,
  prevStep,
  skipTutorial,
  startTutorial,
  tutorialProgress,
  tutorialSession,
} from "./store";

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
    expect(STEPS.at(-1)!.id).toBe("done");
    expect(STEPS.at(-2)!.id).toBe("sign-in");
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
    expect(stepId()).toBe("mission");
    prevStep();
    expect(stepId()).toBe("pretend");
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

  it("skips steps that are already done", () => {
    mailStore.set((s) => ({ ...s, signedIn: true }));
    startTutorial();
    goTo("open-mail");
    nextStep(); // already signed in → jumps straight to the end
    expect(stepId()).toBe("done");
  });
});
