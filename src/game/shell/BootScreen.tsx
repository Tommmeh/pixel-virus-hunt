// Boot → Welcome (log in) → Desktop; Turn Off → shutting down → "safe to turn off". NES.css style.
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { authEnabled } from "@/auth/config";
import { PixelIcon } from "../components/PixelIcon";
import { leaveDemoMode, startDemo } from "../demo/store";
import { playShutdown, playStartup } from "../components/sound";
import { logIn, setPhase, usePhase } from "../system/session";
import { updateSettings, useSettings } from "../system/settings";
import { resetStory } from "./startOver";

function Logo({ size = 48 }: { size?: number }) {
  return (
    <div className="os-logo">
      <PixelIcon name="logo" size={size} />
      <span className="os-logo-text">
        VIRUSHUNT<b>OS</b>
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

const TOOLS = [
  { name: "Lovable", role: "app builder & hosting" },
  { name: "Auth0", role: "sign-in" },
  { name: "Freebuff", role: "AI coding assistant" },
  { name: "Google Gemini", role: "AI chatbot" },
];

/** The team, alphabetical. */
const TEAM = ["Aaron Liddle", "Anish Khosla", "Filipe Braga", "Zhuming Mai"];

function Welcome() {
  const s = useSettings();
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  // Without Auth0 configured there's no provider: useAuth0() returns defaults and we ignore it.
  const { isLoading, isAuthenticated, user, error, loginWithRedirect, logout } = useAuth0();
  const loading = authEnabled && isLoading;
  const needsSignIn = authEnabled && !isLoading && !isAuthenticated;
  const authName = (user?.given_name ?? user?.nickname ?? user?.name ?? "").slice(0, 16);

  const hint = loading
    ? "CONNECTING..."
    : error
      ? "SIGN-IN FAILED. TRY AGAIN"
      : needsSignIn
        ? "SIGN IN TO START"
        : "CLICK YOUR NAME TO START";

  return (
    <div className="welcome-screen">
      <div className="welcome-mid">
        <Logo />
        <p className="welcome-tagline">A SAFE PC FOR PRACTISING AGAINST SCAMS &amp; MALWARE</p>
        <div className="welcome-stack">
          {/* 1. What to click — first thing on screen. */}
          <section className="welcome-panel welcome-actions">
            <p className="welcome-panel-title">START HERE</p>
            <div className="welcome-demo">
              {/* No account needed to watch the demo; the full game still asks you to sign in. */}
              <button
                className="nes-btn is-success"
                onClick={() => {
                  if (authEnabled && authName) updateSettings({ userName: authName });
                  startDemo();
                }}
              >
                ▶ Guided demo
              </button>
              <p className="welcome-demo-cap">
                3 minutes. Scout walks you through catching (and cleaning) one virus.
              </p>
            </div>
            <p className="welcome-or">OR PLAY THE FULL GAME</p>
            <p className="welcome-hint">{hint}</p>
            <button
              className="user-tile"
              disabled={loading}
              onClick={() => {
                if (needsSignIn) {
                  void loginWithRedirect();
                  return;
                }
                if (authEnabled && authName) updateSettings({ userName: authName });
                leaveDemoMode();
                playStartup();
                logIn();
              }}
            >
              <span className="user-tile-pic">{s.avatar}</span>
              {/* Shows the PC's user name; it becomes the Auth0 name once signed in. */}
              <span className="user-tile-name">{authEnabled && authName ? authName : s.userName}</span>
              {/* A span styled as a button: the whole tile is the real button. */}
              <span className="nes-btn is-success is-small user-tile-go" aria-hidden>
                {needsSignIn ? "Sign in" : "Play ▶"}
              </span>
            </button>
            {resetDone && (
              <p className="welcome-hint">STORY RESET — THE $5 AD EMAIL IS BACK IN YOUR INBOX</p>
            )}
            {confirmingReset ? (
              <div className="mt-3">
                <p className="welcome-fine">
                  Reset the whole story? Mail, chats, bank balance and rewards all start again — $5
                  ad, then the Amazing gift card, then the free trial.
                </p>
                <div className="flex gap-2 mt-2 justify-center">
                  <button
                    className="nes-btn is-warning is-small"
                    onClick={() => {
                      resetStory();
                      setConfirmingReset(false);
                      setResetDone(true);
                    }}
                  >
                    Yes, reset
                  </button>
                  <button className="nes-btn is-small" onClick={() => setConfirmingReset(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="link-btn welcome-reset"
                onClick={() => {
                  setResetDone(false);
                  setConfirmingReset(true);
                }}
              >
                ↺ Start a new game
              </button>
            )}
          </section>

          {/* 2. What it is. */}
          <section className="welcome-panel welcome-about">
            <p className="welcome-panel-title">ABOUT</p>
            <p>
              Scammers and viruses only need you to slip once — and on a real computer, one wrong
              click can cost you your money, your accounts or your files.
            </p>
            <p>
              <b>VirusHuntOS</b> is a pretend 2004 PC where you can make those mistakes safely.
              Browse the web, read your email, chat with friends, check your bank — just like you
              would at home.
            </p>
            <ul className="welcome-list">
              <li>Use the computer the way you normally would.</li>
              <li>Some of what you meet won't be what it seems.</li>
              <li>Afterwards, find out what happened and how to spot it next time.</li>
            </ul>
            <p className="welcome-fine">
              Everything here is fictional: no real websites, money, people or viruses. Nothing
              leaves your browser.
            </p>
          </section>

          {/* 3. How it was made, and who made it. */}
          <section className="welcome-panel welcome-tools">
            <p className="welcome-panel-title">BUILT WITH</p>
            <ul>
              {TOOLS.map((t) => (
                <li key={t.name}>
                  <b>{t.name}</b>
                  <span>{t.role}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="welcome-credits">
            <p className="welcome-credits-title">CREDITS</p>
            <p className="welcome-credits-names">
              {TEAM.map((name, i) => (
                <span key={name}>
                  {i > 0 && <span aria-hidden> · </span>}
                  {name}
                </span>
              ))}
            </p>
            <p className="welcome-credits-event">HACKCAMP 2026</p>
          </section>
        </div>
      </div>
      <div className="welcome-bottom">
        <div className="flex gap-3">
          <button
            className="nes-btn is-error"
            onClick={() => {
              playShutdown();
              setPhase("shutdown");
            }}
          >
            Turn off computer
          </button>
          {authEnabled && isAuthenticated && (
            <button
              className="nes-btn"
              onClick={() => void logout({ logoutParams: { returnTo: window.location.origin } })}
            >
              Sign out
            </button>
          )}
        </div>
        <span className="welcome-note">VirusHuntOS · HackCamp 2026 · Nothing here is real.</span>
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
