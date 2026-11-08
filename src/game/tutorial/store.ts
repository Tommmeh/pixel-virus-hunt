// Tutorial state. Whether the intro tour has been completed is saved; the current step is session-only
// (after a reload Scout starts from the top again if the tour wasn't finished).
// Scout can run more than one script: "tour" (the first-login intro) and others registered with
// `registerScript` (e.g. the guided judge demo in game/demo/).
import { createStore } from "../system/store";
import { STEPS, type TutorialStep } from "./steps";

const scripts: Record<string, TutorialStep[]> = { tour: STEPS };

/** Make a script available to `startTutorial(name)`. */
export function registerScript(name: string, steps: TutorialStep[]) {
  scripts[name] = steps;
}

export const stepsFor = (script: string): TutorialStep[] => scripts[script] ?? STEPS;

export const tutorialProgress = createStore<{ done: boolean }>("vh-tutorial", { done: false });
export const tutorialSession = createStore<{ active: boolean; step: number; script: string }>(
  null,
  { active: false, step: 0, script: "tour" },
);

/** First step at or after `from` whose skip condition isn't met. */
function firstRunnable(steps: TutorialStep[], from: number) {
  let i = from;
  while (i < steps.length && steps[i]!.skipIf?.()) i++;
  return i;
}

/** Make `step` the current one and run its `onEnter`. */
function go(script: string, step: number) {
  tutorialSession.set({ active: true, step, script });
  stepsFor(script)[step]?.onEnter?.();
}

export function startTutorial(script = "tour") {
  const steps = stepsFor(script);
  const step = firstRunnable(steps, 0);
  if (step >= steps.length) return;
  go(script, step);
}

export function nextStep() {
  const s = tutorialSession.get();
  if (!s.active) return;
  const steps = stepsFor(s.script);
  const step = firstRunnable(steps, s.step + 1);
  if (step >= steps.length) finishTutorial();
  else go(s.script, step);
}

export function prevStep() {
  const s = tutorialSession.get();
  if (!s.active) return;
  const steps = stepsFor(s.script);
  let i = s.step - 1;
  while (i > 0 && (steps[i]!.skipIf?.() || steps[i]!.waitFor)) i--;
  go(s.script, Math.max(0, i));
}

/** End the current script. Only the intro tour remembers that it's been done. */
export function finishTutorial() {
  const { script } = tutorialSession.get();
  tutorialSession.set({ active: false, step: 0, script: "tour" });
  if (script === "tour") tutorialProgress.set({ done: true });
}

/** Skip = finish without seeing the rest (won't auto-start again; replay from the Start menu). */
export const skipTutorial = finishTutorial;

/** Stop whatever Scout is doing without marking anything as done. */
export function stopTutorial() {
  tutorialSession.set({ active: false, step: 0, script: "tour" });
}
