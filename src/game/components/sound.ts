// Tiny 8-bit sound effects via Web Audio. No assets, SSR-safe, never throws.
type Ctor = typeof AudioContext;
let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
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

function play(notes: number[], step = 0.09, type: OscillatorType = "square") {
  const a = audio();
  if (!a) return;
  try {
    const t0 = a.currentTime;
    notes.forEach((freq, i) => {
      const osc = a.createOscillator();
      const gain = a.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      const t = t0 + i * step;
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + step * 0.95);
      osc.connect(gain).connect(a.destination);
      osc.start(t);
      osc.stop(t + step);
    });
  } catch {
    // ignore audio failures
  }
}

/** Achievement unlocked jingle (C-E-G-C arpeggio). */
export const playUnlock = () => play([523, 659, 784, 1047, 1319], 0.08);

/** All achievements collected fanfare. */
export const playFanfare = () => play([523, 523, 784, 784, 880, 1047, 1319, 1568], 0.12);
