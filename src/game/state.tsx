// SHARED CONTRACT — owned by Track A. Award achievements only through useUnlock().
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  type Dispatch,
  type ReactNode,
} from "react";
import { MALWARE, type Symptom } from "./malware";

export type Phase = "title" | "desktop";

export interface GameState {
  phase: Phase;
  /** scam id → unlock timestamp (ms). */
  unlocked: Record<string, number>;
  /** Most recent new unlock; drives the toast. */
  lastUnlock: string | null;
  muted: boolean;
  /** True once saved progress has been loaded from localStorage (client only). */
  hydrated: boolean;
  // --- Dormant infection model (nothing infects yet; see malware.ts) ---
  infections: string[];
  removed: string[];
  falseRemovals: string[];
}

export type Action =
  | { type: "START" }
  | { type: "GO_TITLE" }
  | { type: "UNLOCK"; id: string; now: number }
  | { type: "HYDRATE"; unlocked: Record<string, number>; muted: boolean }
  | { type: "RESET_PROGRESS" }
  | { type: "DISMISS_TOAST" }
  | { type: "TOGGLE_MUTE" }
  // dormant
  | { type: "REMOVE"; id: string }
  | { type: "REMOVE_LEGIT"; id: string }
  | { type: "RESPAWN"; id: string };

export const initialState: GameState = {
  phase: "title",
  unlocked: {},
  lastUnlock: null,
  muted: false,
  hydrated: false,
  infections: [],
  removed: [],
  falseRemovals: [],
};

export function reducer(s: GameState, a: Action): GameState {
  switch (a.type) {
    case "START":
      return { ...s, phase: "desktop", lastUnlock: null };
    case "GO_TITLE":
      return { ...s, phase: "title", lastUnlock: null };
    case "UNLOCK":
      if (s.unlocked[a.id]) return s;
      return { ...s, unlocked: { ...s.unlocked, [a.id]: a.now }, lastUnlock: a.id };
    case "HYDRATE":
      return { ...s, unlocked: { ...a.unlocked, ...s.unlocked }, muted: a.muted, hydrated: true };
    case "RESET_PROGRESS":
      return { ...s, unlocked: {}, lastUnlock: null };
    case "DISMISS_TOAST":
      return { ...s, lastUnlock: null };
    case "TOGGLE_MUTE":
      return { ...s, muted: !s.muted };
    case "REMOVE":
      return s.removed.includes(a.id) ? s : { ...s, removed: [...s.removed, a.id] };
    case "REMOVE_LEGIT":
      return s.falseRemovals.includes(a.id)
        ? s
        : { ...s, falseRemovals: [...s.falseRemovals, a.id] };
    case "RESPAWN":
      return { ...s, removed: s.removed.filter((x) => x !== a.id) };
  }
}

// --- Dormant infection helpers (used by Task Manager / File Explorer / Antivirus) ---
export function isMalwareCleared(s: GameState, malwareId: string) {
  const m = MALWARE.find((x) => x.id === malwareId);
  return !m || m.components.every((c) => s.removed.includes(c.id));
}

export function activeSymptoms(s: GameState): Set<Symptom> {
  const out = new Set<Symptom>();
  for (const id of s.infections) {
    if (isMalwareCleared(s, id)) continue;
    MALWARE.find((m) => m.id === id)?.symptoms.forEach((x) => out.add(x));
  }
  return out;
}

// --- Persistence ---
export const STORAGE_KEY = "virushunt-achievements";
export const MUTE_KEY = "virushunt-muted";

function load(): { unlocked: Record<string, number>; muted: boolean } {
  let unlocked: Record<string, number> = {};
  let muted = false;
  try {
    const raw = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      for (const [k, v] of Object.entries(raw)) if (typeof v === "number") unlocked[k] = v;
    }
  } catch {
    unlocked = {};
  }
  try {
    muted = window.localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    muted = false;
  }
  return { unlocked, muted };
}

function save(s: GameState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s.unlocked));
    window.localStorage.setItem(MUTE_KEY, s.muted ? "1" : "0");
  } catch {
    // storage blocked (private mode etc.) — progress just won't persist
  }
}

const Ctx = createContext<{ state: GameState; dispatch: Dispatch<Action> } | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const loaded = useRef(false);

  // Load on the client only (TanStack Start renders on the server first).
  useEffect(() => {
    loaded.current = true;
    dispatch({ type: "HYDRATE", ...load() });
  }, []);

  useEffect(() => {
    if (loaded.current && state.hydrated) save(state);
  }, [state.unlocked, state.muted, state.hydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useGame() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useGame outside provider");
  return c;
}

/** The ONLY way to award an achievement. Safe to call repeatedly — repeats are ignored. */
export function useUnlock() {
  const { dispatch } = useGame();
  return useCallback((id: string) => dispatch({ type: "UNLOCK", id, now: Date.now() }), [dispatch]);
}
