// The PC's health. Malware can leave it crawling: every action drags and the machine freezes now and
// then. Persisted, because the slowdown has to survive the crash screen, the reboot and the login.
// Storylines infect the PC; PaneGuard Antivirus (system/threats.ts) is the only cure.
import { createStore } from "./store";

export type PcHealth = "clean" | "slow";

export interface HealthState {
  state: PcHealth;
  /** When the machine started misbehaving (ms). */
  since: number;
  /** How many times malware has brought this PC down. */
  crashes: number;
}

export const healthStore = createStore<HealthState>("vh-health", {
  state: "clean",
  since: 0,
  crashes: 0,
});

export const useHealth = healthStore.use;
export const useIsSlow = () => healthStore.use().state === "slow";
export const isSlow = () => healthStore.get().state === "slow";

/** Record an infection. Emits nothing: the lesson cards are what tell the story. */
export function infectPc(now = Date.now()) {
  const s = healthStore.get();
  healthStore.set({
    ...s,
    state: "slow",
    since: s.state === "slow" ? s.since : now,
    crashes: s.crashes + 1,
  });
}

/** The infection is gone: the PC is quick again. */
export function repairPc() {
  healthStore.set((s) => ({ ...s, state: "clean", since: 0 }));
}

/** How long every action drags while the PC is infected. */
export const SLOW_LAG_MS = 900;

/**
 * Run `fn` after the PC's lag. A healthy PC runs it immediately, so call sites don't need a check.
 * Whether the machine is slow is read at click time, not at render time.
 */
export function afterLag(fn: () => void, extraMs = 0) {
  if (!isSlow()) {
    fn();
    return;
  }
  setTimeout(fn, SLOW_LAG_MS + extraMs + Math.floor(Math.random() * 500));
}
