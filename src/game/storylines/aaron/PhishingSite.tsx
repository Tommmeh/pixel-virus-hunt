// The lookalike "FriendSpace photo album" page at friendspace.com.photo-album.net (no padlock).
// Downloading and opening the "PhotoViewer" infects the PC — silently, with a bland error afterwards.
import { useEffect, useState } from "react";
import { useSettings } from "../../system/settings";
import { infect, PHISH_HOST } from "./story";

type Phase = "page" | "dialog" | "installing" | "failed";

export function PhishingSite() {
  const name = useSettings().userName;
  const [phase, setPhase] = useState<Phase>("page");
  const [pct, setPct] = useState(0);

  useEffect(() => {
    if (phase !== "installing") return;
    const t = setInterval(() => setPct((p) => Math.min(100, p + 10)), 200);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase === "installing" && pct >= 100) {
      infect();
      setPhase("failed");
    }
  }, [phase, pct]);

  return (
    <div className="friendspace phish">
      <div className="fs-header">
        <span className="fs-logo">
          friend<b>space</b>
        </span>
        <nav>
          <span>Home</span>
          <span>Photos</span>
          <span>Log in</span>
        </nav>
      </div>

      <div className="phish-album">
        <h2>{name} was tagged in 12 photos</h2>
        <p>Album: "lol remember this?? 😂" · shared by Linda Taylor</p>
        <div className="phish-thumbs" aria-hidden>
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="phish-thumb">
              🔒
            </span>
          ))}
        </div>

        {phase === "failed" ? (
          <p className="phish-error">
            Sorry, these photos could not be loaded. Please try again later.
          </p>
        ) : phase === "installing" ? (
          <div className="phish-install">
            <p>Installing FriendSpace PhotoViewer...</p>
            <progress className="nes-progress is-primary" value={pct} max={100} />
          </div>
        ) : (
          <>
            <p>These photos are private. Install the free FriendSpace PhotoViewer to see them.</p>
            <button className="nes-btn is-primary" onClick={() => setPhase("dialog")}>
              Download PhotoViewer
            </button>
          </>
        )}
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
                    <td>{PHISH_HOST}</td>
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
    </div>
  );
}
