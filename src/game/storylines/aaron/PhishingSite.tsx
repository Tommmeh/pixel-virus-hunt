// The lookalike "FriendSpace photo album" at friendspace.com.photo-album.net (no padlock).
// It reads as "Mum shared embarrassing photos of you": a few blurred previews, a private-album lock, and a link
// to go and get the "PhotoViewer" — on a separate download site (DownloadSite.tsx), where the infection happens.
// No warnings here: the clues are the address, the http, and a website wanting you to install a program.
import { useBrowser } from "../../apps/webvoyager/BrowserContext";
import { getPerson } from "../../system/people";
import { useSettings } from "../../system/settings";
import { aaronStore, DOWNLOAD_URL } from "./story";

/** Blurred "photos" you can almost make out. */
const PREVIEWS = [
  { emoji: "🎂", bg: "linear-gradient(135deg, #f7c6d9, #f39c6b)" },
  { emoji: "🏖️", bg: "linear-gradient(180deg, #8fd0ff 55%, #f2d58a 55%)" },
  { emoji: "🎤", bg: "linear-gradient(135deg, #6b4bb0, #e76e55)" },
];

export function PhishingSite() {
  const name = useSettings().userName;
  const mum = getPerson("mum");
  const { navigate } = useBrowser();
  // Once the "viewer" has been installed, the album still never opens.
  const { stage } = aaronStore.use();
  const installed = stage === "infected" || stage === "swarm" || stage === "cleaned";

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
          {installed ? (
            <p className="phish-error">
              Sorry, these photos could not be loaded. Please try again later.
            </p>
          ) : (
            <>
              <p>
                This album is private. To view it, you need <b>PhotoViewer</b>, the free photo
                viewer for FriendSpace.
              </p>
              <button
                className="nes-btn is-primary phish-download"
                data-tour="phish-get"
                onClick={() => navigate(DOWNLOAD_URL)}
              >
                Get PhotoViewer (free)
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
