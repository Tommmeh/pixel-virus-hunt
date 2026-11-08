// USB storyline — "ThumbDrive".
// 1. A program is hiding on the KINGSTON stick as E:\Photos\holiday_03.jpg.exe   → stage "running"
// 2. It pretends to load a photo, installs a driver, then the PC blue-screens    → stage "crashed"
// 3. After logging in again the PC is barely usable: slow start-up, frozen windows, actions that drag
// 4. PaneGuard scans the drives, finds Backdoor.XPUSB.A and removes it           → stage "cleaned"
// The cure is the antivirus, never Task Manager or a restart: a restart only makes the malware run again.
// As with every storyline, nothing warns the player at the moment of the mistake.
import { unlockScam } from "../../scams/store";
import { emit } from "../../system/events";
import { healthStore, infectPc, isSlow, repairPc } from "../../system/health";
import { notify } from "../../system/notify";
import { setPhase } from "../../system/session";
import { createStore } from "../../system/store";
import { addThreat, removeThreat, threatStore } from "../../system/threats";
import { wm } from "../../system/windows";
import { USB_CARD_IDS } from "./cards";

export const STORY = "usb";
export type Stage = "idle" | "running" | "crashed" | "cleaned";

/** The double extension: this is what Explorer shows, and it looks like the holiday photos. */
export const EXE_PATH = "E:\\Photos\\holiday_03.jpg.exe";
export const EXE_APP = "usb-photo";
/** What PaneGuard reports, and what the player has to remove. */
export const THREAT_ID = "usb-holiday-exe";
export const THREAT_NAME = "Backdoor.XPUSB.A";

/** How long the fake photo viewer "loads" before the machine goes down. */
export const CRASH_AFTER_MS = 3_400;

export interface UsbState {
  stage: Stage;
  ranAt: number;
  crashedAt: number;
}

export const INITIAL: UsbState = { stage: "idle", ranAt: 0, crashedAt: 0 };
export const usbStore = createStore<UsbState>("vh-usb", INITIAL);
export const useUsb = usbStore.use;

const setStage = (stage: Stage, patch: Partial<UsbState> = {}) => {
  usbStore.set((s) => ({ ...s, ...patch, stage }));
  emit({ type: "story.stage", story: STORY, stage });
};

let crashTimer: ReturnType<typeof setTimeout> | null = null;

const clearCrashTimer = () => {
  if (crashTimer) clearTimeout(crashTimer);
  crashTimer = null;
};

/**
 * The player double-clicked the file. It opens a plain-looking picture viewer, so nothing looks
 * wrong for a moment — then the driver it "needs" takes the machine down. Closing the window does
 * not call it off: the program is already running.
 */
export function run() {
  const { stage } = usbStore.get();
  if (stage === "running" || isSlow()) return;
  setStage("running", { ranAt: Date.now() });
  unlockScam(USB_CARD_IDS.doubleExtension);
  clearCrashTimer();
  crashTimer = setTimeout(() => crash(), CRASH_AFTER_MS);
}

/** The crash. Threat + slowdown are recorded before the blue screen, so a reload is not an escape. */
export function crash(now = Date.now()) {
  clearCrashTimer();
  if (usbStore.get().stage === "crashed") return;
  setStage("crashed", { crashedAt: now });
  unlockScam(USB_CARD_IDS.crash);
  addThreat({
    id: THREAT_ID,
    name: THREAT_NAME,
    kind: "Backdoor",
    location: EXE_PATH,
    copies: 3,
  });
  infectPc(now);
  wm.closeAll();
  setPhase("crash");
}

/** PaneGuard removed the backdoor: the machine speeds back up. */
export function clean() {
  if (usbStore.get().stage !== "crashed") return;
  clearCrashTimer();
  setStage("cleaned");
  if (threatStore.get().threats.some((t) => t.id === THREAT_ID)) removeThreat(THREAT_ID);
  repairPc();
  unlockScam(USB_CARD_IDS.cleaned);
  notify({
    title: "PaneGuard Antivirus",
    text: `${THREAT_NAME} removed. Your PC is running normally again.`,
    icon: "shield",
    open: { app: "quests" },
  });
  emit({ type: "story.complete", story: STORY });
}

/** "Start a new game": no infection, no threat, no pending crash, no crash history. */
export function resetUsb() {
  clearCrashTimer();
  usbStore.reset();
  healthStore.reset();
}
