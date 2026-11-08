import { describe, expect, it } from "vitest";
import { activeKey, initialWm, wmReducer, type WmAction, type WmState } from "./windows";

const open = (key: string, app = key): WmAction => ({
  type: "OPEN",
  key,
  app,
  title: app,
  icon: "file",
  w: 400,
  h: 300,
  vw: 1280,
  vh: 800,
});
const run = (...actions: WmAction[]) => actions.reduce<WmState>(wmReducer, initialWm);

describe("window manager", () => {
  it("opens windows and focuses the newest", () => {
    const s = run(open("a"), open("b"));
    expect(s.wins.map((w) => w.key)).toEqual(["a", "b"]);
    expect(activeKey(s)).toBe("b");
  });

  it("re-opening an existing window focuses it instead of duplicating", () => {
    const s = run(open("a"), open("b"), open("a"));
    expect(s.wins).toHaveLength(2);
    expect(activeKey(s)).toBe("a");
  });

  it("taskbar click minimizes the active window and restores a minimized one", () => {
    let s = run(open("a"));
    s = wmReducer(s, { type: "TASKBAR", key: "a" });
    expect(s.wins[0]!.min).toBe(true);
    expect(activeKey(s)).toBeNull();
    s = wmReducer(s, { type: "TASKBAR", key: "a" });
    expect(s.wins[0]!.min).toBe(false);
    expect(activeKey(s)).toBe("a");
  });

  it("taskbar click on an inactive window brings it to the front", () => {
    const s = wmReducer(run(open("a"), open("b")), { type: "TASKBAR", key: "a" });
    expect(activeKey(s)).toBe("a");
    expect(s.wins.find((w) => w.key === "a")!.min).toBe(false);
  });

  it("toggles maximize, closes, and clamps resize to a minimum size", () => {
    let s = run(open("a"));
    s = wmReducer(s, { type: "TOGGLE_MAX", key: "a" });
    expect(s.wins[0]!.max).toBe(true);
    s = wmReducer(s, { type: "RESIZE", key: "a", w: 10, h: 10 });
    expect(s.wins[0]!.w).toBeGreaterThanOrEqual(200);
    s = wmReducer(s, { type: "CLOSE", key: "a" });
    expect(s.wins).toHaveLength(0);
  });

  it("closes every window of one app (End Process)", () => {
    const s = wmReducer(run(open("chat:priya", "chat"), open("chat:sam", "chat"), open("notepad")), {
      type: "CLOSE_APP",
      app: "chat",
    });
    expect(s.wins.map((w) => w.key)).toEqual(["notepad"]);
  });

  it("focusing clears the flashing taskbar button", () => {
    let s = run(open("a"), open("b"));
    s = wmReducer(s, { type: "FLASH", key: "a", on: true });
    expect(s.wins[0]!.flash).toBe(true);
    s = wmReducer(s, { type: "FOCUS", key: "a" });
    expect(s.wins[0]!.flash).toBe(false);
  });

  it("keeps new windows inside a small screen", () => {
    const s = wmReducer(initialWm, {
      ...(open("big") as Extract<WmAction, { type: "OPEN" }>),
      w: 2000,
      h: 2000,
      vw: 600,
      vh: 500,
    });
    const w = s.wins[0]!;
    expect(w.x + w.w).toBeLessThanOrEqual(600);
    expect(w.y + w.h).toBeLessThanOrEqual(500);
  });
});
