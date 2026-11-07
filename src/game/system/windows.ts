// Window manager: a pure reducer (unit-tested) + a `wm` API usable from anywhere.
import { emit } from "./events";
import { createStore } from "./store";

/** Arguments passed to an app window, e.g. { url } for the browser or { path } for Explorer/Notepad. */
export interface AppArgs {
  [key: string]: string | undefined;
}

export interface Win {
  /** Unique window id. Defaults to the app id (one window per app); apps can open several with custom keys. */
  key: string;
  app: string;
  title: string;
  icon: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  min: boolean;
  max: boolean;
  args?: AppArgs | undefined;
  /** Taskbar button flashing (e.g. unread message). */
  flash: boolean;
  /** Incremented to trigger a shake animation (messenger nudge). */
  shake: number;
}

export interface WmState {
  wins: Win[];
  z: number;
  seq: number;
}

export type WmAction =
  | {
      type: "OPEN";
      key: string;
      app: string;
      title: string;
      icon: string;
      w: number;
      h: number;
      args?: AppArgs | undefined;
      vw: number;
      vh: number;
    }
  | { type: "FOCUS" | "CLOSE" | "MINIMIZE" | "TASKBAR" | "TOGGLE_MAX" | "SHAKE"; key: string }
  | { type: "MOVE"; key: string; x: number; y: number }
  | { type: "RESIZE"; key: string; w: number; h: number }
  | { type: "SET_TITLE"; key: string; title: string }
  | { type: "FLASH"; key: string; on: boolean }
  | { type: "CLOSE_APP"; app: string }
  | { type: "CLOSE_ALL" };

export const TASKBAR_H = 40;
export const MIN_W = 220;
export const MIN_H = 140;

export const initialWm: WmState = { wins: [], z: 10, seq: 0 };

/** The focused window: highest z among non-minimized windows. */
export function activeKey(s: WmState): string | null {
  let best: Win | null = null;
  for (const w of s.wins) if (!w.min && (!best || w.z > best.z)) best = w;
  return best?.key ?? null;
}

const patch = (s: WmState, key: string, p: Partial<Win>): WmState => ({
  ...s,
  wins: s.wins.map((w) => (w.key === key ? { ...w, ...p } : w)),
});

export function wmReducer(s: WmState, a: WmAction): WmState {
  switch (a.type) {
    case "OPEN": {
      const z = s.z + 1;
      const existing = s.wins.find((w) => w.key === a.key);
      if (existing) {
        return {
          ...patch(s, a.key, { z, min: false, flash: false, args: a.args ?? existing.args }),
          z,
        };
      }
      const n = s.seq % 8;
      const w = Math.min(a.w, Math.max(MIN_W, a.vw - 20));
      const h = Math.min(a.h, Math.max(MIN_H, a.vh - TASKBAR_H - 20));
      const x = Math.max(0, Math.min(120 + n * 26, a.vw - w - 10));
      const y = Math.max(0, Math.min(30 + n * 26, a.vh - TASKBAR_H - h - 10));
      const win: Win = {
        key: a.key,
        app: a.app,
        title: a.title,
        icon: a.icon,
        x,
        y,
        w,
        h,
        z,
        min: false,
        max: false,
        args: a.args,
        flash: false,
        shake: 0,
      };
      return { wins: [...s.wins, win], z, seq: s.seq + 1 };
    }
    case "FOCUS": {
      if (activeKey(s) === a.key) return s;
      const z = s.z + 1;
      return { ...patch(s, a.key, { z, flash: false }), z };
    }
    case "CLOSE":
      return { ...s, wins: s.wins.filter((w) => w.key !== a.key) };
    case "CLOSE_APP":
      return { ...s, wins: s.wins.filter((w) => w.app !== a.app) };
    case "CLOSE_ALL":
      return { ...s, wins: [] };
    case "MINIMIZE":
      return patch(s, a.key, { min: true });
    case "TASKBAR": {
      const w = s.wins.find((x) => x.key === a.key);
      if (!w) return s;
      if (!w.min && activeKey(s) === a.key) return patch(s, a.key, { min: true });
      const z = s.z + 1;
      return { ...patch(s, a.key, { min: false, z, flash: false }), z };
    }
    case "TOGGLE_MAX": {
      const w = s.wins.find((x) => x.key === a.key);
      return w ? patch(s, a.key, { max: !w.max }) : s;
    }
    case "MOVE":
      return patch(s, a.key, { x: a.x, y: Math.max(0, a.y) });
    case "RESIZE":
      return patch(s, a.key, { w: Math.max(MIN_W, a.w), h: Math.max(MIN_H, a.h) });
    case "SET_TITLE":
      return patch(s, a.key, { title: a.title });
    case "FLASH":
      return patch(s, a.key, { flash: a.on });
    case "SHAKE": {
      const w = s.wins.find((x) => x.key === a.key);
      return w ? patch(s, a.key, { shake: w.shake + 1 }) : s;
    }
  }
}

