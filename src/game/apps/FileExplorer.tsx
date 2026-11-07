import { useState } from "react";
import { FOLDERS, LEGIT_FILES, type Folder } from "../malware";
import { useGame } from "../state";
import { useInfectedComponents } from "./infected";

export function FileExplorer() {
  const { state, dispatch } = useGame();
  const comps = useInfectedComponents();
  const [folder, setFolder] = useState<Folder>("Desktop");
  const [sel, setSel] = useState<string | null>(null);
  const files = [
    ...LEGIT_FILES.filter((f) => f.folder === folder && !state.falseRemovals.includes(f.id)).map(
      (f) => ({ ...f, bad: false }),
    ),
    ...comps.flatMap((c) =>
      c.kind === "file" && c.folder === folder ? [{ ...c, bad: true }] : [],
    ),
  ];
  const del = () => {
    const f = files.find((x) => x.id === sel);
    if (!f) return;
    dispatch({ type: f.bad ? "REMOVE" : "REMOVE_LEGIT", id: f.id });
    setSel(null);
  };
  return (
    <div className="flex gap-3 text-[10px]">
      <ul className="explorer-tree">
        {FOLDERS.map((f) => (
          <li key={f.id}>
            <button
              className={`tree-btn ${folder === f.id ? "is-active" : ""}`}
              onClick={() => {
                setFolder(f.id);
                setSel(null);
              }}
            >
              [+] {f.id}
            </button>
          </li>
        ))}
      </ul>
      <div className="flex-1">
        <div className="address-bar">{FOLDERS.find((f) => f.id === folder)!.path}</div>
        <table className="xp-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Size</th>
            </tr>
          </thead>
          <tbody>
            {files.map((f) => (
              <tr
                key={f.id}
                className={sel === f.id ? "is-selected" : ""}
                onClick={() => setSel(f.id)}
              >
                <td>{f.name}</td>
                <td>{f.size}</td>
              </tr>
            ))}
            {files.length === 0 && (
              <tr>
                <td colSpan={2}>(empty)</td>
              </tr>
            )}
          </tbody>
        </table>
        <button
          className={`nes-btn is-error mt-3 ${sel ? "" : "is-disabled"}`}
          disabled={!sel}
          onClick={del}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
