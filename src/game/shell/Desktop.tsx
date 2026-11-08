import { useState } from "react";
import { getApp } from "../apps/registry";
import { openPath } from "../apps/explorer/open";
import { MessengerService } from "../apps/messenger/MessengerService";
import { QuestFlow } from "./QuestFlow";
import { ScamPopups } from "./ScamPopups";
import { AaronService } from "../storylines/aaron/AaronService";
import { TutorialGuide } from "../tutorial/TutorialGuide";
import { startTutorial } from "../tutorial/store";
import { PixelIcon } from "../components/PixelIcon";
import { DESKTOP_DIR, ICON_FOR_KIND, MY_DOCUMENTS, joinPath, listDir, useFs } from "../system/fs";
import { resolveTheme, useSettings } from "../system/settings";
import { activeKey, useWindows, wm, type Win } from "../system/windows";
import { Balloons } from "./Balloons";
import { StartMenu } from "./StartMenu";
import { Taskbar } from "./Taskbar";
import { wallpaperUrl } from "./wallpaper";
import { WindowFrame } from "./WindowFrame";

interface Shortcut {
  id: string;
  label: string;
  icon: string;
  open: () => void;
}

const SHORTCUTS: Shortcut[] = [
  {
    id: "mycomputer",
    label: "My Computer",
    icon: "computer",
    open: () => wm.open("explorer", { path: "" }),
  },
  {
    id: "mydocs",
    label: "My Documents",
    icon: "folder",
    open: () => wm.open("explorer", { path: MY_DOCUMENTS }),
  },
  { id: "recycle", label: "Recycle Bin", icon: "bin", open: () => wm.open("recycle") },
  { id: "webvoyager", label: "WebVoyager", icon: "browser", open: () => wm.open("webvoyager") },
  { id: "pingme", label: "PingMe Messenger", icon: "buddy", open: () => wm.open("messenger") },
  { id: "mines", label: "Mines", icon: "mine", open: () => wm.open("mines") },
  { id: "paneguard", label: "PaneGuard", icon: "shield", open: () => wm.open("antivirus") },
  { id: "scout", label: "Scout's Tips", icon: "scout", open: startTutorial },
  {
    id: "achievements",
    label: "Achievements",
    icon: "medal",
    open: () => wm.open("achievements"),
  },
];

function AppView({ app, win }: { app: string; win: Win }) {
  const def = getApp(app);
  if (!def) return <p className="p-3">This program cannot be found.</p>;
  const C = def.component;
  return <C win={win} />;
}

export function Desktop() {
  const settings = useSettings();
  const wmState = useWindows();
  const { files } = useFs();
  const active = activeKey(wmState);
  const [startOpen, setStartOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const desktopFiles: Shortcut[] = listDir(DESKTOP_DIR, files).map((n) => {
    const path = joinPath(DESKTOP_DIR, n.name);
    return {
      id: `file:${path}`,
      label: n.name,
      icon: n.type === "folder" ? "folder" : ICON_FOR_KIND[n.kind],
      open: () => openPath(path),
    };
  });

  return (
    <div
      className="os desktop"
      data-theme={resolveTheme(settings.theme)}
      data-wallpaper={settings.wallpaper}
      style={{ backgroundImage: wallpaperUrl(settings.wallpaper) ?? undefined }}
      onPointerDown={() => {
        setStartOpen(false);
        setSelected(null);
      }}
    >
      <div className="desk-icons" data-tour="desktop-icons">
        {[...SHORTCUTS, ...desktopFiles].map((s) => (
          <button
            key={s.id}
            data-tour={`icon-${s.id}`}
            className={`desk-icon ${selected === s.id ? "is-selected" : ""}`}
            onPointerDown={(e) => {
              e.stopPropagation();
              setSelected(s.id);
              setStartOpen(false);
            }}
            onDoubleClick={s.open}
            onKeyDown={(e) => e.key === "Enter" && s.open()}
          >
            <PixelIcon name={s.icon} size={40} />
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      <div className="win-layer">
        {wmState.wins
          .filter((w) => !w.min)
          .map((w) => (
            <WindowFrame key={w.key} win={w} active={active === w.key} dialog={w.app === "msgbox"}>
              <AppView app={w.app} win={w} />
            </WindowFrame>
          ))}
      </div>

      {startOpen && <StartMenu onClose={() => setStartOpen(false)} />}
      <Balloons />
      <MessengerService />
      <QuestFlow />
      <ScamPopups />
      <AaronService />
      <TutorialGuide />
      <Taskbar startOpen={startOpen} onStart={() => setStartOpen((o) => !o)} />
    </div>
  );
}