// ---------------------------------------------------------------------------
// Runtime API

export interface AppDefaults {
  title: string;
  icon: string;
  w: number;
  h: number;
}

let catalog: (app: string) => AppDefaults | undefined = () => undefined;

/** Called once by apps/registry.ts so the window manager knows each app's default size/title. */
export function setAppCatalog(fn: (app: string) => AppDefaults | undefined) {
  catalog = fn;
}

export const windowStore = createStore<WmState>(null, initialWm);
export const useWindows = windowStore.use;

const dispatch = (a: WmAction) => windowStore.set((s) => wmReducer(s, a));

let alertSeq = 0;

export const wm = {
  /** Open (or focus) an app window. Use `opts.key` to allow several windows of the same app. */
  open(
    app: string,
    args?: AppArgs,
    opts: { key?: string | undefined; title?: string | undefined } = {},
  ) {
    const d = catalog(app) ?? { title: app, icon: "file", w: 480, h: 360 };
    const key = opts.key ?? app;
    const isNew = !windowStore.get().wins.some((w) => w.key === key);
    dispatch({
      type: "OPEN",
      key,
      app,
      title: opts.title ?? d.title,
      icon: d.icon,
      w: d.w,
      h: d.h,
      args,
      vw: typeof window === "undefined" ? 1280 : window.innerWidth,
      vh: typeof window === "undefined" ? 800 : window.innerHeight,
    });
    if (isNew && app !== "msgbox") emit({ type: "app.open", app });
    return key;
  },
  close: (key: string) => dispatch({ type: "CLOSE", key }),
  closeApp: (app: string) => dispatch({ type: "CLOSE_APP", app }),
  closeAll: () => dispatch({ type: "CLOSE_ALL" }),
  focus: (key: string) => dispatch({ type: "FOCUS", key }),
  minimize: (key: string) => dispatch({ type: "MINIMIZE", key }),
  taskbarClick: (key: string) => dispatch({ type: "TASKBAR", key }),
  toggleMax: (key: string) => dispatch({ type: "TOGGLE_MAX", key }),
  move: (key: string, x: number, y: number) => dispatch({ type: "MOVE", key, x, y }),
  resize: (key: string, w: number, h: number) => dispatch({ type: "RESIZE", key, w, h }),
  setTitle: (key: string, title: string) => dispatch({ type: "SET_TITLE", key, title }),
  flash: (key: string, on = true) => dispatch({ type: "FLASH", key, on }),
  shake: (key: string) => dispatch({ type: "SHAKE", key }),
  isOpen: (key: string) => windowStore.get().wins.some((w) => w.key === key),
  isActive: (key: string) => activeKey(windowStore.get()) === key,
  /** Show a PaneOS message box. */
  alert(opts: { title: string; text: string; icon?: "info" | "warning" | "error" }) {
    return wm.open(
      "msgbox",
      { text: opts.text, icon: opts.icon ?? "info" },
      { key: `msgbox:${++alertSeq}`, title: opts.title },
    );
  },
};
