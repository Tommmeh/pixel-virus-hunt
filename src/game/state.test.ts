import { describe, expect, it } from "vitest";
import { initialState, reducer, activeSymptoms } from "./state";
import { SCENARIOS, MALWARE } from "./data";

const playAll = (riskyIds: string[]) => {
  let s = reducer(initialState, { type: "START", now: 0 });
  for (const sc of SCENARIOS) s = reducer(s, { type: "CHOOSE", scenarioId: sc.id, risky: riskyIds.includes(sc.id), now: 0 });
  return s;
};

describe("game rules", () => {
  it("all safe choices skip investigation", () => {
    expect(playAll([]).phase).toBe("debrief");
  });
  it("risky choice infects silently and starts investigation", () => {
    const s = playAll(["usb"]);
    expect(s.phase).toBe("investigate");
    expect(s.infections).toEqual(["worm"]);
  });
  it("win only after every component (process, file, startup) is removed", () => {
    let s = playAll(["usb"]);
    const comps = MALWARE.find((m) => m.id === "worm")!.components;
    comps.slice(0, -1).forEach((c) => (s = reducer(s, { type: "REMOVE", id: c.id, now: 1 })));
    expect(s.phase).toBe("investigate");
    s = reducer(s, { type: "REMOVE", id: comps.at(-1)!.id, now: 1 });
    expect(s.phase).toBe("debrief");
    expect(activeSymptoms(s).size).toBe(0);
  });
});
