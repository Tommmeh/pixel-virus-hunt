// Balloon notifications above the system tray (e.g. "Mum says: hello love!").
import { createStore } from "./store";
import type { AppArgs } from "./windows";

export interface Balloon {
  id: number;
  title: string;
  text: string;
  icon: string;
  /** Window to open when the balloon is clicked. */
  open?: { app: string; args?: AppArgs; key?: string; title?: string };
}

export const balloonStore = createStore<Balloon[]>(null, []);
export const useBalloons = balloonStore.use;

let seq = 0;

export function notify(b: Omit<Balloon, "id">) {
  const id = ++seq;
  balloonStore.set((list) => [...list.slice(-2), { ...b, id }]);
  setTimeout(() => dismiss(id), 7000);
  return id;
}

export function dismiss(id: number) {
  balloonStore.set((list) => list.filter((x) => x.id !== id));
}
