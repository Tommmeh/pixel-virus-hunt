import { useEffect, useState } from "react";
import { LEGIT_PROCESSES } from "../malware";
import { useGame } from "../state";
import { useInfectedComponents } from "./infected";
import { StartupPrograms } from "./StartupPrograms";

function Processes() {
  const { state, dispatch } = useGame();
  const comps = useInfectedComponents();
  const [sel, setSel] = useState<string | null>(null);
  const [jitter, setJitter] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setJitter((j) => (j + 1) % 7), 1500);
    return () => clearInterval(t);
  }, []);
  const procs = [
    ...LEGIT_PROCESSES.filter((p) => !state.falseRemovals.includes(p.id)).map((p) => ({
      ...p,
      bad: false,
    })),
    ...comps.flatMap((c) => (c.kind === "process" ? [{ ...c, bad: true }] : [])),
  ].sort((a, b) => a.name.localeCompare(b.name));
  const total = Math.min(100, procs.reduce((n, p) => n + p.cpu, 0) + jitter);
  const selected = procs.find((p) => p.id === sel);
  const end = () => {
    if (!selected) return;
    dispatch({ type: selected.bad ? "REMOVE" : "REMOVE_LEGIT", id: selected.id });
    setSel(null);
  };
  return (
    <div className="text-[10px]">
      <table className="xp-table">
        <thead>
          <tr>
            <th>Image Name</th>
            <th>User</th>
            <th>CPU</th>
            <th>Mem</th>
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
              <td>{String(p.cpu + (p.cpu > 10 ? jitter : 0)).padStart(2, "0")}</td>
              <td>{p.mem}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {selected && <p className="mt-2">Description: {selected.desc || "(none)"}</p>}
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex-1">
          <span>CPU Usage: {total}%</span>
          <progress
            className={`nes-progress ${total > 70 ? "is-error" : "is-success"}`}
            value={total}
            max={100}
            style={{ height: 18 }}
          />
        </div>
        <button
          className={`nes-btn is-error ${selected ? "" : "is-disabled"}`}
          onClick={end}
          disabled={!selected}
        >
          End Process
        </button>
      </div>
    </div>
  );
}

export function TaskManager() {
  const [tab, setTab] = useState<"proc" | "start">("proc");
  return (
    <div>
      <div className="mb-2 flex gap-2">
        <button
          className={`nes-btn btn-xs ${tab === "proc" ? "is-primary" : ""}`}
          onClick={() => setTab("proc")}
        >
          Processes
        </button>
        <button
          className={`nes-btn btn-xs ${tab === "start" ? "is-primary" : ""}`}
          onClick={() => setTab("start")}
        >
          Startup
        </button>
      </div>
      {tab === "proc" ? <Processes /> : <StartupPrograms />}
    </div>
  );
}
