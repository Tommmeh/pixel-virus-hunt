// Which screen the "computer" is on. Session-only (a reload reboots the PC).
import { emit } from "./events";
import { createStore } from "./store";
import { wm } from "./windows";

export type Phase = "boot" | "welcome" | "desktop" | "shutdown" | "off" | "end";

export const sessionStore = createStore<{ phase: Phase }>(null, { phase: "boot" });
export const usePhase = () => sessionStore.use().phase;

export const setPhase = (phase: Phase) => sessionStore.set({ phase });

export function logIn() {
  setPhase("desktop");
  emit({ type: "session.login" });
}

export function logOff() {
  wm.closeAll();
  emit({ type: "session.logoff" });
  setPhase("welcome");
}

/** The story is over: the machine goes quiet except for the end screen. */
export function endGame() {
  wm.closeAll();
  setPhase("end");
}

export function turnOff() {
  wm.closeAll();
  emit({ type: "session.logoff" });
  setPhase("shutdown");
}
