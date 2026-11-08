// get-photoviewer.net — where Mum's (hacked) "OMG is this you??" link really goes: a shady free-download site that says
// the photos need its "PhotoViewer" to open. Generic 2004 download page: big green button, made-up ratings, no padlock.
// Downloading and opening PhotoViewer_setup.exe infects the PC, silently, with a bland error afterwards.
// No warnings here: the clues are the address (not FriendSpace), the http, and a link that wants you to install a program.
import { useEffect, useState } from "react";
import { getPerson } from "../../system/people";
import { useSettings } from "../../system/settings";
import { aaronStore, infect, PHISH_HOST } from "./story";

type Phase = "page" | "dialog" | "installing" | "done";

/** Blurred "photos" you can almost make out. */
const PREVIEWS = [
  { emoji: "🎂", bg: "linear-gradient(135deg, #f7c6d9, #f39c6b)" },
  { emoji: "🏖️", bg: "linear-gradient(180deg, #8fd0ff 55%, #f2d58a 55%)" },
  { emoji: "🎤", bg: "linear-gradient(135deg, #6b4bb0, #e76e55)" },
];

export function DownloadSite() {
  const name = useSettings().userName;
  const mum = getPerson("mum");
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
        {/* Why you're here: the shared album the link promised. */}
        <div className="pvdl-album">
          <p>
            <span aria-hidden>{mum?.avatar ?? "🌷"}</span> <b>Linda Taylor</b> shared{" "}
            <b>12 photos</b> with you: &quot;lol remember this?? 😂&quot; · {name} was tagged
          </p>
          <div className="phish-strip" aria-label="Private photo album">
            {PREVIEWS.map((p) => (
              <span key={p.emoji} className="phish-photo" style={{ background: p.bg }} aria-hidden>
                <span>{p.emoji}</span>
              </span>
            ))}
            <span className="phish-photo is-more" aria-hidden>
              <span>+9</span>
            </span>
            <span className="phish-private">
              {phase === "done" ? "Could not be loaded" : "🔒 Private album"}
            </span>
          </div>
        </div>

        <div className="pvdl-card">
          <h2>PhotoViewer 2004</h2>
          <p className="pvdl-stars">★★★★★ 4.9 · 2,481,903 downloads</p>

          {phase === "done" ? (
            <div className="pvdl-status">
              <p>PhotoViewer was installed. Opening album...</p>
              <p className="phish-error">
                Sorry, these photos could not be loaded. Please try again later.
              </p>
            </div>
          ) : phase === "installing" ? (
            <div className="pvdl-status">
              <p>Installing PhotoViewer...</p>
              <progress className="nes-progress is-success" value={pct} max={100} />
            </div>
          ) : (
            <>
              <p>The free way to view private photo albums. Fast, safe and 100% free!</p>
              <button
                className="nes-btn is-success pvdl-btn"
                data-tour="phish-download"
                onClick={() => setPhase("dialog")}
              >
                ⬇ Download now
              </button>
            </>
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
                    <td>{PHISH_HOST}</td>
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
