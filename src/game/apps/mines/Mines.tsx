import { useEffect, useState } from "react";
import { emit } from "../../system/events";
import { wm, type Win } from "../../system/windows";
import { LEVELS, levelIndex, newBoardFor, reveal, toggleFlag } from "./logic";
import { minesStore } from "./store";

const COLORS = [
  "",
  "#0000ff",
  "#008000",
  "#ff0000",
  "#000080",
  "#800000",
  "#008080",
  "#000",
  "#808080",
];

/** The 9×9 window is 236×330; every extra column or row adds one 22px cell. */
const sizeFor = (level: number) => {
  const l = LEVELS[levelIndex(level)]!;
  return { w: 236 + (l.w - 9) * 22, h: 330 + (l.h - 9) * 22 };
};

export function Mines({ win }: { win: Win }) {
  const { cleared } = minesStore.use();
  const [idx, setIdx] = useState(() => levelIndex(cleared));
  const [b, setB] = useState(() => newBoardFor(cleared));
  const [pressing, setPressing] = useState(false);
  const [secs, setSecs] = useState(0);

  const field = LEVELS[idx]!;
  const last = idx === LEVELS.length - 1;

  const play = (level: number) => {
    const next = levelIndex(level);
    setIdx(next);
    setB(newBoardFor(next));
    setSecs(0);
  };

  // A bigger field needs a bigger window.
  useEffect(() => {
    if (win.max) return;
    const { w, h } = sizeFor(idx);
    wm.resize(win.key, w, h);
  }, [idx, win.key, win.max]);

  // Clearing a field records it and tells the rest of the PC (the Mine Pro achievement).
  useEffect(() => {
    if (b.state !== "won") return;
    emit({ type: "mines.clear", level: idx + 1 });
    minesStore.set((s) => ({ cleared: Math.max(s.cleared, idx + 1) }));
  }, [b.state, idx]);

  useEffect(() => {
    if (b.state !== "playing") return;
    const t = setInterval(() => setSecs((s) => Math.min(999, s + 1)), 1000);
    return () => clearInterval(t);
  }, [b.state]);

  const flags = b.cells.filter((c) => c.flag).length;
  const face = b.state === "lost" ? "😵" : b.state === "won" ? "😎" : pressing ? "😮" : "🙂";
  const led = (n: number) => String(Math.max(-99, Math.min(999, n))).padStart(3, "0");

  return (
    <div className="mines" onContextMenu={(e) => e.preventDefault()}>
      <div className="mines-head">
        <span className="mines-led">{led(b.mines - flags)}</span>
        <button
          className="mines-face"
          onClick={() => {
            setB(newBoardFor(idx));
            setSecs(0);
          }}
          aria-label="New game"
        >
          {face}
        </button>
        <span className="mines-led">{led(secs)}</span>
      </div>
      <div
        className="mines-grid"
        style={{ gridTemplateColumns: `repeat(${b.w}, 22px)` }}
        onPointerUp={() => setPressing(false)}
        onPointerLeave={() => setPressing(false)}
      >
        {b.cells.map((c, i) => (
          <button
            key={i}
            className={`mines-cell ${c.open ? "is-open" : ""} ${c.open && c.mine ? "is-mine" : ""}`}
            onPointerDown={(e) => e.button === 0 && !c.open && setPressing(true)}
            onClick={() => setB((x) => reveal(x, i))}
            onContextMenu={(e) => {
              e.preventDefault();
              setB((x) => toggleFlag(x, i));
            }}
            aria-label={c.open ? (c.mine ? "mine" : String(c.n)) : c.flag ? "flag" : "hidden"}
            style={c.open && c.n ? { color: COLORS[c.n] } : undefined}
          >
            {c.open ? (c.mine ? "✹" : c.n || "") : c.flag ? "⚑" : ""}
          </button>
        ))}
      </div>
      {b.state === "won" && (
        <p className="mines-msg">
          {last ? "Every field cleared! 🏆" : `Field cleared — ${field.mines} mines! 🎉`}
        </p>
      )}
      {b.state === "lost" && <p className="mines-msg">Boom! Click the face to try again.</p>}
      {b.state === "playing" && (
        <p className="mines-msg">
          {field.mines} mines · {field.label}
        </p>
      )}
      {b.state !== "playing" && (
        <div className="mines-actions">
          {b.state === "won" && !last && (
            <button className="nes-btn is-success mines-btn" onClick={() => play(idx + 1)}>
              Try {LEVELS[idx + 1]!.mines} mines
            </button>
          )}
          {idx > 0 && (
            <button className="nes-btn mines-btn" onClick={() => play(idx - 1)}>
              Back to {LEVELS[idx - 1]!.mines}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
