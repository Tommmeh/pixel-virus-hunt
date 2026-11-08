import { beforeEach, afterEach, describe, expect, it } from "vitest";
import { scamStore } from "../../scams/store";
import { onEvent } from "../../system/events";
import { healthStore, isSlow } from "../../system/health";
import { sessionStore } from "../../system/session";
import { threatStore } from "../../system/threats";
import { initialWm, windowStore } from "../../system/windows";
import { getBaseNode } from "../../system/fs";
import { USB_CARD_IDS } from "./cards";
import {
  clean,
  crash,
  EXE_APP,
  EXE_PATH,
  resetUsb,
  run,
  STORY,
  THREAT_ID,
  usbStore,
} from "./story";

beforeEach(() => {
  resetUsb();
  threatStore.reset();
  scamStore.reset();
  windowStore.set(initialWm);
  sessionStore.set({ phase: "desktop" });
});

afterEach(() => {
  resetUsb();
  sessionStore.set({ phase: "boot" });
});

const unlocked = () => Object.keys(scamStore.get().unlocked).sort();

describe("USB — the disguised program", () => {
  it("hides on the KINGSTON stick as an .exe next to the holiday photos", () => {
    const node = getBaseNode(EXE_PATH);
    expect(node?.type).toBe("file");
    if (node?.type !== "file") return;
    expect(node.kind).toBe("program");
    expect(node.app).toBe(EXE_APP);
    expect(EXE_PATH.endsWith(".jpg.exe")).toBe(true);
    // The two real photos it imitates are still pictures, not programs.
    expect(getBaseNode("E:\\Photos\\holiday_01.jpg")?.type).toBe("file");
  });
});

describe("USB — crash, slowdown, cure", () => {
  it("running it crashes the PC and leaves it slow until the antivirus cleans it", () => {
    run();
    expect(usbStore.get().stage).toBe("running");
    expect(unlocked()).toEqual([USB_CARD_IDS.doubleExtension]);

    crash();
    expect(usbStore.get().stage).toBe("crashed");
    expect(sessionStore.get().phase).toBe("crash");
    expect(isSlow()).toBe(true);
    expect(healthStore.get().crashes).toBe(1);
    expect(threatStore.get().threats.map((t) => t.id)).toEqual([THREAT_ID]);
    expect(unlocked()).toContain(USB_CARD_IDS.crash);

    clean();
    expect(usbStore.get().stage).toBe("cleaned");
    expect(isSlow()).toBe(false);
    expect(threatStore.get().threats).toHaveLength(0);
    expect(unlocked()).toContain(USB_CARD_IDS.cleaned);
  });

  it("cannot run twice while the PC is infected", () => {
    run();
    crash();
    run();
    expect(usbStore.get().stage).toBe("crashed");
    run();
    expect(usbStore.get().stage).toBe("crashed");
  });

  it("can be run again once it has been cleaned, and crashes again", () => {
    run();
    crash();
    clean();
    run();
    expect(usbStore.get().stage).toBe("running");
    crash();
    expect(isSlow()).toBe(true);
    expect(healthStore.get().crashes).toBe(2);
  });

  it("the antivirus is the cure: cleaning without a crash does nothing", () => {
    clean();
    expect(usbStore.get().stage).toBe("idle");
    expect(isSlow()).toBe(false);
    expect(unlocked()).toEqual([]);
  });

  it("emits the story stages other systems listen for", () => {
    const seen: string[] = [];
    const off = onEvent((e) => {
      if (e.type === "story.stage" && e.story === STORY) seen.push(e.stage);
    });
    run();
    crash();
    clean();
    off();
    expect(seen).toEqual(["running", "crashed", "cleaned"]);
  });
});
