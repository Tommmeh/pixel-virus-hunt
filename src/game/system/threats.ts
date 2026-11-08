// Malware currently on the PC. Storylines add threats when the player gets infected; PaneGuard Antivirus
// lists and removes them. Removing one emits "threat.removed" so the storyline can clean up its effects.
import { emit } from "./events";
import { createStore } from "./store";

export interface Threat {
  /** Unique id, e.g. "aaron-photoworm". */
  id: string;
  /** Detection name shown by the antivirus, e.g. "W32/PhotoWorm.A". */
  name: string;
  /** Where it lives, e.g. "C:\\...\\PhotoViewer_setup.exe". */
  location: string;
  /** Extra copies the worm made of itself (shown in scan results). */
  copies?: number;
  /** Free text shown in the scan results, e.g. "Worm". */
  kind: string;
}

export const threatStore = createStore<{ threats: Threat[] }>("vh-threats", { threats: [] });
export const useThreats = () => threatStore.use().threats;

export function addThreat(t: Threat) {
  if (threatStore.get().threats.some((x) => x.id === t.id)) return;
  threatStore.set((s) => ({ threats: [...s.threats, t] }));
  emit({ type: "threat.detected", id: t.id });
}

export function updateThreat(id: string, patch: Partial<Omit<Threat, "id">>) {
  threatStore.set((s) => ({
    threats: s.threats.map((t) => (t.id === id ? { ...t, ...patch } : t)),
  }));
}

export function removeThreat(id: string) {
  if (!threatStore.get().threats.some((x) => x.id === id)) return;
  threatStore.set((s) => ({ threats: s.threats.filter((t) => t.id !== id) }));
  emit({ type: "threat.removed", id });
}
