import { useEffect, useState } from "react";
import {
  DESKTOP_DIR,
  MY_DOCUMENTS,
  baseName,
  isWritableDir,
  joinPath,
  listDir,
  parentPath,
  readFile,
  useFs,
  writeFile,
} from "../../system/fs";
import { Select } from "../../components/ui";
import { wm, type Win } from "../../system/windows";

type Menu = "file" | "format" | "help" | null;
type Panel = "open" | "saveas" | null;

const SAVE_DIRS = [
  { label: "My Documents", path: MY_DOCUMENTS },
  { label: "Desktop", path: DESKTOP_DIR },
];

export function Notepad({ win }: { win: Win }) {
  const { files } = useFs();
  const [path, setPath] = useState<string | null>(win.args?.["path"] ?? null);
  const [text, setText] = useState(() => (path ? (readFile(path) ?? "") : ""));
  const [saved, setSaved] = useState(text);
  const [wrap, setWrap] = useState(true);
  const [menu, setMenu] = useState<Menu>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [saveName, setSaveName] = useState("Untitled.txt");
  const [saveDir, setSaveDir] = useState(MY_DOCUMENTS);

  const name = path ? baseName(path) : "Untitled";
  useEffect(() => {
    wm.setTitle(win.key, `${name}${text !== saved ? "*" : ""} - Notepad`);
  }, [name, text, saved, win.key]);

  const load = (p: string | null) => {
    const content = p ? (readFile(p) ?? "") : "";
    setPath(p);
    setText(content);
    setSaved(content);
    setPanel(null);
  };

  const saveTo = (p: string) => {
    if (!writeFile(p, text)) {
      wm.alert({
        title: "Notepad",
        text: `Cannot save '${baseName(p)}'.\n\nAccess is denied. Try saving it in My Documents.`,
        icon: "error",
      });
      return false;
    }
    setPath(p);
    setSaved(text);
    setPanel(null);
    return true;
  };

  const save = () => {
    if (path && isWritableDir(parentPath(path))) saveTo(path);
    else {
      setSaveName(path ? baseName(path) : "Untitled.txt");
      setPanel("saveas");
    }
  };

  const textFiles = [MY_DOCUMENTS, DESKTOP_DIR].flatMap((dir) =>
    listDir(dir, files)
      .filter((n) => n.type === "file" && n.kind === "text")
      .map((n) => joinPath(dir, n.name)),
  );

  const item = (label: string, fn: () => void, hotkey?: string) => (
    <button
      className="menu-item"
      onClick={() => {
        setMenu(null);
        fn();
      }}
    >
      <span>{label}</span>
      {hotkey && <small>{hotkey}</small>}
    </button>
  );

  return (
    <div className="notepad" onPointerDown={() => menu && setMenu(null)}>
      <div className="os-menubar" onPointerDown={(e) => e.stopPropagation()}>
        {(["file", "format", "help"] as const).map((m) => (
          <div key={m} className="menu-root">
            <button
              className={`menu-btn ${menu === m ? "is-open" : ""}`}
              onClick={() => setMenu(menu === m ? null : m)}
            >
              {m[0]!.toUpperCase() + m.slice(1)}
            </button>
            {menu === m && (
              <div className="menu-drop">
                {m === "file" && (
                  <>
                    {item("New", () => load(null), "Ctrl+N")}
                    {item("Open...", () => setPanel("open"), "Ctrl+O")}
                    {item("Save", save, "Ctrl+S")}
                    {item("Save As...", () => {
                      setSaveName(path ? baseName(path) : "Untitled.txt");
                      setPanel("saveas");
                    })}
                    <hr />
                    {item("Exit", () => wm.close(win.key))}
                  </>
                )}
                {m === "format" && item(`${wrap ? "✓ " : ""}Word Wrap`, () => setWrap((w) => !w))}
                {m === "help" &&
                  item("About Notepad", () =>
                    wm.alert({
                      title: "About Notepad",
                      text: "PaneOS Notepad\nVersion 5.1",
                      icon: "info",
                    }),
                  )}
              </div>
            )}
          </div>
        ))}
      </div>

      {panel === "open" && (
        <div className="np-panel">
          <b>Open a text file</b>
          {textFiles.length === 0 ? (
            <p>No text files in My Documents or on the Desktop.</p>
          ) : (
            <ul>
              {textFiles.map((p) => (
                <li key={p}>
                  <button className="link-btn" onClick={() => load(p)}>
                    {baseName(p)}
                  </button>{" "}
                  <small>({baseName(parentPath(p))})</small>
                </li>
              ))}
            </ul>
          )}
          <button className="nes-btn" onClick={() => setPanel(null)}>
            Cancel
          </button>
        </div>
      )}

      {panel === "saveas" && (
        <form
          className="np-panel"
          onSubmit={(e) => {
            e.preventDefault();
            const fname = saveName.trim().replace(/[\\/:*?"<>|]/g, "");
            if (!fname) return;
            saveTo(joinPath(saveDir, fname.includes(".") ? fname : `${fname}.txt`));
          }}
        >
          <b>Save As</b>
          <label>
            Save in:{" "}
            <Select value={saveDir} onChange={(e) => setSaveDir(e.target.value)}>
              {SAVE_DIRS.map((d) => (
                <option key={d.path} value={d.path}>
                  {d.label}
                </option>
              ))}
            </Select>
          </label>
          <label>
            File name:{" "}
            <input
              className="nes-input"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              autoFocus
            />
          </label>
          <span className="flex gap-2">
            <button className="nes-btn is-primary" type="submit">
              Save
            </button>
            <button className="nes-btn" type="button" onClick={() => setPanel(null)}>
              Cancel
            </button>
          </span>
        </form>
      )}

      <textarea
        className="np-text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.ctrlKey && e.key.toLowerCase() === "s") {
            e.preventDefault();
            save();
          }
        }}
        spellCheck={false}
        wrap={wrap ? "soft" : "off"}
        style={{ whiteSpace: wrap ? "pre-wrap" : "pre", overflowX: wrap ? "hidden" : "auto" }}
        aria-label="Text"
      />
    </div>
  );
}
