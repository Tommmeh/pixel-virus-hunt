import { describe, expect, it } from "vitest";
import { initialState, reducer } from "./state";

describe("achievement state", () => {
  it("START goes to the desktop and keeps progress", () => {
    const s = reducer({ ...initialState, unlocked: { "sys-usb": 1 } }, { type: "START" });
    expect(s.phase).toBe("desktop");
    expect(s.unlocked).toEqual({ "sys-usb": 1 });
  });

  it("UNLOCK records the scam once and triggers the toast", () => {
    const s = reducer(initialState, { type: "UNLOCK", id: "sys-usb", now: 42 });
    expect(s.unlocked).toEqual({ "sys-usb": 42 });
    expect(s.lastUnlock).toBe("sys-usb");
  });

  it("repeat UNLOCK is a no-op (no second toast, original time kept)", () => {
    let s = reducer(initialState, { type: "UNLOCK", id: "sys-usb", now: 1 });
    s = reducer(s, { type: "DISMISS_TOAST" });
    const again = reducer(s, { type: "UNLOCK", id: "sys-usb", now: 99 });
    expect(again).toBe(s);
    expect(again.lastUnlock).toBeNull();
  });

  it("HYDRATE merges saved progress without dropping fresh unlocks", () => {
    let s = reducer(initialState, { type: "UNLOCK", id: "email-password", now: 5 });
    s = reducer(s, { type: "HYDRATE", unlocked: { "sys-wifi": 1 }, muted: true });
    expect(s.unlocked).toEqual({ "sys-wifi": 1, "email-password": 5 });
    expect(s.muted).toBe(true);
    expect(s.hydrated).toBe(true);
  });

  it("RESET_PROGRESS clears all achievements", () => {
    let s = reducer(initialState, { type: "UNLOCK", id: "sys-usb", now: 1 });
    s = reducer(s, { type: "RESET_PROGRESS" });
    expect(s.unlocked).toEqual({});
    expect(s.lastUnlock).toBeNull();
  });

  it("TOGGLE_MUTE flips the mute flag", () => {
    expect(reducer(initialState, { type: "TOGGLE_MUTE" }).muted).toBe(true);
  });
});
