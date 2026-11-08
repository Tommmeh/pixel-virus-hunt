// get-photoviewer.net — the shady download site the fake album sends you to. Generic "free software" page:
// big green button, made-up ratings, no padlock, and an .exe from a site you've never heard of.
// Downloading and opening PhotoViewer_setup.exe infects the PC, silently, with a bland error afterwards.
import { useEffect, useState } from "react";
import { useBrowser } from "../../apps/webvoyager/BrowserContext";
import { aaronStore, DOWNLOAD_HOST, infect, PHISH_URL } from "./story";

type Phase = "page" | "dialog" | "installing" | "done";

export function DownloadSite() {
  const { navigate } = useBrowser();
  const { stage } = aaronStore.use();
  const alreadyInstalled = stage === "infected" || stage === "swarm" || stage === "cleaned";
  const [phase, setPhase] = useState<Phase>(alreadyInstalled ? "done" : "page");
  const [pct, setPct] = useState(0);

  useEffect(() => {
    if (phase !== "installing") return;
    const t = setInterval(() => setPct((p) => Math.min(100, p + 10)), 200);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase === "installing" && pct >= 100) {
      infect();
      setPhase("done");
    }
  }, [phase, pct]);

  return (
    <div className="pvdl">
      <div className="pvdl-head">
        <span className="pvdl-logo">
          Photo<b>Viewer</b> <small>2004</small>
        </span>
        <span className="pvdl-tag">FREE DOWNLOAD</span>
      </div>

      <div className="pvdl-main">
        <div className="pvdl-card">
          <h2>PhotoViewer 2004</h2>
          <p className="pvdl-stars">★★★★★ 4.9 · 2,481,903 downloads</p>
          <p>
            View private albums from FriendSpace and your friends&apos; sites. Fast, safe and 100%
            free!
          </p>

          {phase === "done" ? (
            <div className="pvdl-status">
              <p>PhotoViewer was installed.</p>
              <button className="nes-btn" onClick={() => navigate(PHISH_URL)}>
                Back to the album
              </button>
            </div>
          ) : phase === "installing" ? (
            <div className="pvdl-status">
              <p>Installing PhotoViewer...</p>
              <progress className="nes-progress is-success" value={pct} max={100} />
            </div>
          ) : (
            <button
              className="nes-btn is-success pvdl-btn"
              data-tour="phish-download"
              onClick={() => setPhase("dialog")}
            >
              ⬇ Download now
            </button>
          )}
          <small className="pvdl-small">PhotoViewer_setup.exe · 412 KB · Windows 98/2000/XP</small>
        </div>
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
                    <td>PhotoViewer_setup.exe</td>
                  </tr>
                  <tr>
                    <td>Type:</td>
                    <td>Application, 412 KB</td>
                  </tr>
                  <tr>
                    <td>From:</td>
                    <td>{DOWNLOAD_HOST}</td>
                  </tr>
                </tbody>
              </table>
              <div className="dl-actions">
                <button
                  className="nes-btn is-small is-primary"
                  data-tour="phish-open"
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
    </div>
  );
}
