// SHARED CONTRACT — owned by Track A. Lets any app open other windows without importing Desktop.tsx.
import { createContext, useContext } from "react";

/** Arguments passed to an app window. `url` is used by the browser; add more keys as needed. */
export interface AppArgs {
  url?: string | undefined;
  [key: string]: string | undefined;
}

export interface DesktopApi {
  /** Open (or focus) an app window, e.g. openApp("browser", { url: "http://..." }). */
  openApp: (appId: string, args?: AppArgs) => void;
  /** Close an app window. */
  closeApp: (appId: string) => void;
  /** Open a window showing one scam's lure (used by desktop icons and anything else that needs it). */
  openLure: (scamId: string) => void;
}

const noop: DesktopApi = { openApp: () => {}, closeApp: () => {}, openLure: () => {} };

export const DesktopContext = createContext<DesktopApi>(noop);

export const useDesktop = () => useContext(DesktopContext);
