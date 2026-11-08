// Runs while the desktop is up: reacts to PaneGuard removing the USB backdoor, and lets the infected
// PC complain about itself once the player has logged back in.
import { useEffect } from "react";
import { notify } from "../../system/notify";
import { useSystemEvent } from "../../system/events";
import { useIsSlow } from "../../system/health";
import { clean, THREAT_ID } from "./story";

export function UsbService() {
  const slow = useIsSlow();

  useSystemEvent((e) => {
    if (e.type === "threat.removed" && e.id === THREAT_ID) clean();
  });

  // After the crash the PC boots slowly and everything drags; a while later it says so itself.
  useEffect(() => {
    if (!slow) return;
    const t = setTimeout(
      () =>
        notify({
          title: "VirusHuntOS",
          text: "Your computer is low on virtual memory. Programs may stop responding.",
          icon: "warning",
          open: { app: "taskmgr" },
        }),
      7_000,
    );
    return () => clearTimeout(t);
  }, [slow]);

  return null;
}
