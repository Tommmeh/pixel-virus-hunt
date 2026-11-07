import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from "react";
import { MALWARE, SCENARIOS, type Symptom } from "./data";

export type Phase = "title" | "scenario" | "investigate" | "debrief" | "score";

export interface GameState {
  phase: Phase;
  scenarioIndex: number;
  choices: Record<string, "safe" | "risky">;
  infections: string[];
  removed: string[];
  falseRemovals: string[];
  startTime: number;
  endTime: number;
  gaveUp: boolean;
}

export type Action =
  | { type: "START"; now: number }
  | { type: "CHOOSE"; scenarioId: string; risky: boolean; now: number }
  | { type: "REMOVE"; id: string; now: number }
  | { type: "REMOVE_LEGIT"; id: string }
  | { type: "RESPAWN"; id: string }
  | { type: "GIVE_UP"; now: number }
  | { type: "SHOW_SCORE" }
  | { type: "RESTART" };

export const initialState: GameState = {
  phase: "title",
  scenarioIndex: 0,
  choices: {},
  infections: [],
  removed: [],
  falseRemovals: [],
  startTime: 0,
  endTime: 0,
  gaveUp: false,
};

export function allComponentIds(infections: string[]) {
  return MALWARE.filter((m) => infections.includes(m.id)).flatMap((m) => m.components.map((c) => c.id));
}

export function isMalwareCleared(s: GameState, malwareId: string) {
  const m = MALWARE.find((x) => x.id === malwareId)!;
  return m.components.every((c) => s.removed.includes(c.id));
}

export function activeSymptoms(s: GameState): Set<Symptom> {
  const out = new Set<Symptom>();
  for (const id of s.infections) {
    if (isMalwareCleared(s, id)) continue;
    MALWARE.find((m) => m.id === id)!.symptoms.forEach((x) => out.add(x));
  }
  return out;
}

export function reducer(s: GameState, a: Action): GameState {
  switch (a.type) {
    case "START":
      return { ...initialState, phase: "scenario", startTime: a.now };
    case "CHOOSE": {
      const sc = SCENARIOS.find((x) => x.id === a.scenarioId)!;
      const choices = { ...s.choices, [a.scenarioId]: a.risky ? ("risky" as const) : ("safe" as const) };
      const infections = a.risky ? [...s.infections, sc.infects] : s.infections;
      const next = s.scenarioIndex + 1;
      if (next < SCENARIOS.length) return { ...s, choices, infections, scenarioIndex: next };
      if (infections.length === 0) return { ...s, choices, infections, scenarioIndex: next, phase: "debrief", startTime: a.now, endTime: a.now };
      return { ...s, choices, infections, scenarioIndex: next, phase: "investigate", startTime: a.now };
    }
    case "REMOVE": {
      if (s.removed.includes(a.id)) return s;
      const removed = [...s.removed, a.id];
      const done = allComponentIds(s.infections).every((id) => removed.includes(id));
      return done ? { ...s, removed, phase: "debrief", endTime: a.now } : { ...s, removed };
    }
    case "REMOVE_LEGIT":
      return s.falseRemovals.includes(a.id) ? s : { ...s, falseRemovals: [...s.falseRemovals, a.id] };
    case "RESPAWN":
      return { ...s, removed: s.removed.filter((x) => x !== a.id) };
    case "GIVE_UP":
      return { ...s, phase: "debrief", endTime: a.now, gaveUp: true };
    case "SHOW_SCORE":
      return { ...s, phase: "score" };
    case "RESTART":
      return initialState;
  }
}

export function computeScore(s: GameState) {
  const total = s.infections.length;
  const found = s.infections.filter((id) => isMalwareCleared(s, id)).length;
  const seconds = Math.max(0, Math.round((s.endTime - s.startTime) / 1000));
  const riskyChoices = Object.values(s.choices).filter((c) => c === "risky").length;
  const score = Math.max(
    0,
    (SCENARIOS.length - riskyChoices) * 300 + found * 500 - s.falseRemovals.length * 150 - Math.min(seconds, 600),
  );
  const rating =
    riskyChoices === 0 ? "S" : s.gaveUp ? "D" : s.falseRemovals.length === 0 && seconds < 240 ? "A" : s.falseRemovals.length <= 2 ? "B" : "C";
  return { total, found, seconds, riskyChoices, score, rating, falseRemovals: s.falseRemovals.length };
}

const Ctx = createContext<{ state: GameState; dispatch: Dispatch<Action> } | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useGame() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useGame outside provider");
  return c;
}
