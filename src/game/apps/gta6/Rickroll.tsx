// What GTA6_BETA.exe really is: a 2004-style media player with one clip, and it starts on its own.
// If a real video has been dropped into public/gta6/ it plays that file; otherwise (or if the file is
// too slow to start) it falls back to the built-in pixel version, so the joke never shows a black box.
import { useEffect, useRef, useState } from "react";
import { playRickroll } from "../../components/sound";

/** Drop your own clip here (e.g. a 1987 pop video) and the player uses it instead of the pixel Rick. */
export const VIDEO_SRC = "/gta6/rickroll.mp4";

/** If the video hasn't produced a frame by then, the pixel clip takes over. */
const VIDEO_TIMEOUT_MS = 10_000;

/** The pixel clip's own running time: the song is 3:32 long. */
const PIXEL_LENGTH = 212;

const LYRICS = [
  "We're no strangers to love",
  "You know the rules, and so do I",
  "A full commitment's what I'm thinking of",
  "You wouldn't get this from any other guy",
  "Never gonna give you up",
  "Never gonna let you down",
  "Never gonna run around and desert you",
  "Never gonna make you cry",
  "Never gonna say goodbye",
  "Never gonna tell a lie and hurt you",
];

const clock = (seconds: number) => {
  const total = Number.isFinite(seconds) && seconds > 0 ? Math.round(seconds) : 0;
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
};

/** The (very pixel) man himself — used when there is no video file to play. */
function Rick({ bob }: { bob: number }) {
  return (
    <div style={{ transform: `translateY(${bob}px)`, transition: "transform 220ms ease-in-out" }}>
      <div style={{ width: 46, height: 14, background: "#8a3b12", margin: "0 auto" }} />
      <div
        style={{
          width: 38,
          height: 30,
          background: "#f0c090",
          margin: "0 auto",
          borderBottom: "3px solid #b98b62",
          position: "relative",
        }}
      >
        <span style={{ position: "absolute", left: 7, top: 9, fontSize: 9 }}>▪▪</span>
        <span style={{ position: "absolute", right: 7, top: 9, fontSize: 9 }}>▪▪</span>
      </div>
      <div style={{ width: 54, height: 34, background: "#2b3f8f", margin: "0 auto" }}>
        <div style={{ width: 16, height: 30, background: "#f0c090", margin: "0 auto" }} />
      </div>
      <div style={{ width: 54, height: 26, background: "#1c2a63", margin: "0 auto" }} />
    </div>
  );
}

