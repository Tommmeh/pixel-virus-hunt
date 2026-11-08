import { useEffect, useState } from "react";
import { PixelIcon } from "../../components/PixelIcon";
import { emit } from "../../system/events";
import {
  DRIVES,
  DESKTOP_DIR,
  ICON_FOR_KIND,
  MY_COMPUTER,
  MY_DOCUMENTS,
  baseName,
  getDrive,
  isFolder,
  joinPath,
  listDir,
  normalizePath,
  parentPath,
  useFs,
} from "../../system/fs";
import { wm, type Win } from "../../system/windows";
import { openPath } from "./open";

function folderTitle(path: string) {
  if (path === MY_COMPUTER) return "My Computer";
  const parts = path.split("\\").filter(Boolean);
  if (parts.length === 1) {
    const d = getDrive(path)!;
    return `${d.label} (${d.letter})`;
  }
  return baseName(path);
}

const PLACES = [
  { label: "My Documents", icon: "folder", path: MY_DOCUMENTS },
  { label: "Desktop", icon: "computer", path: DESKTOP_DIR },
  { label: "My Computer", icon: "computer", path: MY_COMPUTER },
  { label: "KINGSTON (E:)", icon: "usb", path: "E:\\" },
];

export function Explorer({ win }: { win: Win }) {
  const { files } = useFs();
  const [path, setPath] = useState(normalizePath(win.args?.["path"] ?? MY_COMPUTER));
  const [back, setBack] = useState<string[]>([]);
  const [typed, setTyped] = useState(path);
  const [sel, setSel] = useState<string | null>(null);

  const go = (next: string, remember = true) => {
    const p = normalizePath(next);
    if (!isFolder(p)) {
      wm.alert({
        title: "Address Bar",
        text: `VirusHuntOS cannot find '${next}'. Check the spelling and try again.`,
        icon: "error",
      });
      setTyped(path);
      return;
    }
    if (remember && p !== path) setBack((b) => [...b, path]);
    setPath(p);
    setTyped(p || "My Computer");
    setSel(null);
    const parts = p.split("\\").filter(Boolean);
    if (parts.length === 1) emit({ type: "drive.open", drive: parts[0]! });
  };

  // Opening "My Documents" etc. while the window is already open navigates it.
  const args = win.args;
  useEffect(() => {
    if (args?.["path"] !== undefined) go(args["path"]);
  }, [args]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    wm.setTitle(win.key, folderTitle(path));
    setTyped(path || "My Computer");
  }, [path, win.key]);

  const items = path === MY_COMPUTER ? [] : listDir(path, files);

  return (
    <div className="explorer">
      <div className="os-toolbar">
        <button
          className="nes-btn is-small tool-btn"
          disabled={back.length === 0}
          onClick={() => {
            const prev = back[back.length - 1];
            if (prev === undefined) return;
            setBack((b) => b.slice(0, -1));
            go(prev, false);
          }}
        >
          ◀ Back
        </button>
        <button
          className="nes-btn is-small tool-btn"
          disabled={path === MY_COMPUTER}
          onClick={() => go(parentPath(path))}
        >
          ▲ Up
        </button>
      </div>
      <form
        className="os-address"
        onSubmit={(e) => {
          e.preventDefault();
          go(typed === "My Computer" ? MY_COMPUTER : typed);
        }}
      >
        <span>Address</span>
        <input
          className="nes-input"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          aria-label="Address"
        />
        <button className="nes-btn is-small" type="submit">
          Go
        </button>
      </form>
      <div className="explorer-main">
        <aside className="task-pane">
          <div className="task-box">
            <h4>Other Places</h4>
            {PLACES.filter((p) => p.path !== path).map((p) => (
              <button key={p.label} className="task-link" onClick={() => go(p.path)}>
                <PixelIcon name={p.icon} size={16} /> {p.label}
              </button>
            ))}
          </div>
          <div className="task-box">
            <h4>Details</h4>
            <p>
              <b>{folderTitle(path)}</b>
            </p>
            <p>{path === MY_COMPUTER ? "System Folder" : "File Folder"}</p>
          </div>
        </aside>
        <div className="explorer-view" onPointerDown={() => setSel(null)}>
          {path === MY_COMPUTER ? (
            <>
              <h3 className="view-group">Files Stored on This Computer</h3>
              <div className="icon-grid">
                <Item
                  label="My Documents"
                  icon="folder"
                  selected={sel === "docs"}
                  onSelect={() => setSel("docs")}
                  onOpen={() => go(MY_DOCUMENTS)}
                />
              </div>
              {(["hdd", "usb"] as const).map((kind) => (
                <div key={kind}>
                  <h3 className="view-group">
                    {kind === "hdd" ? "Hard Disk Drives" : "Devices with Removable Storage"}
                  </h3>
                  <div className="drive-grid">
                    {DRIVES.filter((d) => d.kind === kind).map((d) => (
                      <button
                        key={d.letter}
                        className={`drive-tile ${sel === d.letter ? "is-selected" : ""}`}
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          setSel(d.letter);
                        }}
                        onDoubleClick={() => go(`${d.letter}\\`)}
                      >
                        <PixelIcon name={kind === "hdd" ? "hdd" : "usb"} size={32} />
                        <span className="drive-info">
                          <span>
                            {d.label} ({d.letter})
                          </span>
                          <progress
                            className="nes-progress is-primary drive-bar"
                            value={Math.round(d.used * 100)}
                            max={100}
                          />
                          <small>
                            {d.free} free of {d.total}
                          </small>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </>
          ) : items.length === 0 ? (
            <p className="empty-note">This folder is empty.</p>
          ) : (
            <div className="icon-grid">
              {items.map((n) => {
                const p = joinPath(path, n.name);
                return (
                  <Item
                    key={n.name}
                    label={n.name}
                    icon={n.type === "folder" ? "folder" : ICON_FOR_KIND[n.kind]}
                    selected={sel === p}
                    onSelect={() => setSel(p)}
                    onOpen={() => (n.type === "folder" ? go(p) : openPath(p))}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
      <div className="os-status">
        {path === MY_COMPUTER ? `${DRIVES.length} drives` : `${items.length} object(s)`}
        {getDrive(path) && <span>Free space: {getDrive(path)!.free}</span>}
      </div>
    </div>
  );
}

function Item(props: {
  label: string;
  icon: string;
  selected: boolean;
  onSelect: () => void;
  onOpen: () => void;
}) {
  return (
    <button
      className={`file-icon ${props.selected ? "is-selected" : ""}`}
      onPointerDown={(e) => {
        e.stopPropagation();
        props.onSelect();
      }}
      onDoubleClick={props.onOpen}
      onKeyDown={(e) => e.key === "Enter" && props.onOpen()}
    >
      <PixelIcon name={props.icon} size={32} />
      <span>{props.label}</span>
    </button>
  );
}
