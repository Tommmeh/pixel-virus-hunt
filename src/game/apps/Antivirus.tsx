import { useEffect, useState } from "react";
import { MALWARE } from "../malware";
import { useGame } from "../state";
import { useInfectedComponents } from "./infected";

export function Antivirus() {
  const { state, dispatch } = useGame();
  const comps = useInfectedComponents();
  const [progress, setProgress] = useState<number | null>(null);
  const [found, setFound] = useState<string[] | null>(null);
  useEffect(() => {
    if (progress === null || progress >= 100) return;
    const t = setTimeout(() => setProgress((p) => (p ?? 0) + 5), 150);
    return () => clearTimeout(t);
  }, [progress]);
  useEffect(() => {
    if (progress !== 100) return;
    // Only finds SOME threats on purpose: files of malware marked detectableByAV.
    setFound(
      MALWARE.filter((m) => m.detectableByAV && state.infections.includes(m.id))
        .flatMap((m) => m.components)
        .filter((c) => c.kind === "file" && !state.removed.includes(c.id))
        .map((c) => c.id),
    );
  }, [progress]); // eslint-disable-line react-hooks/exhaustive-deps
  const hits = (found ?? []).flatMap((id) => {
    const c = comps.find((x) => x.id === id);
    return c && c.kind === "file" ? [c] : [];
  });
  const scanning = progress !== null && progress < 100;
  return (
    <div className="text-[10px]">
      <p className="mb-2">AVGuard 2004 — Definitions: 03/2004</p>
      {progress !== null && (
        <progress
          className="nes-progress is-primary"
          value={progress}
          max={100}
          style={{ height: 22 }}
        />
      )}
      {progress === 100 && found && (
        <div className="mt-2">
          {hits.length === 0 ? (
            <p>No threats found. Your computer is protected!</p>
          ) : (
            <ul>
              {hits.map((c) => (
                <li key={c.id} className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-destructive">Threat: {c.name}</span>
                  <button
                    className="nes-btn is-error btn-xs"
                    onClick={() => dispatch({ type: "REMOVE", id: c.id })}
                  >
                    Quarantine
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <button
        className="nes-btn is-primary mt-3"
        onClick={() => {
          setFound(null);
          setProgress(0);
        }}
        disabled={scanning}
      >
        {scanning ? "Scanning..." : "Full Scan"}
      </button>
    </div>
  );
}
