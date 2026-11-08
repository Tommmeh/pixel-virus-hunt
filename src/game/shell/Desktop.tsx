import { useState, type CSSProperties } from "react";
import { getApp } from "../apps/registry";
import { openPath } from "../apps/explorer/open";
import { MessengerService } from "../apps/messenger/MessengerService";
import { QuestFlow } from "./QuestFlow";
import { ScamPopups } from "./ScamPopups";
import { ThreeDaysLater } from "./ThreeDaysLater";
import { useShake } from "./shake";
import { questStore } from "../system/quests";
import { AaronService } from "../storylines/aaron/AaronService";
import { SlowPc } from "../storylines/usb/SlowPc";
import { UsbService } from "../storylines/usb/UsbService";
import { afterLag } from "../system/health";
import { ZhumingService } from "../storylines/zhuming/ZhumingService";
import { useZhuming } from "../storylines/zhuming/story";
import { DemoGuide } from "../demo/DemoGuide";
import { useDemo } from "../demo/store";
import { AchievementService } from "../achievements/AchievementService";
import { VirusHud } from "./VirusHud";
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
  { id: "phone", label: "Phone", icon: "☎", open: () => wm.open("phone") },
  { id: "mines", label: "Mines", icon: "mine", open: () => wm.open("mines") },
  { id: "antivirus", label: "Antivirus", icon: "shield", open: () => wm.open("antivirus") },
  {
    id: "achievements",
    label: "Achievements",
    icon: "medal",
    open: () => wm.open("achievements"),
  },
];

/** Zhuming's storyline: StockLadder only gets a desktop icon once it has been installed. */
const STORY_SHORTCUT: Shortcut = {
  id: "stockladder",
  label: "StockLadder",
  icon: "trophy",
  open: () => wm.open("stockladder"),
};

const RBC_SHORTCUT: Shortcut = {
  id: "rbc",
  label: "RBC Online Banking",
  icon: "/rbc-logo.svg",
  open: () => wm.open("rbc"),
};

function AppView({ app, win }: { app: string; win: Win }) {
  const def = getApp(app);
  if (!def) return <p className="p-3">This program cannot be found.</p>;
  const C = def.component;
  return <C win={win} />;
}

export function Desktop() {
  const settings = useSettings();
  const demo = useDemo();
  const wmState = useWindows();
  const { files } = useFs();
  const active = activeKey(wmState);
  const [startOpen, setStartOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const { stage: storyStage } = useZhuming();
  const quake = useShake();
  const quaking = quake > 0;
  const rbcInstalled = questStore.use().rbcInstalled;

  const desktopFiles: Shortcut[] = listDir(DESKTOP_DIR, files).map((n) => {
    const path = joinPath(DESKTOP_DIR, n.name);
    return {
      id: `file:${path}`,
      label: n.name,
      icon: n.type === "folder" ? "folder" : ICON_FOR_KIND[n.kind],
      open: () => openPath(path),
    };
  });

  const storyShortcuts = storyStage === "installed" ? [STORY_SHORTCUT] : [];

  return (
    <div
      className={`os desktop${quaking ? " is-quaking" : ""}`}
      data-theme={resolveTheme(settings.theme)}
      data-wallpaper={settings.wallpaper}
      style={
        {
          backgroundImage: wallpaperUrl(settings.wallpaper) ?? undefined,
          "--quake": quake,
        } as CSSProperties
      }
      onPointerDown={() => {
        setStartOpen(false);
        setSelected(null);
      }}
    >
      <div className="desk-icons" data-tour="desktop-icons">
        {[
          ...SHORTCUTS,
          ...(rbcInstalled ? [RBC_SHORTCUT] : []),
          ...storyShortcuts,
          ...desktopFiles,
        ].map((s) => (
          <button
            key={s.id}
            data-tour={`icon-${s.id}`}
            className={`desk-icon ${selected === s.id ? "is-selected" : ""}`}
            onPointerDown={(e) => {
              e.stopPropagation();
              setSelected(s.id);
              setStartOpen(false);
            }}
            onDoubleClick={() => afterLag(s.open)}
            onKeyDown={(e) => e.key === "Enter" && afterLag(s.open)}
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
      {/* The score, front and centre: how many viruses the player has caught. */}
      <VirusHud />
      <Balloons />
      {/* The guided demo keeps the desktop quiet: only Aaron's PhotoWorm runs, narrated by Scout. */}
      {!demo && <MessengerService />}
      {!demo && <QuestFlow />}
      {!demo && <ScamPopups />}
      <ThreeDaysLater />
      <AaronService />
      <UsbService />
      <SlowPc />
      {!demo && <ZhumingService />}
      {!demo && <AchievementService />}
      {demo && <DemoGuide />}
      <Taskbar startOpen={startOpen} onStart={() => setStartOpen((o) => !o)} />
    </div>
  );
}
