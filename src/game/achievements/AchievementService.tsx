// Listens to every system event and hands out achievements (mounted on the desktop, off in the guided demo).
// A small tray toast says which one was earned.
import { playDing } from "../components/sound";
import { useSystemEvent } from "../system/events";
import { notify } from "../system/notify";
import { earn } from "./achievements";

export function AchievementService() {
  useSystemEvent((e) => {
    for (const a of earn(e)) {
      playDing();
      notify({
        title: "Achievement unlocked!",
        text: `${a.name}: ${a.description}`,
        icon: "medal",
        open: { app: "achievements" },
      });
    }
  });
  return null;
}
