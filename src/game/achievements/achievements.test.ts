import { beforeEach, describe, expect, it } from "vitest";
import type { SystemEvent } from "../system/events";
import { ACHIEVEMENTS, achievementStore, earn, newlyEarned } from "./achievements";

beforeEach(() => achievementStore.reset());

describe("achievements", () => {
  it("have unique ids and something to do", () => {
    const ids = ACHIEVEMENTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const a of ACHIEVEMENTS) expect(a.description.trim(), a.id).not.toBe("");
  });

  it("unlock from the matching event, once", () => {
    const usb: SystemEvent = { type: "drive.open", drive: "E:" };
    expect(earn(usb).map((a) => a.id)).toEqual(["plugged-in"]);
    expect(earn(usb)).toEqual([]); // already earned
    expect(earn({ type: "drive.open", drive: "C:" })).toEqual([]);
  });

  it("covers the basics: flash drive, e-mail and bank log-ins", () => {
    const got = (e: SystemEvent) => newlyEarned(e, {}).map((a) => a.id);
    expect(got({ type: "mail.signin", ok: true })).toEqual(["inbox"]);
    expect(got({ type: "mail.signin", ok: false })).toEqual([]);
    expect(got({ type: "bank.login", ok: true })).toEqual(["banker"]);
  });
});
