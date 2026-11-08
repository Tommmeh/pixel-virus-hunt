// Phone app state: the Copperleaf disputes call, played out line by line with holds between.
// Timers live in this module so the call keeps going even if the player closes the window.
import { createStore } from "../../system/store";
import { finishBankCall, getCallStep } from "../../storylines/bankCall";

export interface PhoneLine {
  who: "them" | "me" | "note";
  text: string;
}

export interface PhoneState {
  /** The number is ringing but nobody has picked up yet. */
  ringing: boolean;
  active: boolean;
  over: boolean;
  step: string | null;
  /** The call is waiting for the player to pick an answer. */
  waiting: boolean;
  log: PhoneLine[];
}

export const phoneStore = createStore<PhoneState>(null, {
  ringing: false,
  active: false,
  over: false,
  step: null,
  waiting: false,
  log: [],
});
export const usePhone = phoneStore.use;

let timers: number[] = [];
const clearTimers = () => {
  timers.forEach((t) => clearTimeout(t));
  timers = [];
};
const after = (ms: number, fn: () => void) => {
  timers.push(window.setTimeout(fn, ms));
};

const say = (who: PhoneLine["who"], text: string) =>
  phoneStore.set((s) => ({ ...s, log: [...s.log, { who, text }] }));

function enter(id: string) {
  const step = getCallStep(id);
  if (!step) return;
  phoneStore.set((s) => ({ ...s, step: id, waiting: false }));

  let t = 900;
  for (const line of step.lines) {
    const text = line;
    after(t, () => {
      if (phoneStore.get().step === id) say("them", text);
    });
    t += 1_500;
  }

  if (step.choices) {
    after(t, () => {
      if (phoneStore.get().step === id) phoneStore.set((s) => ({ ...s, waiting: true }));
    });
  } else if (step.end) {
    after(t + 2_000, endCall);
  } else if (step.next) {
    const next = step.next;
    after(t + (step.pause ?? 900), () => {
      if (phoneStore.get().step === id) enter(next);
    });
  }
}

function endCall() {
  clearTimers();
  finishBankCall();
  phoneStore.set((s) => ({
    ...s,
    active: false,
    ringing: false,
    waiting: false,
    step: null,
    over: true,
    log: [...s.log, { who: "note", text: "Call ended." }],
  }));
}

/** The bank rings back after the player's email, and the whole thing has to be sat through. */
export function startBankCall() {
  const s = phoneStore.get();
  if (s.ringing || s.active || s.over) return;
  clearTimers();
  phoneStore.set({
    ringing: true,
    active: false,
    over: false,
    step: null,
    waiting: false,
    log: [],
  });
  after(2_600, () => {
    phoneStore.set((s) => ({ ...s, ringing: false, active: true }));
    enter("queue");
  });
}

export function chooseCallOption(index: number) {
  const s = phoneStore.get();
  if (!s.active || !s.step) return;
  const choice = getCallStep(s.step)?.choices?.[index];
  if (!choice) return;
  say("me", choice.text);
  phoneStore.set((s2) => ({ ...s2, waiting: false }));
  enter(choice.next);
}

/** Used by the quest flow to know whether the call has already been taken. */
export const bankCallStarted = () => {
  const s = phoneStore.get();
  return s.ringing || s.active || s.over;
};

/** Clears anything left over from a previous run (story reset). */
export function resetPhone() {
  clearTimers();
  phoneStore.set({
    ringing: false,
    active: false,
    over: false,
    step: null,
    waiting: false,
    log: [],
  });
}
