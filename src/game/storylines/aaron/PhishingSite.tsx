// The lookalike "FriendSpace photo album" at friendspace.com.photo-album.net (no padlock).
// It reads as "Mum shared embarrassing photos of you": a few blurred previews, a private-album lock, and one big
// ask — install the "PhotoViewer". Downloading and opening it infects the PC, silently, with a bland error afterwards.
// No warnings here: the clues are the address, the http, and a website wanting you to install a program.
import { useEffect, useState } from "react";
import { getPerson } from "../../system/people";
import { useSettings } from "../../system/settings";
import { infect, PHISH_HOST } from "./story";

type Phase = "page" | "dialog" | "installing" | "failed";

/** Blurred "photos" you can almost make out. */
const PREVIEWS = [
  { emoji: "🎂", bg: "linear-gradient(135deg, #f7c6d9, #f39c6b)" },
  { emoji: "🏖️", bg: "linear-gradient(180deg, #8fd0ff 55%, #f2d58a 55%)" },
  { emoji: "🎤", bg: "linear-gradient(135deg, #6b4bb0, #e76e55)" },
];

export function PhishingSite() {
  const name = useSettings().userName;
  const mum = getPerson("mum");
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

      <div className="phish-page">
        {/* Looks just like Mum's post on the real site. */}
        <div className="fs-post phish-card">
          <span className="fs-avatar">{mum?.avatar ?? "🌷"}</span>
          <div className="fs-post-body">
            <span>
              <b>{mum?.name ?? "Mum"}</b> <small>(Linda Taylor)</small> shared an album with you
            </span>
            <p>OMG is this you?? 😂 look at these pics, I can&apos;t believe it</p>
            <span className="fs-meta">
              Album: &quot;lol remember this?? 😂&quot; · 12 photos · {name} was tagged
            </span>
          </div>
        </div>

        <div className="phish-strip" aria-label="Private photo album">
          {PREVIEWS.map((p) => (
            <span key={p.emoji} className="phish-photo" style={{ background: p.bg }} aria-hidden>
              <span>{p.emoji}</span>
            </span>
          ))}
          <span className="phish-photo is-more" aria-hidden>
            <span>+9</span>
          </span>
          <span className="phish-private">🔒 Private album</span>
        </div>

        <div className="phish-ask">
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
              <p>
                Only friends with <b>FriendSpace PhotoViewer</b> can open private albums. It&apos;s
                free and takes 10 seconds.
              </p>
              <button
                className="nes-btn is-primary phish-download"
                data-tour="phish-download"
                onClick={() => setPhase("dialog")}
              >
                Download PhotoViewer
              </button>
              <small>PhotoViewer_setup.exe · 412 KB · Free</small>
            </>
          )}
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
