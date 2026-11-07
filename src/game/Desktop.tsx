// Track A. The fake PC: window manager, desktop icons, taskbar/tray, popup scheduler, toast, celebration.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { APPS, getApp } from "./apps/registry";
import { AchievementToast } from "./components/AchievementToast";
import { LureCard } from "./components/LureCard";
import { PixelIcon } from "./components/PixelIcon";
import { playFanfare } from "./components/sound";
import { DesktopContext, type AppArgs, type DesktopApi } from "./desktop-context";
import { getScam, SCAMS, scamsAt } from "./scams";
import { useGame } from "./state";
import { Window } from "./Window";

interface Win {
  key: string; // app id, or "lure:<scamId>"
  x: number;
  y: number;
  z: number;
  min: boolean;
  args?: AppArgs | undefined;
}
interface Popup {
  key: number;
  scamId: string;
  x: number;
  y: number;
}

const POPUP_GRACE_MS = 20_000;
const POPUP_MIN_MS = 30_000;
const POPUP_JITTER_MS = 15_000;
const POPUP_MAX = 2;
const POPUP_W = 320;
const POPUP_H = 230;
const LURE_W = 420;
const EST_WIN_H = 520;

function Clock() {
  const [t, setT] = useState("");
  useEffect(() => {
    const f = () => setT(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
    f();
    const i = setInterval(f, 10000);
    return () => clearInterval(i);
  }, []);
  return <span>{t}</span>;
}

const overlaps = (
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

export function Desktop() {
  const { state, dispatch } = useGame();
  const [wins, setWins] = useState<Win[]>([]);
  const [popups, setPopups] = useState<Popup[]>([]);
  const [startOpen, setStartOpen] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const zTop = useRef(10);

  const winsRef = useRef(wins);
  winsRef.current = wins;
  const unlockedRef = useRef(state.unlocked);
  unlockedRef.current = state.unlocked;

  const bringUp = useCallback((key: string, args?: AppArgs, width = 500) => {
    setStartOpen(false);
    const z = ++zTop.current;
    setWins((w) => {
      if (w.some((x) => x.key === key)) {
        return w.map((x) => (x.key === key ? { ...x, z, min: false, args: args ?? x.args } : x));
      }
      const vw = typeof window === "undefined" ? 1200 : window.innerWidth;
      const n = w.length % 8;
      const x = Math.max(0, Math.min(140 + n * 32, vw - width - 8));
      return [...w, { key, x, y: 30 + n * 28, z, min: false, args }];
    });
  }, []);

  const api = useMemo<DesktopApi>(
    () => ({
      openApp: (id, args) => bringUp(id, args, getApp(id)?.width),
      closeApp: (id) => setWins((w) => w.filter((x) => x.key !== id)),
      openLure: (scamId) => bringUp(`lure:${scamId}`, undefined, LURE_W),
    }),
    [bringUp],
  );

  const focus = (key: string) => {
    const z = ++zTop.current;
    setWins((w) => w.map((x) => (x.key === key ? { ...x, z } : x)));
  };
  const close = (key: string) => setWins((w) => w.filter((x) => x.key !== key));

  // --- Celebration when the final scam is collected ---
  const got = SCAMS.filter((s) => state.unlocked[s.id]).length;
  useEffect(() => {
    if (state.lastUnlock && got === SCAMS.length && SCAMS.length > 0) {
      setCelebrate(true);
      if (!state.muted) setTimeout(playFanfare, 700);
    }
  }, [state.lastUnlock]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Popup scheduler: random popup lures, preferring still-locked ones ---
  useEffect(() => {
    if (celebrate) return;
    const pool = scamsAt("popup");
    if (pool.length === 0) return;
    let timer: ReturnType<typeof setTimeout>;

    const spawn = () => {
      setPopups((open) => {
        if (open.length >= POPUP_MAX) return open;
        const candidates = pool.filter((s) => !open.some((p) => p.scamId === s.id));
        if (candidates.length === 0) return open;
        const locked = candidates.filter((s) => !unlockedRef.current[s.id]);
        const from = locked.length > 0 && Math.random() < 0.75 ? locked : candidates;
        const scam = from[Math.floor(Math.random() * from.length)]!;

        const vw = window.innerWidth;
        const vh = window.innerHeight - 60;
        const ach = winsRef.current.find((w) => w.key === "achievements" && !w.min);
        const achRect = ach && {
          x: ach.x,
          y: ach.y,
          w: getApp("achievements")!.width,
          h: EST_WIN_H,
        };
        let x = 0;
        let y = 0;
        for (let i = 0; i < 10; i++) {
          x = 130 + Math.random() * Math.max(0, vw - POPUP_W - 140);
          y = 10 + Math.random() * Math.max(0, vh - POPUP_H - 10);
          if (!achRect || !overlaps({ x, y, w: POPUP_W, h: POPUP_H }, achRect)) break;
        }
        return [...open, { key: Date.now(), scamId: scam.id, x, y }];
      });
    };

    const schedule = (delay: number) => {
      timer = setTimeout(() => {
        spawn();
        schedule(POPUP_MIN_MS + Math.random() * POPUP_JITTER_MS);
      }, delay);
    };
    schedule(POPUP_GRACE_MS);
    return () => clearTimeout(timer);
  }, [celebrate]);

  const desktopLures = scamsAt("desktop");
  const listed = APPS.filter((a) => a.listed);
  const winLabel = (key: string) =>
    key.startsWith("lure:")
      ? (getScam(key.slice(5))?.lure.title ?? key)
      : (getApp(key)?.label ?? key);
  const winIcon = (key: string) =>
    key.startsWith("lure:")
      ? (getScam(key.slice(5))?.icon ?? "file")
      : (getApp(key)?.icon ?? "file");

  return (
    <DesktopContext.Provider value={api}>
      <div className="desktop" onClick={() => startOpen && setStartOpen(false)}>
        <div className="desktop-icons">
          {listed.map((a) => (
            <button
              key={a.id}
              className="desk-icon"
              onDoubleClick={() => api.openApp(a.id)}
              onClick={(e) => e.detail === 0 && api.openApp(a.id)}
            >
              <PixelIcon name={a.icon} size={40} />
              <span>{a.label}</span>
            </button>
          ))}
          {desktopLures.map((s) => (
            <button
              key={s.id}
              className="desk-icon"
              onDoubleClick={() => api.openLure(s.id)}
              onClick={(e) => e.detail === 0 && api.openLure(s.id)}
            >
              <PixelIcon name={s.icon} size={40} />
              <span>{s.lure.title}</span>
            </button>
          ))}
        </div>

        {wins
          .filter((w) => !w.min)
          .map((w) => {
            const onMove = (x: number, y: number) =>
              setWins((ws) => ws.map((v) => (v.key === w.key ? { ...v, x, y } : v)));
            const common = {
              x: w.x,
              y: w.y,
              z: w.z,
              onMove,
              onFocus: () => focus(w.key),
              onClose: () => close(w.key),
              onMinimize: () =>
                setWins((ws) => ws.map((v) => (v.key === w.key ? { ...v, min: true } : v))),
            };
            if (w.key.startsWith("lure:")) {
              const scam = getScam(w.key.slice(5));
              if (!scam) return null;
              return (
                <Window key={w.key} title={scam.lure.title} width={LURE_W} {...common}>
                  <LureCard scam={scam} hideHeader onDone={() => close(w.key)} />
                </Window>
              );
            }
            const app = getApp(w.key);
            if (!app) return null;
            const App = app.component;
            return (
              <Window key={w.key} title={app.title} width={app.width} {...common}>
                <App args={w.args} />
              </Window>
            );
          })}

        {popups.map((p) => {
          const scam = getScam(p.scamId);
          if (!scam) return null;
          const dismiss = () => setPopups((a) => a.filter((v) => v.key !== p.key));
          return (
            <Window
              key={p.key}
              title={scam.lure.title}
              x={p.x}
              y={p.y}
              z={900}
              width={POPUP_W}
              variant="alert"
              onMove={(x, y) =>
                setPopups((a) => a.map((v) => (v.key === p.key ? { ...v, x, y } : v)))
              }
              onFocus={() => {}}
              onClose={dismiss}
            >
              <LureCard scam={scam} hideHeader onDone={dismiss} />
            </Window>
          );
        })}

        {celebrate && (
          <div className="celebrate" onClick={() => setCelebrate(false)}>
            <div className="confetti" aria-hidden>
              {Array.from({ length: 40 }).map((_, i) => (
                <span
                  key={i}
                  style={{
                    left: `${(i * 37) % 100}%`,
                    animationDelay: `${(i % 10) * 0.15}s`,
                    background: ["#ffd23f", "#e23b3b", "#3fbf4f", "#2f6fe0", "#fff"][i % 5],
                  }}
                />
              ))}
            </div>
            <div className="nes-container is-dark with-title is-centered max-w-xl">
              <p className="title">C:\&gt; ALL DONE</p>
              <PixelIcon name="trophy" size={64} className="mx-auto mb-4" />
              <p className="mb-4 text-lg leading-relaxed">ALL SCAMS COLLECTED!</p>
              <p className="mb-6 text-[10px] leading-loose">
                You fell for all {SCAMS.length} — here, where it's safe. Now you know the tricks for
                real life.
              </p>
              <button className="nes-btn is-success" onClick={() => setCelebrate(false)}>
                Nice!
              </button>
            </div>
          </div>
        )}

        {startOpen && (
          <div className="start-menu nes-container" onClick={(e) => e.stopPropagation()}>
            {listed.map((a) => (
              <button key={a.id} className="start-item" onClick={() => api.openApp(a.id)}>
                <PixelIcon name={a.icon} size={20} /> {a.label}
              </button>
            ))}
            <hr className="start-sep" />
            <button className="start-item" onClick={() => dispatch({ type: "GO_TITLE" })}>
              <PixelIcon name="computer" size={20} /> Shut down...
            </button>
          </div>
        )}

        <AchievementToast />

        <div className="taskbar">
          <button
            className="nes-btn is-success btn-xs"
            onClick={(e) => {
              e.stopPropagation();
              setStartOpen((s) => !s);
            }}
          >
            Start
          </button>
          <div className="flex flex-1 gap-2 overflow-hidden">
            {wins.map((w) => (
              <button
                key={w.key}
                className={`task-btn ${w.min ? "" : "is-open"}`}
                onClick={() => bringUp(w.key)}
              >
                <PixelIcon name={winIcon(w.key)} size={16} />
                <span className="truncate">{winLabel(w.key)}</span>
              </button>
            ))}
          </div>
          <div className="tray">
            <button
              className="tray-btn"
              onClick={() => api.openApp("wifi")}
              aria-label="Wireless networks"
              title="Wireless networks"
            >
              <PixelIcon name="wifi" size={20} />
            </button>
            <button
              className="tray-btn"
              onClick={() => dispatch({ type: "TOGGLE_MUTE" })}
              aria-label={state.muted ? "Unmute" : "Mute"}
              title={state.muted ? "Unmute" : "Mute"}
            >
              <PixelIcon name={state.muted ? "mute" : "speaker"} size={20} />
            </button>
            <button
              className="tray-btn"
              onClick={() => api.openApp("achievements")}
              aria-label="Achievements"
              title={`Achievements: ${got}/${SCAMS.length}`}
            >
              <PixelIcon name="trophy" size={20} />
              <span className="text-[8px]">
                {got}/{SCAMS.length}
              </span>
            </button>
            <Clock />
          </div>
        </div>
      </div>
    </DesktopContext.Provider>
  );
}
