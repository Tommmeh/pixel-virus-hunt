// Every program on the PC. To add an app: write a component taking { win } and add an entry here.
import type { ComponentType } from "react";
import { setAppCatalog, type Win } from "../system/windows";
import { Explorer } from "./explorer/Explorer";
import { Chat } from "./messenger/Chat";
import { Messenger } from "./messenger/Messenger";
import { WormPopup } from "../storylines/aaron/WormPopup";
import { Antivirus } from "./antivirus/Antivirus";
import { Mines } from "./mines/Mines";
import { MessageBox, RecycleBin } from "./misc/MessageBox";
import { ScamPopup } from "./misc/ScamPopup";
import { Notepad } from "./notepad/Notepad";
import { Settings } from "./settings/Settings";
import { TaskManager } from "./taskmgr/TaskManager";
import { Achievements } from "../scams/Achievements";
import { WebVoyager } from "./webvoyager/WebVoyager";

export interface AppProps {
  win: Win;
}

export interface AppDef {
  id: string;
  title: string;
  /** Key in components/icons.ts (or an emoji). */
  icon: string;
  /** Process name shown in Task Manager (null = part of explorer.exe). */
  process: string | null;
  memK?: number;
  w: number;
  h: number;
  component: ComponentType<AppProps>;
}

export const APPS: AppDef[] = [
  {
    id: "explorer",
    title: "My Computer",
    icon: "computer",
    process: null,
    w: 640,
    h: 440,
    component: Explorer,
  },
  {
    id: "webvoyager",
    title: "WebVoyager",
    icon: "browser",
    process: "webvoyager.exe",
    memK: 24_310,
    w: 860,
    h: 600,
    component: WebVoyager,
  },
  {
    id: "messenger",
    title: "PingMe Messenger",
    icon: "buddy",
    process: "pingme.exe",
    memK: 9_840,
    w: 300,
    h: 480,
    component: Messenger,
  },
  {
    id: "chat",
    title: "Conversation",
    icon: "buddy",
    process: "pingme.exe",
    w: 460,
    h: 420,
    component: Chat,
  },
  {
    id: "taskmgr",
    title: "VirusHuntOS Task Manager",
    icon: "taskmgr",
    process: "taskmgr.exe",
    memK: 3_120,
    w: 470,
    h: 460,
    component: TaskManager,
  },
  {
    id: "settings",
    title: "Control Panel",
    icon: "gear",
    process: "rundll32.exe",
    memK: 2_870,
    w: 440,
    h: 500,
    component: Settings,
  },
  {
    id: "notepad",
    title: "Untitled - Notepad",
    icon: "notepad",
    process: "notepad.exe",
    memK: 2_640,
    w: 520,
    h: 400,
    component: Notepad,
  },
  {
    id: "mines",
    title: "Mines",
    icon: "mine",
    process: "mines.exe",
    memK: 1_900,
    w: 236,
    h: 330,
    component: Mines,
  },
  {
    id: "recycle",
    title: "Recycle Bin",
    icon: "bin",
    process: null,
    w: 480,
    h: 320,
    component: RecycleBin,
  },
  {
    id: "achievements",
    title: "Achievements",
    icon: "medal",
    process: null,
    w: 540,
    h: 470,
    component: Achievements,
  },
  {
    id: "antivirus",
    title: "PaneGuard Antivirus",
    icon: "shield",
    process: "paneguard.exe",
    memK: 7_420,
    w: 520,
    h: 420,
    component: Antivirus,
  },
  {
    // Aaron's storyline: a PhotoWorm pop-up (many can be open at once, keyed "worm:<n>").
    id: "worm-popup",
    title: "Special Offer!",
    icon: "warning",
    process: "photoviewer.exe",
    memK: 3_300,
    w: 300,
    h: 200,
    component: WormPopup,
  },
  {
    id: "msgbox",
    title: "VirusHuntOS",
    icon: "info",
    process: null,
    w: 360,
    h: 170,
    component: MessageBox,
  },
  {
    id: "scampopup",
    title: "Advertisement",
    icon: "warning",
    process: "adware.exe",
    memK: 1_240,
    w: 340,
    h: 260,
    component: ScamPopup,
  },
];

export const getApp = (id: string) => APPS.find((a) => a.id === id);

setAppCatalog((id) => {
  const a = getApp(id);
  return a && { title: a.title, icon: a.icon, w: a.w, h: a.h };
});
