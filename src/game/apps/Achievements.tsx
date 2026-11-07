import { useState } from "react";
import { PixelIcon } from "../components/PixelIcon";
import { SCAMS } from "../scams";
import { useGame } from "../state";
import type { Scam } from "../types";

type Filter = "all" | "retro" | "modern";

function Card({ scam, at }: { scam: Scam; at?: number | undefined }) {
  if (!at) {
    return (
      <li className="ach-card is-locked">
        <div className="flex items-center gap-2">
          <PixelIcon name="lock" size={28} />
          <span className="text-[10px]">???</span>
        </div>
        <p className="mt-2 text-[8px] leading-relaxed">Hint: {scam.hint}</p>
      </li>
    );
  }
  return (
    <li className="ach-card">
      <details>
        <summary className="flex cursor-pointer items-center gap-2">
          <PixelIcon name={scam.icon} size={28} />
          <span className="flex flex-col gap-1">
            <span className="text-[10px]">{scam.name}</span>
            <span className="text-[8px] opacity-70">
              {scam.type} · {scam.era === "retro" ? "Retro" : "Modern"}
            </span>
          </span>
        </summary>
        <div className="mt-3 flex flex-col gap-2 text-[8px] leading-relaxed">
          <p>{scam.whatHappened}</p>
          <div>
            <p className="mb-1">Red flags:</p>
            <ul className="ach-flags">
              {scam.redFlags.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
          <p className="text-primary">Stay safe: {scam.tip}</p>
          <p className="opacity-60">Unlocked {new Date(at).toLocaleDateString()}</p>
        </div>
      </details>
    </li>
  );
}

export function Achievements() {
  const { state, dispatch } = useGame();
  const [filter, setFilter] = useState<Filter>("all");
  const [confirmReset, setConfirmReset] = useState(false);
  const total = SCAMS.length;
  const got = SCAMS.filter((s) => state.unlocked[s.id]).length;
  const shown = SCAMS.filter((s) => filter === "all" || s.era === filter).sort(
    (a, b) => Number(!state.unlocked[a.id]) - Number(!state.unlocked[b.id]),
  );

  return (
    <div className="text-[10px]">
      <div className="mb-3 flex items-center gap-3">
        <PixelIcon name="trophy" size={32} />
        <div className="flex-1">
          <p className="mb-1">
            {got} / {total} scams collected
          </p>
          <progress
            className="nes-progress is-success"
            value={got}
            max={total}
            style={{ height: 16 }}
          />
        </div>
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        {(["all", "retro", "modern"] as const).map((f) => (
          <button
            key={f}
            className={`nes-btn btn-xs ${filter === f ? "is-primary" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "All" : f === "retro" ? "Retro" : "Modern"}
          </button>
        ))}
      </div>
      <ul className="ach-grid">
        {shown.map((s) => (
          <Card key={s.id} scam={s} at={state.unlocked[s.id]} />
        ))}
      </ul>
      <div className="mt-4 flex justify-end gap-2">
        {confirmReset ? (
          <>
            <span className="self-center text-[8px]">Erase all progress?</span>
            <button
              className="nes-btn is-error btn-xs"
              onClick={() => {
                dispatch({ type: "RESET_PROGRESS" });
                setConfirmReset(false);
              }}
            >
              Yes, reset
            </button>
            <button className="nes-btn btn-xs" onClick={() => setConfirmReset(false)}>
              Cancel
            </button>
          </>
        ) : (
          <button className="nes-btn btn-xs" onClick={() => setConfirmReset(true)} disabled={!got}>
            Reset progress
          </button>
        )}
      </div>
    </div>
  );
}
