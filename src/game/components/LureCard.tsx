// SHARED — owned by Track A. Every scam lure renders through this so they all look and behave the same.
// It never warns the player: the lesson only appears on the achievement card.
import type { Scam } from "../types";
import { useUnlock } from "../state";

interface Props {
  scam: Scam;
  /** Called after either button (e.g. to close the window / go back). */
  onDone?: () => void;
  /** Called only when the player takes the bait (before onDone). */
  onBait?: () => void;
  /** Hide the title/from/url header when the host already shows it (e.g. a browser address bar). */
  hideHeader?: boolean;
  /** Override the safe button text (e.g. "Back") or pass null to hide it. */
  safeLabel?: string | null;
}

// Deterministic per-scam order so the bait isn't always the first button.
const baitFirst = (id: string) => [...id].reduce((n, ch) => n + ch.charCodeAt(0), 0) % 2 === 0;

export function LureCard({ scam, onDone, onBait, hideHeader, safeLabel }: Props) {
  const unlock = useUnlock();
  const { lure } = scam;
  const safeText = safeLabel === undefined ? lure.safe : safeLabel;

  const bait = (
    <button
      key="bait"
      className="nes-btn btn-sm text-left"
      onClick={() => {
        unlock(scam.id);
        onBait?.();
        onDone?.();
      }}
    >
      {lure.bait}
    </button>
  );
  const safe = safeText ? (
    <button key="safe" className="nes-btn btn-sm text-left" onClick={() => onDone?.()}>
      {safeText}
    </button>
  ) : null;

  return (
    <div className="lure text-[10px] leading-relaxed">
      {!hideHeader && (
        <div className="mb-3">
          {lure.from && <p>From: {lure.from}</p>}
          {lure.url && <p className="lure-url">{lure.url}</p>}
          <p className="font-bold">{lure.title}</p>
        </div>
      )}
      <p className="lure-body mb-4">{lure.body}</p>
      <div className="flex flex-col gap-2">{baitFirst(scam.id) ? [bait, safe] : [safe, bait]}</div>
    </div>
  );
}
