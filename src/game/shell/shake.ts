import { createStore } from "../system/store";

/**
 * How hard the whole screen is shaking: 0 is still, 1 is the full quake just before the ending.
 * QuestFlow ramps it up once the player signs into the bank with Emma's last email in the inbox.
 */
export const shakeStore = createStore<{ amount: number }>(null, { amount: 0 });
export const useShake = () => shakeStore.use().amount;
export const setShake = (amount: number) => shakeStore.set({ amount });
