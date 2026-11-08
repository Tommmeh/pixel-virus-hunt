// Guided demo mode: a short, quiet run through Aaron's PhotoWorm storyline with Scout narrating.
// Session-only — a reload goes back to the normal game. Chats, bank mail and adware don't run while it's on.
import { playStartup } from "../components/sound";
import { resetStory } from "../shell/startOver";
import { createStore } from "../system/store";
import { logIn, setPhase } from "../system/session";
import { wm } from "../system/windows";
import { stopTutorial } from "../tutorial/store";

export const demoStore = createStore<{ active: boolean }>(null, { active: false });
export const useDemo = () => demoStore.use().active;
export const isDemo = () => demoStore.get().active;

/** Fresh story, demo on, straight to the desktop (Scout starts himself from DemoGuide). */
export function startDemo() {
  stopTutorial();
  resetStory();
  demoStore.set({ active: true });
  playStartup();
  logIn();
}

/** The demo is over (worm removed): show the ending screen. */
export function finishDemo() {
  stopTutorial();
  wm.closeAll();
  setPhase("demo-end");
}

/** Back to the home screen with a fresh story, ready for the full experience. */
export function exitDemo() {
  stopTutorial();
  leaveDemoMode();
  setPhase("welcome");
}

/** Called before a normal login too, so nothing from the demo leaks into the full game. */
export function leaveDemoMode() {
  if (!isDemo()) return;
  demoStore.set({ active: false });
  resetStory();
}
