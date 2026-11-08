// Tutorial state. Whether it's been completed is saved; the current step is session-only
// (after a reload Scout starts from the top again if the tutorial wasn't finished).
import { createStore } from "../system/store";
import { STEPS } from "./steps";

export const tutorialProgress = createStore<{ done: boolean }>("vh-tutorial", { done: false });
export const tutorialSession = createStore<{ active: boolean; step: number }>(null, {
  active: false,
  step: 0,
});

/** First step at or after `from` whose skip condition isn't met. */
function firstRunnable(from: number) {
  let i = from;
  while (i < STEPS.length && STEPS[i]!.skipIf?.()) i++;
  return i;
}

export function startTutorial() {
  tutorialSession.set({ active: true, step: firstRunnable(0) });
}

export function nextStep() {
  const s = tutorialSession.get();
  if (!s.active) return;
  const step = firstRunnable(s.step + 1);
  if (step >= STEPS.length) finishTutorial();
  else tutorialSession.set({ active: true, step });
}

export function prevStep() {
  const s = tutorialSession.get();
  if (!s.active) return;
  let i = s.step - 1;
  while (i > 0 && (STEPS[i]!.skipIf?.() || STEPS[i]!.waitFor)) i--;
  tutorialSession.set({ active: true, step: Math.max(0, i) });
}

export function finishTutorial() {
  tutorialSession.set({ active: false, step: 0 });
  tutorialProgress.set({ done: true });
}

/** Skip = finish without seeing the rest (won't auto-start again; replay from the Start menu). */
export const skipTutorial = finishTutorial;
