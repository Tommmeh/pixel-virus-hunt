import { useEffect, useState, type ReactNode } from "react";
import { MALWARE, SCENARIOS } from "./data";
import { activeSymptoms, useGame } from "./state";
import { Window } from "./Window";
import { Antivirus, Browser, EmailApp, FileExplorer, RecycleBin, StartupPrograms, TaskManager } from "./apps";

type AppId = "computer" | "ie" | "email" | "bin" | "taskmgr" | "av";
const APPS: { id: AppId; label: string; icon: string; title: string; width: number }[] = [
  { id: "computer", label: "My Computer", icon: "🖥️", title: "My Computer - File Explorer", width: 600 },
  { id: "ie", label: "Internet Explorer", icon: "🌐", title: "Internet Explorer", width: 560 },
  { id: "email", label: "Email", icon: "✉️", title: "HotPost Mail", width: 540 },
  { id: "bin", label: "Recycle Bin", icon: "🗑️", title: "Recycle Bin", width: 360 },
  { id: "taskmgr", label: "Task Manager", icon: "📊", title: "Windows Task Manager", width: 600 },
  { id: "av", label: "Antivirus Scanner", icon: "🛡️", title: "AVGuard Antivirus", width: 460 },
];

interface Win { id: string; x: number; y: number; z: number; min: boolean }

const ADS = [
  "CONGRATULATIONS! You won a FREE iPod! Click here!",
  "Your PC is SLOW! Download SpeedBoost 2004 NOW!",
  "Hot singles in your area want to chat!",
  "Smiley Pack: 500 FREE emoticons for MSN!",
];

function TaskMgrTabs() {
  const [tab, setTab] = useState<"proc" | "start">("proc");
  return (
    <div>
      <div className="mb-2 flex gap-2">
        <button className={`nes-btn btn-xs ${tab === "proc" ? "is-primary" : ""}`} onClick={() => setTab("proc")}>Processes</button>
        <button className={`nes-btn btn-xs ${tab === "start" ? "is-primary" : ""}`} onClick={() => setTab("start")}>Startup</button>
      </div>
      {tab === "proc" ? <TaskManager /> : <StartupPrograms />}
    </div>
  );
}

const CONTENT: Record<AppId, () => ReactNode> = {
  computer: () => <FileExplorer />,
  ie: () => <Browser />,
  email: () => <EmailApp />,
  bin: () => <RecycleBin />,
  taskmgr: () => <TaskMgrTabs />,
  av: () => <Antivirus />,
};

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

