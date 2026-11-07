// Boot → Welcome (log in) → Desktop; Turn Off → shutting down → "safe to turn off".
import { useEffect } from "react";
import { PixelIcon } from "../components/PixelIcon";
import { playShutdown, playStartup } from "../components/sound";
import { logIn, setPhase, usePhase } from "../system/session";
import { useSettings } from "../system/settings";

function Logo({ size = 48 }: { size?: number }) {
  return (
    <div className="os-logo">
      <span className="os-logo-mark">
        <PixelIcon name="logo" size={size} />
      </span>
      <span className="os-logo-text">
        Pane<b>OS</b>
        <sup>XP</sup>
      </span>
    </div>
  );
}

function Boot() {
  useEffect(() => {
    const t = setTimeout(() => setPhase("welcome"), 2400);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="boot-screen" onClick={() => setPhase("welcome")}>
      <Logo size={56} />
      <div className="boot-bar" aria-label="Loading">
        <span />
        <span />
        <span />
      </div>
      <p className="boot-foot">Virus Hunt · HackCamp 2026</p>
    </div>
  );
}

function Welcome() {
  const s = useSettings();
  return (
    <div className="welcome-screen">
      <div className="welcome-top" />
      <div className="welcome-mid">
        <div className="welcome-left">
          <Logo />
          <p>To begin, click your user name</p>
        </div>
        <div className="welcome-divider" />
        <div className="welcome-right">
          <button
            className="user-tile"
            onClick={() => {
              playStartup();
              logIn();
            }}
          >
            <span className="user-tile-pic">{s.avatar}</span>
            <span className="user-tile-name">{s.userName}</span>
          </button>
        </div>
      </div>
      <div className="welcome-bottom">
        <button
          className="welcome-off"
          onClick={() => {
            playShutdown();
            setPhase("shutdown");
          }}
        >
          <span className="welcome-off-icon">⏻</span> Turn off computer
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
      <div className="welcome-top" />
      <div className="welcome-mid is-center">
        <Logo />
        <p className="shutdown-text">PaneOS is shutting down...</p>
      </div>
      <div className="welcome-bottom" />
    </div>
  );
}

function Off() {
  return (
    <div className="off-screen">
      <p>It is now safe to turn off your computer.</p>
      <button className="power-btn" onClick={() => setPhase("boot")} aria-label="Power on">
        ⏻
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
