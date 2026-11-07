// SHARED CONTRACT — owned by Track A. Every in-game app window is registered here.
// To add an app (e.g. Track D's Chat): add an entry; Desktop renders icon, Start menu item and window.
import type { ComponentType } from "react";
import type { AppArgs } from "../desktop-context";
import { Achievements } from "./Achievements";
import { Antivirus } from "./Antivirus";
import { Browser } from "./Browser";
import { EmailApp } from "./Email";
import { FileExplorer } from "./FileExplorer";
import { RecycleBin } from "./RecycleBin";
import { TaskManager } from "./TaskManager";
import { WifiPicker } from "./WifiPicker";

export interface AppProps {
  /** Arguments passed via openApp(id, args), e.g. { url } for the browser. */
  args?: AppArgs | undefined;
}

export interface AppDef {
  id: string;
  label: string;
  /** Key in components/icons.ts (or emoji). */
  icon: string;
  title: string;
  width: number;
  /** Show as a desktop icon + Start menu item. Hidden apps (e.g. Wi-Fi picker) are opened by code. */
  listed: boolean;
  component: ComponentType<AppProps>;
}

export const APPS: AppDef[] = [
  {
    id: "computer",
    label: "My Computer",
    icon: "computer",
    title: "My Computer",
    width: 600,
    listed: true,
    component: FileExplorer,
  },
  {
    id: "browser",
    label: "Internet",
    icon: "browser",
    title: "Internet Explorer",
    width: 580,
    listed: true,
    component: Browser,
  },
  {
    id: "email",
    label: "Email",
    icon: "mail",
    title: "HotPost Mail",
    width: 560,
    listed: true,
    component: EmailApp,
  },
  {
    id: "taskmgr",
    label: "Task Manager",
    icon: "taskmgr",
    title: "Windows Task Manager",
    width: 600,
    listed: true,
    component: TaskManager,
  },
  {
    id: "av",
    label: "Antivirus",
    icon: "shield",
    title: "AVGuard Antivirus",
    width: 460,
    listed: true,
    component: Antivirus,
  },
  {
    id: "bin",
    label: "Recycle Bin",
    icon: "bin",
    title: "Recycle Bin",
    width: 360,
    listed: true,
    component: RecycleBin,
  },
  {
    id: "achievements",
    label: "Achievements",
    icon: "trophy",
    title: "Achievements",
    width: 620,
    listed: true,
    component: Achievements,
  },
  {
    id: "wifi",
    label: "Wireless Networks",
    icon: "wifi",
    title: "Wireless Networks",
    width: 380,
    listed: false,
    component: WifiPicker,
  },
];

export const getApp = (id: string) => APPS.find((a) => a.id === id);
