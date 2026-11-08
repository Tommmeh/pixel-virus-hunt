// PaneGuard Antivirus — scans for threats that storylines put on the PC (system/threats.ts) and removes them.
import { useEffect, useState } from "react";
import { PixelIcon } from "../../components/PixelIcon";
import { threatStore, removeThreat, type Threat } from "../../system/threats";

const SCAN_PATHS = [
  "C:\\WINDOWS\\System32\\kernel32.dll",
  "C:\\WINDOWS\\System32\\hal.dll",
  "C:\\WINDOWS\\Temp",
  "C:\\Documents and Settings\\User\\My Documents",
  "C:\\Documents and Settings\\User\\Desktop",
  "C:\\Program Files\\WebVoyager",
  "C:\\Program Files\\PingMe Messenger",
  "E:\\",
];

type Phase = "idle" | "scanning" | "results" | "removed";

export function Antivirus() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [pct, setPct] = useState(0);
  const [found, setFound] = useState<Threat[]>([]);
  const [lastScan, setLastScan] = useState<string | null>(null);

  useEffect(() => {
    if (phase !== "scanning") return;
    const t = setInterval(() => setPct((p) => Math.min(100, p + 4)), 120);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "scanning" || pct < 100) return;
    setFound(threatStore.get().threats);
    setLastScan(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
    setPhase("results");
  }, [phase, pct]);

  const scanning = phase === "scanning";

  return (
    <div className="paneguard">
      <div className="pg-head">
        <PixelIcon name="shield" size={40} />
        <div>
          <b>PaneGuard Antivirus 2004</b>
          <p>Real-time protection: ON · Definitions: 09/2004</p>
          <p>Last scan: {lastScan ?? "never"}</p>
        </div>
      </div>

      <div className="pg-main">
        {phase === "idle" && <p>Run a full scan to check your computer for viruses and worms.</p>}

        {scanning && (
          <>
            <p>Scanning {SCAN_PATHS[Math.floor((pct / 100) * (SCAN_PATHS.length - 1))]}...</p>
            <progress className="nes-progress is-primary" value={pct} max={100} />
          </>
        )}

        {phase === "results" &&
          (found.length === 0 ? (
            <p className="pg-ok">No threats found. Your computer is clean.</p>
          ) : (
            <>
              <p className="pg-bad">
                {found.length} threat{found.length > 1 ? "s" : ""} found!
              </p>
              <div className="pg-table">
                <table className="nes-table is-bordered">
                  <thead>
                    <tr>
                      <th>Threat</th>
                      <th>Type</th>
                      <th>Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {found.map((t) => (
                      <tr key={t.id}>
                        <td>{t.name}</td>
                        <td>{t.kind}</td>
                        <td>
                          {t.location}
                          {t.copies ? ` (+${t.copies} copies)` : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                className="nes-btn is-error"
                onClick={() => {
                  // Remove everything on the PC right now, not just the rows this scan collected:
                  // a second threat can arrive while the results screen is up (e.g. installing
                  // another storyline's program), and it has to be cleared in the same go.
                  for (const t of threatStore.get().threats) removeThreat(t.id);
                  setFound(threatStore.get().threats);
                  setPhase("removed");
                }}
              >
                Remove threats
              </button>
            </>
          ))}

        {phase === "removed" && (
          <p className="pg-ok">All threats removed. Your computer is clean.</p>
        )}
      </div>

      <div className="pg-actions">
        <button
          className="nes-btn is-primary"
          disabled={scanning}
          onClick={() => {
            setPct(0);
            setPhase("scanning");
          }}
        >
          {scanning ? "Scanning..." : "Full Scan"}
        </button>
      </div>
    </div>
  );
}
