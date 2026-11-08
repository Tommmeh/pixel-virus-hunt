// How far the player has got in Mines (highest field cleared, 1-based), kept across sessions.
import { createStore } from "../../system/store";

export const minesStore = createStore<{ cleared: number }>("vh-mines", { cleared: 0 });
