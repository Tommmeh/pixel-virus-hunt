import { useEffect, useState } from "react";
import { FOLDERS, LEGIT_FILES, LEGIT_PROCESSES, LEGIT_STARTUP, MALWARE, type Folder } from "./data";
import { activeSymptoms, useGame } from "./state";

function useInfectedComponents() {
  const { state } = useGame();
  return MALWARE.filter((m) => state.infections.includes(m.id))
    .flatMap((m) => m.components)
    .filter((c) => !state.removed.includes(c.id));
}

export function TaskManager() {
  const { state, dispatch } = useGame();
  const comps = useInfectedComponents();
  const [sel, setSel] = useState<string | null>(null);
  const [jitter, setJitter] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setJitter((j) => (j + 1) % 7), 1500);
    return () => clearInterval(t);
  }, []);
  const procs = [
    ...LEGIT_PROCESSES.filter((p) => !state.falseRemovals.includes(p.id)).map((p) => ({ ...p, bad: false })),
    ...comps.flatMap((c) => (c.kind === "process" ? [{ ...c, bad: true }] : [])),
  ].sort((a, b) => a.name.localeCompare(b.name));
  const total = Math.min(100, procs.reduce((n, p) => n + p.cpu, 0) + jitter);
  const selected = procs.find((p) => p.id === sel);
  const end = () => {
    if (!selected) return;
    if (selected.bad) dispatch({ type: "REMOVE", id: selected.id, now: Date.now() });
    else dispatch({ type: "REMOVE_LEGIT", id: selected.id });
    setSel(null);
  };
  return (
    <div className="text-[10px]">
      <table className="xp-table">
        <thead>
          <tr><th>Image Name</th><th>User</th><th>CPU</th><th>Mem</th></tr>
        </thead>
        <tbody>
          {procs.map((p) => (
            <tr key={p.id} className={sel === p.id ? "is-selected" : ""} onClick={() => setSel(p.id)}>
              <td>{p.name}</td><td>{p.user}</td><td>{String(p.cpu + (p.cpu > 10 ? jitter : 0)).padStart(2, "0")}</td><td>{p.mem}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {selected && (
        <p className="mt-2">Description: {selected.desc || "(none)"}</p>
      )}
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex-1">
          <span>CPU Usage: {total}%</span>
          <progress className={`nes-progress ${total > 70 ? "is-error" : "is-success"}`} value={total} max={100} style={{ height: 18 }} />
        </div>
        <button className={`nes-btn is-error ${selected ? "" : "is-disabled"}`} onClick={end} disabled={!selected}>End Process</button>
      </div>
    </div>
  );
}

export function FileExplorer() {
  const { state, dispatch } = useGame();
  const comps = useInfectedComponents();
  const [folder, setFolder] = useState<Folder>("Desktop");
  const [sel, setSel] = useState<string | null>(null);
  const files = [
    ...LEGIT_FILES.filter((f) => f.folder === folder && !state.falseRemovals.includes(f.id)).map((f) => ({ ...f, bad: false })),
    ...comps.flatMap((c) => (c.kind === "file" && c.folder === folder ? [{ ...c, bad: true }] : [])),
  ];
  const del = () => {
    const f = files.find((x) => x.id === sel);
    if (!f) return;
    if (f.bad) dispatch({ type: "REMOVE", id: f.id, now: Date.now() });
    else dispatch({ type: "REMOVE_LEGIT", id: f.id });
    setSel(null);
  };
  return (
    <div className="flex gap-3 text-[10px]">
      <ul className="explorer-tree">
        {FOLDERS.map((f) => (
          <li key={f.id}>
            <button className={`tree-btn ${folder === f.id ? "is-active" : ""}`} onClick={() => { setFolder(f.id); setSel(null); }}>
              [+] {f.id}
            </button>
          </li>
        ))}
      </ul>
      <div className="flex-1">
        <div className="address-bar">{FOLDERS.find((f) => f.id === folder)!.path}</div>
        <table className="xp-table">
          <thead><tr><th>Name</th><th>Size</th></tr></thead>
          <tbody>
            {files.map((f) => (
              <tr key={f.id} className={sel === f.id ? "is-selected" : ""} onClick={() => setSel(f.id)}>
                <td>{f.name}</td><td>{f.size}</td>
              </tr>
            ))}
            {files.length === 0 && <tr><td colSpan={2}>(empty)</td></tr>}
          </tbody>
        </table>
        <button className={`nes-btn is-error mt-3 ${sel ? "" : "is-disabled"}`} disabled={!sel} onClick={del}>Delete</button>
      </div>
    </div>
  );
}

export function StartupPrograms() {
  const { state, dispatch } = useGame();
  const comps = useInfectedComponents();
  const items = [
    ...LEGIT_STARTUP.filter((s) => !state.falseRemovals.includes(s.id)).map((s) => ({ ...s, bad: false })),
    ...comps.flatMap((c) => (c.kind === "startup" ? [{ ...c, bad: true }] : [])),
  ].sort((a, b) => a.name.localeCompare(b.name));
  return (
    <div className="text-[10px]">
      <p className="mb-2">Programs that run when Windows starts:</p>
      <table className="xp-table">
        <thead><tr><th>Item</th><th>Command</th><th></th></tr></thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.id}>
              <td>{i.name}</td>
              <td className="break-all">{i.command}</td>
              <td>
                <button className="nes-btn is-warning btn-xs" onClick={() => dispatch(i.bad ? { type: "REMOVE", id: i.id, now: Date.now() } : { type: "REMOVE_LEGIT", id: i.id })}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Antivirus() {
  const { state, dispatch } = useGame();
  const comps = useInfectedComponents();
  const [progress, setProgress] = useState<number | null>(null);
  const [found, setFound] = useState<string[] | null>(null);
  useEffect(() => {
    if (progress === null || progress >= 100) return;
    const t = setTimeout(() => setProgress((p) => (p ?? 0) + 5), 150);
    return () => clearTimeout(t);
  }, [progress]);
  useEffect(() => {
    if (progress === 100) {
      const detectable = MALWARE.filter((m) => m.detectableByAV && state.infections.includes(m.id))
        .flatMap((m) => m.components)
        .filter((c) => c.kind === "file" && !state.removed.includes(c.id))
        .map((c) => c.id);
      setFound(detectable);
    }
  }, [progress]); // eslint-disable-line react-hooks/exhaustive-deps
  const hits = (found ?? []).map((id) => comps.find((c) => c.id === id)).filter(Boolean);
  return (
    <div className="text-[10px]">
      <p className="mb-2">AVGuard 2004 — Definitions: 03/2004</p>
      {progress !== null && <progress className="nes-progress is-primary" value={progress} max={100} style={{ height: 22 }} />}
      {progress === 100 && found && (
        <div className="mt-2">
          {hits.length === 0 ? (
            <p>No threats found. Your computer is protected!</p>
          ) : (
            <ul>
              {hits.map((c) => c && c.kind === "file" && (
                <li key={c.id} className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-destructive">Threat: {c.name}</span>
                  <button className="nes-btn is-error btn-xs" onClick={() => dispatch({ type: "REMOVE", id: c.id, now: Date.now() })}>Quarantine</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <button className="nes-btn is-primary mt-3" onClick={() => { setFound(null); setProgress(0); }} disabled={progress !== null && progress < 100}>
        {progress !== null && progress < 100 ? "Scanning..." : "Full Scan"}
      </button>
    </div>
  );
}

export function Browser() {
  const { state } = useGame();
  const hijacked = activeSymptoms(state).has("homepage");
  return (
    <div className="text-[10px]">
      <div className="address-bar">Address: {hijacked ? "http://www.search-xtreme-results.ru/?ref=net32" : "http://www.msn.com/"}</div>
      {hijacked ? (
        <div className="nes-container is-dark">
          <p>SEARCH XTREME!!! Best Results 2004</p>
          <p className="blink">!! You are visitor 1,000,000 !! Click to claim !!</p>
        </div>
      ) : (
        <div className="nes-container">
          <p>MSN Home</p>
          <p>Top stories: New MP3 players can hold 1,000 songs!</p>
        </div>
      )}
    </div>
  );
}

export function EmailApp() {
  const { state, dispatch } = useGame();
  const comps = useInfectedComponents();
  const compromised = activeSymptoms(state).has("loginEmail");
  const [open, setOpen] = useState<string | null>(null);
  const [pwd, setPwd] = useState(false);
  const mails = [
    { id: "m1", from: "Mom", subject: "Thanksgiving photos", body: "Hi honey, did you get the photos? Love, Mom" },
    { id: "m2", from: "IT Helpdesk", subject: "Reminder: report odd PC behaviour", body: "If your PC acts strange, check Task Manager, Startup and your downloads." },
    ...(compromised
      ? [{ id: "m3", from: "HotPost Security", subject: "New sign-in from Moscow, Russia", body: "Your account was logged in from Moscow, Russia (IP 95.31.x.x). If this wasn't you, secure your account now." }]
      : []),
  ];
  const mail = mails.find((m) => m.id === open);
  const account = comps.find((c) => c.kind === "account");
  return (
    <div className="text-[10px]">
      <div className="mb-2 flex justify-between">
        <span>HotPost Webmail — Inbox</span>
        <button className="nes-btn btn-xs" onClick={() => setPwd((p) => !p)}>Account</button>
      </div>
      {pwd ? (
        <div className="nes-container with-title">
          <p className="title">Account security</p>
          <p>Active sessions: {account ? "2 (this PC, unknown device)" : "1 (this PC)"}</p>
          <button className="nes-btn is-success mt-2" disabled={!account} onClick={() => account && dispatch({ type: "REMOVE", id: account.id, now: Date.now() })}>
            Change password & sign out others
          </button>
        </div>
      ) : mail ? (
        <div>
          <button className="nes-btn btn-xs mb-2" onClick={() => setOpen(null)}>&lt; Back</button>
          <p>From: {mail.from}</p>
          <p>Subject: {mail.subject}</p>
          <p className="mt-2">{mail.body}</p>
        </div>
      ) : (
        <table className="xp-table">
          <tbody>
            {mails.map((m) => (
              <tr key={m.id} onClick={() => setOpen(m.id)}><td>{m.from}</td><td>{m.subject}</td></tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export function RecycleBin() {
  const { state } = useGame();
  return <p className="text-[10px]">{state.removed.length + state.falseRemovals.length} item(s) deleted this session.</p>;
}
