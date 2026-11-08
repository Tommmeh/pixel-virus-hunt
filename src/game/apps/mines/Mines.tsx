import { useEffect, useState } from "react";
import { newBoard, reveal, toggleFlag } from "./logic";

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

export function Mines() {
  const [b, setB] = useState(() => newBoard());
  const [pressing, setPressing] = useState(false);
  const [secs, setSecs] = useState(0);

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
            setB(newBoard());
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
      {b.state === "won" && <p className="mines-msg">You cleared the field! 🎉</p>}
      {b.state === "lost" && <p className="mines-msg">Boom! Click the face to try again.</p>}
    </div>
  );
}
