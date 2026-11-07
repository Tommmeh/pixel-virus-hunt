// Tiny shared stores (no context needed). Optionally persisted to localStorage, SSR-safe.
// Each app owns its own store (e.g. "vh-mail") so teammates don't all edit one big reducer.
import { useSyncExternalStore } from "react";

export interface Store<T> {
  key: string | null;
  get: () => T;
  set: (next: T | ((prev: T) => T)) => void;
  subscribe: (fn: () => void) => () => void;
  use: () => T;
  reset: () => void;
}

const ALL: Store<unknown>[] = [];

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);

/**
 * Create a store. Pass a key starting with "vh-" to persist it; pass null for session-only state.
 * Saved objects are shallow-merged over `initial`, so adding new fields later is safe.
 */
export function createStore<T>(key: string | null, initial: T): Store<T> {
  let state = initial;
  let loaded = key === null;
  const subs = new Set<() => void>();

  const load = () => {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    try {
      const raw = window.localStorage.getItem(key!);
      if (raw) {
        const saved: unknown = JSON.parse(raw);
        state = (
          isPlainObject(initial) && isPlainObject(saved) ? { ...initial, ...saved } : saved
        ) as T;
      }
    } catch {
      state = initial;
    }
  };

  const store: Store<T> = {
    key,
    get: () => {
      load();
      return state;
    },
    set: (next) => {
      load();
      state = typeof next === "function" ? (next as (p: T) => T)(state) : next;
      if (key) {
        try {
          window.localStorage.setItem(key, JSON.stringify(state));
        } catch {
          // storage blocked — keep working in memory
        }
      }
      subs.forEach((f) => f());
    },
    subscribe: (fn) => {
      subs.add(fn);
      return () => {
        subs.delete(fn);
      };
    },
    use: () => useSyncExternalStore(store.subscribe, store.get, () => initial),
    reset: () => {
      state = initial;
      if (key) {
        try {
          window.localStorage.removeItem(key);
        } catch {
          // ignore
        }
      }
      subs.forEach((f) => f());
    },
  };
  ALL.push(store as Store<unknown>);
  return store;
}

/** "Reset this PC": wipe every store (persisted and session). */
export function resetAllStores() {
  ALL.forEach((s) => s.reset());
}
