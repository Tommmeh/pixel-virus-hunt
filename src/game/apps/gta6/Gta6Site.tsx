// www.gta6-beta.com — the "leaked GTA6 beta" bookmark. Big green download button, a countdown to a
// release that never comes, and a 12 MB .exe nobody asked what was inside.
import { useEffect, useState } from "react";
import { GTA6_EXE, GTA6_HOST, gta6Store, installGta6 } from "./install";

type Phase = "page" | "dialog" | "installing" | "done";

export function Gta6Site() {
  const [phase, setPhase] = useState<Phase>("page");
  const [pct, setPct] = useState(0);
  const installed = gta6Store.use().installed;

  useEffect(() => {
    if (phase !== "installing") return;
    const t = setInterval(() => setPct((p) => Math.min(100, p + 8)), 160);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "installing" || pct < 100) return;
    installGta6();
    setPhase("done");
  }, [phase, pct]);

  const done = phase === "done" || (installed && phase === "page");

  return (
    <div
      style={{ padding: 14, fontFamily: "var(--font-body)", color: "#111", textAlign: "center" }}
    >
      <div
        style={{
          background: "linear-gradient(180deg,#14002b,#2b0060)",
          color: "#f7d51d",
          padding: "14px 10px",
          border: "3px solid #000",
          fontFamily: "var(--font-sans)",
          fontSize: 16,
        }}
      >
        GRAND THEFT AUTO VI — BETA
        <div style={{ fontSize: 7, color: "#9ef", marginTop: 6 }}>
          leaked build 0.4.1 · play as anyone · 1,000,000 cars
        </div>
      </div>

      <p style={{ fontSize: 9, lineHeight: 1.7, margin: "12px 0" }}>
        The full game is not out until 2026. This is the build the testers had. No installer key, no
        account, no survey — just download it before the lawyers wake up.
      </p>

      <div style={{ fontSize: 8, color: "#4a4a4a", marginBottom: 10 }}>
        ✦ 6,204,881 downloads · ★★★★☆ 4.6 · <b>100% virus free (we checked)</b>
      </div>

      {done ? (
        <div style={{ fontSize: 9 }}>
          <b>{GTA6_EXE} is installed.</b>
          <p style={{ margin: "6px 0 0" }}>Look for it on your desktop.</p>
        </div>
      ) : (
        <button className="nes-btn is-success" onClick={() => setPhase("dialog")}>
          ⬇ Download {GTA6_EXE} — free
        </button>
      )}

      <p style={{ fontSize: 7, color: "#555", marginTop: 12 }}>
        {GTA6_EXE} · 12.4 MB · Windows 98/2000/XP · {GTA6_HOST}
      </p>

      {phase === "dialog" && (
        <div className="dl-overlay">
          <div className="dl-box" role="dialog" aria-label="File Download">
            <div className="dl-title">File Download</div>
            <div className="dl-body">
              <p>Do you want to open or save this file?</p>
              <table>
                <tbody>
                  <tr>
                    <td>Name:</td>
                    <td>{GTA6_EXE}</td>
                  </tr>
                  <tr>
                    <td>Type:</td>
                    <td>Application, 12.4 MB</td>
                  </tr>
                  <tr>
                    <td>From:</td>
                    <td>{GTA6_HOST}</td>
                  </tr>
                </tbody>
              </table>
              <div className="dl-actions">
                <button
                  className="nes-btn is-small is-primary"
                  onClick={() => {
                    setPct(0);
                    setPhase("installing");
                  }}
                >
                  Open
                </button>
                <button className="nes-btn is-small" onClick={() => setPhase("page")}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {phase === "installing" && (
        <div className="dl-overlay">
          <div className="dl-box" role="dialog" aria-label="Installing">
            <div className="dl-title">Installing GTA6 BETA</div>
            <div className="dl-body">
              <p>Extracting 4,812 files... do not turn off your computer.</p>
              <progress className="nes-progress is-success" value={pct} max={100} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