export function Rickroll() {
  /** "video" until the file fails or never starts, then the pixel clip takes over. */
  const [mode, setMode] = useState<"video" | "pixel">("video");
  const video = useRef<HTMLVideoElement | null>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(true);
  // Browsers only autoplay muted, so the video starts silent and the player offers the sound.
  const [muted, setMuted] = useState(true);

  // Whatever the clip turns out to be, the transport bar shows its real length and position.
  const [length, setLength] = useState(PIXEL_LENGTH);
  const [position, setPosition] = useState(0);

  const [line, setLine] = useState(0);
  const [bob, setBob] = useState(0);

  const pixel = mode === "pixel";

  useEffect(() => {
    if (video.current) video.current.muted = muted;
  }, [muted, mode]);

  // A big or awkwardly encoded file can sit there fetching for ever. Rather than show a black window,
  // give it ten seconds and then play the pixel clip instead.
  useEffect(() => {
    if (pixel || ready) return;
    const t = setTimeout(() => setMode("pixel"), VIDEO_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [pixel, ready]);

  // The pixel clip is a video nobody pressed play on; its soundtrack is synthesized.
  useEffect(() => {
    if (!pixel) return;
    setLength(PIXEL_LENGTH);
    playRickroll();
  }, [pixel]);

  useEffect(() => {
    if (!pixel || !playing) return;
    const t = setInterval(() => setLine((n) => (n + 1) % LYRICS.length), 2400);
    return () => clearInterval(t);
  }, [pixel, playing]);

  useEffect(() => {
    if (!pixel || !playing) return;
    const t = setInterval(() => setBob((b) => (b === 0 ? -3 : 0)), 420);
    return () => clearInterval(t);
  }, [pixel, playing]);

  const readLength = (el: HTMLVideoElement) => {
    if (Number.isFinite(el.duration) && el.duration > 0) setLength(el.duration);
  };

  const toggle = () => {
    const v = video.current;
    if (pixel || !v) {
      setPlaying((p) => !p);
      return;
    }
    if (v.paused) void v.play();
    else v.pause();
  };

  const replay = () => {
    setLine(0);
    setPosition(0);
    setPlaying(true);
    const v = video.current;
    if (pixel || !v) {
      playRickroll();
      return;
    }
    v.currentTime = 0;
    void v.play();
  };

  const progress = pixel
    ? ((line + 1) / LYRICS.length) * length
    : playing
      ? position
      : Math.min(position, length * 0.12);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: 8,
        background: "#c0c0c0",
        fontFamily: "var(--font-sans)",
      }}
    >
      <div
        style={{
          flex: 1,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: pixel ? "flex-end" : "center",
          gap: 6,
          background: pixel
            ? "linear-gradient(180deg,#101a6b 0%,#3b1d7a 60%,#7a1f5c 100%)"
            : "#000",
          border: "3px inset #e7e7e7",
          padding: pixel ? 8 : 0,
          minHeight: 180,
          overflow: "hidden",
        }}
      >
        {pixel ? (
          <>
            <div style={{ fontSize: 8, color: "#ffd34d", letterSpacing: 1 }}>
              ♪ GTA6 BETA — OFFICIAL SOUNDTRACK ♪
            </div>
            <Rick bob={playing ? bob : 0} />
            <div
              style={{
                fontSize: 7,
                color: "#9ef",
                textAlign: "center",
                minHeight: 18,
                padding: "0 6px",
              }}
            >
              {LYRICS[line]}
            </div>
          </>
        ) : (
          <>
            <video
              ref={video}
              src={VIDEO_SRC}
              autoPlay
              muted
              playsInline
              preload="auto"
              onError={() => setMode("pixel")}
              onLoadedMetadata={(e) => readLength(e.currentTarget)}
              onDurationChange={(e) => readLength(e.currentTarget)}
              onLoadedData={() => setReady(true)}
              onCanPlay={() => setReady(true)}
              onPlaying={() => {
                setReady(true);
                setPlaying(true);
              }}
              onTimeUpdate={(e) => setPosition(e.currentTarget.currentTime)}
              onPause={() => setPlaying(false)}
              style={{ width: "100%", height: "100%", objectFit: "contain", background: "#000" }}
            />
            {!ready && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#9ef",
                  fontSize: 8,
                  letterSpacing: 2,
                  pointerEvents: "none",
                }}
              >
                LOADING VIDEO...
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button className="nes-btn is-small" onClick={toggle}>
          {playing ? "❚❚ Pause" : "▶ Play"}
        </button>
        <button className="nes-btn is-small" onClick={replay}>
          ↺ Replay
        </button>
        {!pixel && (
          <button className="nes-btn is-small" onClick={() => setMuted((m) => !m)}>
            {muted ? "🔇 Sound off" : "🔊 Sound on"}
          </button>
        )}
        <div
          style={{ flex: 1, height: 10, background: "#fff", boxShadow: "inset 2px 2px #808080" }}
        >
          <div
            style={{
              width: `${length > 0 ? Math.min(100, (progress / length) * 100) : 0}%`,
              height: "100%",
              background: "#2b3f8f",
              transition: "width 400ms linear",
            }}
          />
        </div>
        <span style={{ fontSize: 7 }}>
          {clock(pixel ? (line / LYRICS.length) * PIXEL_LENGTH : position)} / {clock(length)}
        </span>
      </div>

      <div style={{ fontSize: 7, color: "#3a3a3a", textAlign: "center" }}>
        {pixel ? "GTA6_BETA.exe" : "gta6/rickroll.mp4"} · media player 4.0 · now playing: Rick
        Astley — Never Gonna Give You Up
      </div>
    </div>
  );
}
