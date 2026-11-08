// Which screen the "computer" is on. Session-only (a reload reboots the PC).
import { emit } from "./events";
import { createStore } from "./store";
import { wm } from "./windows";

/** "demo-end" is the guided demo's ending screen (game/demo/DemoEnd.tsx). */
export type Phase =
  | "boot"
  | "welcome"
  | "desktop"
  | "shutdown"
  | "off"
  | "end"
  | "demo-end"
  | "goodend"
  /** Malware brought the machine down (game/storylines/usb): blue screen, then a reboot. */
  | "crash";

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

/** Stage 1 is over: the machine goes quiet except for the black end screen. */
export function endGame() {
  wm.closeAll();
  setPhase("end");
}

/** Stage 2 is over: the screen fades to white with the good ending. */
export function goodEnd() {
  wm.closeAll();
  setPhase("goodend");
}

export function turnOff() {
  wm.closeAll();
  emit({ type: "session.logoff" });
  setPhase("shutdown");
}
