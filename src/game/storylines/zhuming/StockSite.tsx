// stockladder-trade.com — the "free trading app" page Kevin links in his chat.
// Plain http, an .exe download, and nothing anywhere that says what the app really does.
import { useEffect, useState } from "react";
import type { PageUrl } from "../../apps/webvoyager/url";
import { install, SITE_HOST } from "./story";

type Phase = "page" | "dialog" | "installing" | "done";

export function StockSite({ url }: { url: PageUrl }) {
  const [phase, setPhase] = useState<Phase>(url.path === "/download" ? "dialog" : "page");
  const [pct, setPct] = useState(0);

  useEffect(() => {
    if (phase !== "installing") return;
    const t = setInterval(() => setPct((p) => Math.min(100, p + 10)), 180);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "installing" || pct < 100) return;
    install();
    setPhase("done");
  }, [phase, pct]);

  return (
    <div className="sl">
      <div className="sl-header">
        <span className="sl-logo">
          Stock<b>Ladder</b> Trade
        </span>
        <span>Live prices · group positions · desktop app</span>
      </div>

      <div className="sl-ticker">
        RAMH <span className="st-up">$0.04 ▲ +2,300.00%</span>
        <small>RAM Holdings Inc · opens Tuesday</small>
      </div>

      <div className="sl-hero">
        <h2>The app the RAM Capital group actually uses</h2>
        <p>
          Watch RAMH live, follow the group's entry price and see the position build in real time.
          No account, no subscription, no card details — the app is free for readers of the column.
        </p>
        <ul className="sl-points">
          <li>Live quotes straight from the floor</li>
          <li>The group's running position, updated every minute</li>
          <li>One-click account verification through your own bank</li>
          <li>Runs on any PC from the last ten years</li>
        </ul>
        {phase === "done" ? (
          <p className="sl-foot-note">
            StockLadder Trade is installed. It's on your desktop — message Kevin on PingMe.
          </p>
        ) : (
          <button className="nes-btn is-success sl-download" onClick={() => setPhase("dialog")}>
            Download for Windows — free
          </button>
        )}
        <p className="sl-foot-note">Version 1.0 · 1.2 MB · Requires Windows 98 or later</p>
      </div>

      <div className="sl-foot">
        © 2004 StockLadder Technologies · {SITE_HOST} · This page is not an offer to buy or sell
        securities.
      </div>

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
                    <td>StockLadder_Setup.exe</td>
                  </tr>
                  <tr>
                    <td>Type:</td>
                    <td>Application, 1.2 MB</td>
                  </tr>
                  <tr>
                    <td>From:</td>
                    <td>{SITE_HOST}</td>
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
            <div className="dl-title">Installing StockLadder Trade</div>
            <div className="dl-body">
              <p>Please wait while StockLadder Trade is installed on your computer.</p>
              <progress className="nes-progress is-success" value={pct} max={100} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
