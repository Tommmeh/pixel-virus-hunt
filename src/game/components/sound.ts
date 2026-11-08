// Tiny synthesized system sounds via Web Audio. No assets, SSR-safe, respects mute/volume settings.
import { settingsStore } from "../system/settings";

type Ctor = typeof AudioContext;
let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const { muted, volume } = settingsStore.get();
  if (muted || volume <= 0) return null;
  try {
    const C: Ctor | undefined =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: Ctor }).webkitAudioContext;
    if (!C) return null;
    ctx ??= new C();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function play(notes: number[], step: number, type: OscillatorType = "sine", gainMax = 0.08) {
  const a = audio();
  if (!a) return;
  const vol = (settingsStore.get().volume / 100) * gainMax;
  try {
    const t0 = a.currentTime;
    notes.forEach((freq, i) => {
      if (!freq) return;
      const osc = a.createOscillator();
      const gain = a.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      const t = t0 + i * step;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(vol, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + step * 1.8);
      osc.connect(gain).connect(a.destination);
      osc.start(t);
      osc.stop(t + step * 2);
    });
  } catch {
    // ignore audio failures
  }
}

/** Gentle start-up chime when logging in. */
export const playStartup = () => play([392, 523, 659, 784, 1047], 0.18, "triangle");
/** New message / notification. */
export const playDing = () => play([880, 1320], 0.09, "sine");
/** Error / warning message box. */
export const playError = () => play([440, 330], 0.12, "square", 0.04);
/** Messenger nudge buzz. */
export const playNudge = () => play([150, 0, 150, 0, 150], 0.06, "sawtooth", 0.05);
/** Log off / shut down. */
export const playShutdown = () => play([784, 659, 523, 392], 0.16, "triangle");
