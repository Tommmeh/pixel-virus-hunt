// The blue screen. It is a symptom, not a cure: the malware is already installed and starts with the
// next log-in. Restarting is the only thing this screen offers.
import { useEffect } from "react";
import { playError } from "../../components/sound";
import { setPhase } from "../../system/session";

const TEXT = `A problem has been detected and VirusHuntOS has been shut down to prevent
damage to your computer.

DRIVER_IRQL_NOT_LESS_OR_EQUAL

If this is the first time you've seen this Stop error screen, restart your
computer. If this screen appears again, follow these steps:

Check to make sure any new hardware or software is properly installed.
If this is a new installation, ask your hardware or software manufacturer
for any VirusHuntOS updates you might need.

If problems continue, disable or remove any newly installed hardware or
software. Disable BIOS memory options such as caching or shadowing.

Technical information:

*** STOP: 0x000000D1 (0x0000000C, 0x00000002, 0x00000000, 0xE1B4F00A)

***  usbphoto.sys - Address E1B4F00A base at E1B4F000, DateStamp 3f2a1c04

Beginning dump of physical memory
Physical memory dump complete.
Contact your system administrator or technical support group for further
assistance.`;

export function CrashScreen() {
  useEffect(() => {
    playError();
    const restart = () => setPhase("boot");
    const t = setTimeout(restart, 9_000);
    window.addEventListener("keydown", restart, { once: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", restart);
    };
  }, []);

  return (
    <div className="bsod" onClick={() => setPhase("boot")} role="alert">
      <p className="bsod-title">VIRUSHUNTOS</p>
      <p className="bsod-body">{TEXT}</p>
      <p className="bsod-foot">Press any key to restart your computer...</p>
    </div>
  );
}
