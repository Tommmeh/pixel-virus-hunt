// Boot → Welcome (log in) → Desktop; Turn Off → shutting down → "safe to turn off". NES.css style.
import { useEffect, useState } from "react";
import { PixelIcon } from "../components/PixelIcon";
import { playShutdown, playStartup } from "../components/sound";
import { logIn, setPhase, usePhase } from "../system/session";
import { useSettings } from "../system/settings";

function Logo({ size = 48 }: { size?: number }) {
  return (
    <div className="os-logo">
      <PixelIcon name="logo" size={size} />
      <span className="os-logo-text">
        PANE<b>OS</b>
      </span>
    </div>
  );
}

function Boot() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setPct((p) => Math.min(100, p + 10)), 200);
    const done = setTimeout(() => setPhase("welcome"), 2400);
    return () => {
      clearInterval(t);
      clearTimeout(done);
    };
  }, []);
  return (
    <div className="boot-screen" onClick={() => setPhase("welcome")}>
      <Logo size={64} />
      <progress
        className="nes-progress is-primary boot-bar"
        value={pct}
        max={100}
        aria-label="Loading"
      />
      <p className="boot-blink">LOADING...</p>
      <p className="boot-foot">VIRUS HUNT · HACKCAMP 2026</p>
    </div>
  );
}

function Welcome() {
  const s = useSettings();
  return (
    <div className="welcome-screen">
      <div className="welcome-mid">
        <Logo />
        <div className="nes-container is-dark is-rounded with-title welcome-box">
          <p className="title">WELCOME</p>
          <p className="welcome-hint">CLICK YOUR NAME TO START</p>
          <button
            className="user-tile"
            onClick={() => {
              playStartup();
              logIn();
            }}
          >
            <span className="user-tile-pic">{s.avatar}</span>
            <span className="user-tile-name">{s.userName}</span>
            <span className="user-tile-arrow">▶</span>
          </button>
        </div>
      </div>
      <div className="welcome-bottom">
        <button
          className="nes-btn is-error"
          onClick={() => {
            playShutdown();
            setPhase("shutdown");
          }}
        >
          Turn off computer
        </button>
        <span className="welcome-note">Virus Hunt — a safe practice PC. Nothing here is real.</span>
      </div>
    </div>
  );
}

function ShuttingDown() {
  useEffect(() => {
    playShutdown();
    const t = setTimeout(() => setPhase("off"), 1600);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="welcome-screen">
      <div className="welcome-mid">
        <Logo />
        <p className="shutdown-text">SAVING YOUR SETTINGS...</p>
      </div>
    </div>
  );
}

function Off() {
  return (
    <div className="off-screen">
      <p>IT IS NOW SAFE TO TURN OFF YOUR COMPUTER.</p>
      <button className="nes-btn is-success" onClick={() => setPhase("boot")}>
        POWER ON
      </button>
    </div>
  );
}

export function BootScreen() {
  const phase = usePhase();
  if (phase === "welcome") return <Welcome />;
  if (phase === "shutdown") return <ShuttingDown />;
  if (phase === "off") return <Off />;
  return <Boot />;
}
