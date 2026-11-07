import { useEffect, useMemo, useState } from "react";
import { PixelIcon } from "../../components/PixelIcon";
import { Tabs } from "../../components/ui";
import { SYSTEM_PROCESSES, type ProcessInfo } from "../../system/processes";
import { useWindows, wm } from "../../system/windows";
import { getApp } from "../registry";

type Tab = "apps" | "procs" | "perf";

interface Proc extends ProcessInfo {
  id: string;
  app?: string;
}

function useCpuHistory(openCount: number) {
  const [hist, setHist] = useState<number[]>(() => Array.from({ length: 40 }, () => 4));
  useEffect(() => {
    const t = setInterval(() => {
      setHist((h) => {
        const base = 3 + openCount * 4;
        const v = Math.min(100, Math.max(1, Math.round(base + (Math.random() - 0.4) * 12)));
        return [...h.slice(1), v];
      });
    }, 1000);
    return () => clearInterval(t);
  }, [openCount]);
  return hist;
}

function Graph({ values }: { values: number[] }) {
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 200},${100 - v}`).join(" ");
  return (
    <svg className="tm-graph" viewBox="0 0 200 100" preserveAspectRatio="none">
      {Array.from({ length: 9 }).map((_, i) => (
        <line key={`v${i}`} x1={i * 25} y1={0} x2={i * 25} y2={100} />
      ))}
      {Array.from({ length: 4 }).map((_, i) => (
        <line key={`h${i}`} x1={0} y1={i * 25} x2={200} y2={i * 25} />
      ))}
      <polyline points={pts} />
    </svg>
  );
}

export function TaskManager() {
  const { wins } = useWindows();
  const [tab, setTab] = useState<Tab>("apps");
  const [sel, setSel] = useState<string | null>(null);
  const appWins = wins.filter((w) => w.app !== "msgbox");
  const cpuHist = useCpuHistory(appWins.length);
  const cpu = cpuHist[cpuHist.length - 1]!;

  const procs = useMemo<Proc[]>(() => {
    const seen = new Set<string>();
    const appProcs: Proc[] = [];
    for (const w of appWins) {
      const def = getApp(w.app);
      if (!def?.process || seen.has(def.process)) continue;
      seen.add(def.process);
      appProcs.push({
        id: `app:${def.process}`,
        name: def.process,
        user: "User",
        memK: def.memK ?? 4000,
        cpu: 0,
        system: false,
        app: w.app,
      });
    }
    return [...SYSTEM_PROCESSES.map((p, i) => ({ ...p, id: `sys:${i}` })), ...appProcs].sort(
      (a, b) => a.name.localeCompare(b.name),
    );
  }, [appWins]);

  const memK = procs.reduce((n, p) => n + p.memK, 0) + 96_000;

  const endProcess = (p: Proc) => {
    if (p.system) {
      wm.alert({
        title: "Unable to Terminate Process",
        text: "The operation could not be completed.\n\nAccess is denied.",
        icon: "error",
      });
      return;
    }
    // Ending a process closes every window that belongs to it (e.g. PingMe + its chats).
    for (const w of appWins) if (getApp(w.app)?.process === p.name) wm.close(w.key);
    setSel(null);
  };

  return (
    <div className="taskmgr">
      <Tabs
        tabs={[
          { id: "apps", label: "Applications" },
          { id: "procs", label: "Processes" },
          { id: "perf", label: "Performance" },
        ]}
        value={tab}
        onChange={(t) => {
          setTab(t);
          setSel(null);
        }}
      />
      <div className="tm-panel">
        {tab === "apps" && (
          <>
            <div className="tm-list">
              <table className="xp-table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appWins.map((w) => (
                    <tr
                      key={w.key}
                      className={sel === w.key ? "is-selected" : ""}
                      onClick={() => setSel(w.key)}
                      onDoubleClick={() => wm.taskbarClick(w.key)}
                    >
                      <td>
                        <span className="flex items-center gap-1">
                          <PixelIcon name={w.icon} size={16} /> {w.title}
                        </span>
                      </td>
                      <td>Running</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="tm-actions">
              <button
                className="xp-btn"
                disabled={!sel || !wins.some((w) => w.key === sel)}
                onClick={() => {
                  if (sel) wm.close(sel);
                  setSel(null);
                }}
              >
                End Task
              </button>
              <button
                className="xp-btn"
                disabled={!sel || !wins.some((w) => w.key === sel)}
                onClick={() =>
                  sel && wm.open(wins.find((w) => w.key === sel)!.app, undefined, { key: sel })
                }
              >
                Switch To
              </button>
            </div>
          </>
        )}
        {tab === "procs" && (
          <>
            <div className="tm-list">
              <table className="xp-table">
                <thead>
                  <tr>
                    <th>Image Name</th>
                    <th>User Name</th>
                    <th className="num">CPU</th>
                    <th className="num">Mem Usage</th>
                  </tr>
                </thead>
                <tbody>
                  {procs.map((p) => (
                    <tr
                      key={p.id}
                      className={sel === p.id ? "is-selected" : ""}
                      onClick={() => setSel(p.id)}
                    >
                      <td>{p.name}</td>
                      <td>{p.user}</td>
                      <td className="num">
                        {String(p.name === "System Idle Process" ? 100 - cpu : p.cpu).padStart(
                          2,
                          "0",
                        )}
                      </td>
                      <td className="num">{p.memK.toLocaleString()} K</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="tm-actions">
              <button
                className="xp-btn"
                disabled={!procs.some((p) => p.id === sel)}
                onClick={() => {
                  const p = procs.find((x) => x.id === sel);
                  if (p) endProcess(p);
                }}
              >
                End Process
              </button>
            </div>
          </>
        )}
        {tab === "perf" && (
          <div className="tm-perf">
            <fieldset className="xp-group">
              <legend>CPU Usage</legend>
              <div className="tm-meter">{cpu}%</div>
            </fieldset>
            <fieldset className="xp-group tm-grow">
              <legend>CPU Usage History</legend>
              <Graph values={cpuHist} />
            </fieldset>
            <fieldset className="xp-group">
              <legend>Memory</legend>
              <div className="tm-meter">{Math.round(memK / 1024)} MB</div>
            </fieldset>
            <fieldset className="xp-group tm-grow">
              <legend>Totals</legend>
              <p>Processes: {procs.length}</p>
              <p>Windows open: {appWins.length}</p>
              <p>Physical memory: 512 MB</p>
            </fieldset>
          </div>
        )}
      </div>
      <div className="xp-status">
        <span>Processes: {procs.length}</span>
        <span>CPU Usage: {cpu}%</span>
        <span>Commit Charge: {Math.round(memK / 1024)}M / 1246M</span>
      </div>
    </div>
  );
}