export function Desktop() {
  const { state, dispatch } = useGame();
  const [wins, setWins] = useState<Win[]>([]);
  const [zTop, setZTop] = useState(10);
  const [ads, setAds] = useState<{ id: number; text: string; x: number; y: number }[]>([]);
  const [startOpen, setStartOpen] = useState(false);
  const [scenPos, setScenPos] = useState({ x: 260, y: 120 });
  const symptoms = activeSymptoms(state);
  const investigating = state.phase === "investigate";
  const laggy = investigating && symptoms.has("lag");

  const open = (id: string) => {
    setStartOpen(false);
    const z = zTop + 1;
    setZTop(z);
    setWins((w) =>
      w.some((x) => x.id === id)
        ? w.map((x) => (x.id === id ? { ...x, z, min: false } : x))
        : [...w, { id, x: 160 + w.length * 30, y: 40 + w.length * 30, z, min: false }],
    );
  };
  const focus = (id: string) => {
    const z = zTop + 1;
    setZTop(z);
    setWins((w) => w.map((x) => (x.id === id ? { ...x, z } : x)));
  };

  // Symptom: random popup ads
  useEffect(() => {
    if (!investigating || !symptoms.has("ads")) return;
    const t = setInterval(() => {
      setAds((a) => (a.length > 4 ? a : [...a, { id: Date.now(), text: ADS[Math.floor(Math.random() * ADS.length)]!, x: 200 + Math.random() * 500, y: 60 + Math.random() * 300 }]));
    }, 9000);
    return () => clearInterval(t);
  }, [investigating, symptoms.has("ads")]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!symptoms.has("ads")) setAds([]);
  }, [symptoms.has("ads")]); // eslint-disable-line react-hooks/exhaustive-deps

  // Persistence: killed processes come back if their startup entry and file still exist
  useEffect(() => {
    if (!investigating) return;
    const t = setInterval(() => {
      for (const m of MALWARE) {
        if (!state.infections.includes(m.id)) continue;
        const p = m.components.find((c) => c.kind === "process");
        const s = m.components.find((c) => c.kind === "startup");
        if (p && s && state.removed.includes(p.id) && !state.removed.includes(s.id)) dispatch({ type: "RESPAWN", id: p.id });
      }
    }, 12000);
    return () => clearInterval(t);
  }, [investigating, state.infections, state.removed, dispatch]);

  // Symptom: strange files on desktop
  const desktopJunk = investigating
    ? MALWARE.filter((m) => state.infections.includes(m.id))
        .flatMap((m) => m.components)
        .filter((c) => c.kind === "file" && c.folder === "Desktop" && !state.removed.includes(c.id))
    : [];

  const scenario = state.phase === "scenario" ? SCENARIOS[state.scenarioIndex] : null;

  return (
    <div className="desktop" onClick={() => startOpen && setStartOpen(false)}>
      <div className="desktop-icons">
        {APPS.map((a) => (
          <button key={a.id} className="desk-icon" onDoubleClick={() => open(a.id)} onClick={(e) => e.detail === 0 && open(a.id)}>
            <span className="desk-icon-img">{a.icon}</span>
            <span>{a.label}</span>
          </button>
        ))}
        {desktopJunk.map((f) => (
          <button key={f.id} className="desk-icon" onDoubleClick={() => open("computer")}>
            <span className="desk-icon-img">📄</span>
            <span>{f.kind === "file" ? f.name : ""}</span>
          </button>
        ))}
        {investigating && Array.from({ length: Math.min(3, symptoms.has("desktopFiles") ? 3 : 0) }).map((_, i) => (
          <button key={i} className="desk-icon" onDoubleClick={() => open("computer")}>
            <span className="desk-icon-img">📄</span>
            <span>Copy of Salaries_2004 ({i + 2}).xls.exe</span>
          </button>
        ))}
      </div>

      {wins.filter((w) => !w.min).map((w) => {
        const app = APPS.find((a) => a.id === w.id)!;
        return (
          <Window key={w.id} title={app.title} x={w.x} y={w.y} z={w.z} width={app.width} laggy={laggy}
            onMove={(x, y) => setWins((ws) => ws.map((v) => (v.id === w.id ? { ...v, x, y } : v)))}
            onFocus={() => focus(w.id)}
            onClose={() => setWins((ws) => ws.filter((v) => v.id !== w.id))}
            onMinimize={() => setWins((ws) => ws.map((v) => (v.id === w.id ? { ...v, min: true } : v)))}>
            {CONTENT[app.id]()}
          </Window>
        );
      })}

      {ads.map((ad) => (
        <Window key={ad.id} title="Special Offer!!!" x={ad.x} y={ad.y} z={900} width={300} variant="alert" laggy={laggy}
          onMove={(x, y) => setAds((a) => a.map((v) => (v.id === ad.id ? { ...v, x, y } : v)))}
          onFocus={() => {}} onClose={() => setAds((a) => a.filter((v) => v.id !== ad.id))}>
          <p className="text-[10px]">{ad.text}</p>
          <button className="nes-btn is-warning btn-xs mt-2" onClick={() => setAds((a) => a.filter((v) => v.id !== ad.id))}>Claim now!</button>
        </Window>
      ))}

      {scenario && (
        <Window key={scenario.id} title={scenario.title} x={scenPos.x} y={scenPos.y} z={1000} width={520}
          onMove={(x, y) => setScenPos({ x, y })} onFocus={() => {}}>
          <div className="text-[11px] leading-relaxed">
            <p className="mb-1 text-muted-foreground">Event {state.scenarioIndex + 1} / {SCENARIOS.length}</p>
            {scenario.from && <p className="mb-2">From: {scenario.from}</p>}
            <p className="mb-4">{scenario.body}</p>
            <div className="flex flex-col gap-3">
              {(Math.abs(scenario.id.length % 2) === 0
                ? [[scenario.safe, false], [scenario.risky, true]]
                : [[scenario.risky, true], [scenario.safe, false]]
              ).map(([label, risky]) => (
                <button key={String(label)} className="nes-btn text-left text-[10px]"
                  onClick={() => dispatch({ type: "CHOOSE", scenarioId: scenario.id, risky: risky as boolean, now: Date.now() })}>
                  {label as string}
                </button>
              ))}
            </div>
          </div>
        </Window>
      )}

      {startOpen && (
        <div className="start-menu nes-container is-rounded" onClick={(e) => e.stopPropagation()}>
          {APPS.map((a) => (
            <button key={a.id} className="start-item" onClick={() => open(a.id)}>{a.icon} {a.label}</button>
          ))}
          {investigating && (
            <button className="start-item" onClick={() => dispatch({ type: "GIVE_UP", now: Date.now() })}>⏻ I'm done (end hunt)</button>
          )}
        </div>
      )}

      <div className="taskbar">
        <button className="nes-btn is-success btn-xs" onClick={(e) => { e.stopPropagation(); setStartOpen((s) => !s); }}>Start</button>
        <div className="flex flex-1 gap-2 overflow-hidden">
          {wins.map((w) => (
            <button key={w.id} className="nes-btn btn-xs truncate" onClick={() => open(w.id)}>{APPS.find((a) => a.id === w.id)!.label}</button>
          ))}
        </div>
        <div className="tray"><Clock /></div>
      </div>
    </div>
  );
}
