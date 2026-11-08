// The GTA6 bar at the far right of the Favorites: a "leaked beta" .exe that installs a music video.
import { notify } from "../../system/notify";
import { createStore } from "../../system/store";
import { wm } from "../../system/windows";

export const GTA6_HOST = "www.gta6-beta.com";
export const GTA6_EXE = "GTA6_BETA.exe";

/**
 * Set once the installer has finished: the program gets a desktop shortcut. Session-only on purpose —
 * a restart (or logging off) forgets the prank, so the program is gone next time the PC comes up.
 */
export const gta6Store = createStore<{ installed: boolean }>(null, { installed: false });

/** Run the installer: the program lands on the PC and starts playing immediately. */
export function installGta6() {
  gta6Store.set((s) => ({ ...s, installed: true }));
  wm.open("rickroll");
  notify({
    title: "GTA6 BETA",
    text: `${GTA6_EXE} installed. There's a shortcut on your desktop.`,
    icon: "download",
    open: { app: "rickroll" },
  });
}
