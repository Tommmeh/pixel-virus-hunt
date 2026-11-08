import { PixelIcon } from "../components/PixelIcon";
import { MY_DOCUMENTS } from "../system/fs";
import { logOff, turnOff } from "../system/session";
import { useSettings } from "../system/settings";
import { wm, type AppArgs } from "../system/windows";

interface Item {
  label: string;
  sub?: string;
  icon: string;
  app: string;
  args?: AppArgs;
}

const LEFT_PINNED: Item[] = [
  { label: "WebVoyager", sub: "Internet", icon: "browser", app: "webvoyager" },
  { label: "PingMe Messenger", sub: "Chat with friends", icon: "buddy", app: "messenger" },
];
const LEFT: Item[] = [
  { label: "Achievements", icon: "info", app: "achievements" },
  { label: "Notepad", icon: "notepad", app: "notepad" },
  { label: "Mines", icon: "mine", app: "mines" },
  { label: "Task Manager", icon: "taskmgr", app: "taskmgr" },
];
const RIGHT: Item[] = [
  { label: "My Documents", icon: "folder", app: "explorer", args: { path: MY_DOCUMENTS } },
  {
    label: "My Pictures",
    icon: "image",
    app: "explorer",
    args: { path: `${MY_DOCUMENTS}\\My Pictures` },
  },
  {
    label: "My Music",
    icon: "music",
    app: "explorer",
    args: { path: `${MY_DOCUMENTS}\\My Music` },
  },
  { label: "My Computer", icon: "computer", app: "explorer", args: { path: "" } },
];
const RIGHT_2: Item[] = [
  { label: "Control Panel", icon: "gear", app: "settings" },
  { label: "Search", icon: "search", app: "webvoyager", args: { url: "http://www.searchly.com/" } },
];

export function StartMenu({ onClose }: { onClose: () => void }) {
  const s = useSettings();
  const launch = (it: Item) => {
    onClose();
    wm.open(it.app, it.args);
  };
  const row = (it: Item, big = false) => (
    <button key={it.label} className={`sm-item ${big ? "is-big" : ""}`} onClick={() => launch(it)}>
      <PixelIcon name={it.icon} size={big ? 32 : 24} />
      <span className="sm-label">
        <b>{it.label}</b>
        {big && it.sub && <small>{it.sub}</small>}
      </span>
    </button>
  );
  return (
    <div className="start-menu" onPointerDown={(e) => e.stopPropagation()}>
      <div className="sm-head">
        <span className="sm-avatar">{s.avatar}</span>
        <span>{s.userName}</span>
      </div>
      <div className="sm-body">
        <div className="sm-left">
          {LEFT_PINNED.map((it) => row(it, true))}
          <hr />
          {LEFT.map((it) => row(it))}
        </div>
        <div className="sm-right">
          {RIGHT.map((it) => row(it))}
          <hr />
          {RIGHT_2.map((it) => row(it))}
        </div>
      </div>
      <div className="sm-foot">
        <button
          className="nes-btn is-small is-warning sm-power"
          onClick={() => {
            onClose();
            logOff();
          }}
        >
          Log Off
        </button>
        <button
          className="nes-btn is-small is-error sm-power"
          onClick={() => {
            onClose();
            turnOff();
          }}
        >
          Turn Off Computer
        </button>
      </div>
    </div>
  );
}
