// The disguised program on the USB stick. To the player it is just holiday_03.jpg opening in the
// Picture and Fax Viewer — until the "photo driver" it needs takes the machine down.
import { useEffect, useState } from "react";
import { PixelIcon } from "../../components/PixelIcon";
import { run } from "./story";

const NOTES: [number, string][] = [
  [0, "Opening holiday_03.jpg..."],
  [45, "Unsupported picture format."],
  [58, "Installing photo driver usbphoto.sys..."],
  [88, "Registering driver with Windows..."],
];

const noteFor = (pct: number) =>
  [...NOTES].reverse().find(([at]) => pct >= at)?.[1] ?? NOTES[0]![1];

export function PhotoExe() {
  const [pct, setPct] = useState(0);

  // The file is already running: the crash timer lives in story.ts, so closing the window is no escape.
  useEffect(() => {
    run();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setPct((p) => Math.min(100, p + 6)), 160);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="usb-exe">
      <div className="usb-exe-head">
        <PixelIcon name="image" size={40} />
        <div>
          <b>holiday_03.jpg</b>
          <p>Windows Picture and Fax Viewer</p>
        </div>
      </div>
      <div className="usb-exe-frame" aria-hidden>
        <span>{pct < 45 ? "Loading..." : "·"}</span>
      </div>
      <p className="usb-exe-note">{noteFor(pct)}</p>
      <progress className="nes-progress is-primary" value={pct} max={100} />
    </div>
  );
}
